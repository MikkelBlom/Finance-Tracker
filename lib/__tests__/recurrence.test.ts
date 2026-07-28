import {
  advance, duePostings, firstDueOnOrAfter, monthlyEquivalentMinor,
  occurrencesBetween, occurrencesUntil,
} from '../recurrence';
import type { Cycle, ScheduledItem } from '../../db/types';

function item(overrides: Partial<ScheduledItem> = {}): ScheduledItem {
  const merged: ScheduledItem = {
    id: 's1',
    name: 'Rent',
    amountMinor: 745000,
    direction: 'out',
    categoryId: null,
    cycle: 'monthly' as Cycle,
    startsOn: '2026-08-01',
    nextDueOn: '2026-08-01',
    pausedAt: null,
    createdAt: '2026-07-28T00:00:00',
    updatedAt: '2026-07-28T00:00:00',
    deletedAt: null,
    ...overrides,
  };
  // startsOn is what fixes the day-of-month, and the app always keeps the two in step.
  // Letting a fixture drift apart would test a state that cannot occur.
  if (overrides.nextDueOn && !overrides.startsOn) merged.startsOn = overrides.nextDueOn;
  return merged;
}

describe('advance', () => {
  it('steps a week forward, across a month boundary', () => {
    expect(advance('2026-07-28', 'weekly', 28)).toBe('2026-08-04');
  });

  it('steps a month forward', () => {
    expect(advance('2026-08-01', 'monthly', 1)).toBe('2026-09-01');
  });

  it('rolls over the end of the year', () => {
    expect(advance('2026-12-15', 'monthly', 15)).toBe('2027-01-15');
    expect(advance('2026-12-15', 'yearly', 15)).toBe('2027-12-15');
  });

  it('clamps into a short month but recovers afterwards', () => {
    // The bug this guards against: a bill due on the 31st sliding permanently to the
    // 28th after one trip through February.
    const feb = advance('2026-01-31', 'monthly', 31);
    expect(feb).toBe('2026-02-28');
    expect(advance(feb, 'monthly', 31)).toBe('2026-03-31');
  });

  it('handles a yearly item dated 29 February', () => {
    expect(advance('2028-02-29', 'yearly', 29)).toBe('2029-02-28');
    // Still anchored to the 29th, so it returns to it at the next leap year.
    expect(advance('2031-02-28', 'yearly', 29)).toBe('2032-02-29');
  });
});

describe('firstDueOnOrAfter', () => {
  it('leaves a future date alone', () => {
    expect(firstDueOnOrAfter('2026-08-01', 'monthly', '2026-07-28')).toBe('2026-08-01');
  });

  it('rolls a past start date forward instead of backfilling', () => {
    // Adding "rent, monthly, since January" must not post seven months of rent.
    expect(firstDueOnOrAfter('2026-01-01', 'monthly', '2026-07-28')).toBe('2026-08-01');
  });

  it('returns today when today is the due date', () => {
    expect(firstDueOnOrAfter('2026-07-28', 'monthly', '2026-07-28')).toBe('2026-07-28');
  });
});

describe('occurrences', () => {
  it('lists every date up to the horizon', () => {
    expect(occurrencesUntil(item(), '2026-11-15')).toEqual([
      '2026-08-01', '2026-09-01', '2026-10-01', '2026-11-01',
    ]);
  });

  it('returns nothing for a paused item', () => {
    expect(occurrencesUntil(item({ pausedAt: '2026-07-28T00:00:00' }), '2026-12-01')).toEqual([]);
  });

  it('windows to a month for the calendar', () => {
    const weekly = item({ cycle: 'weekly', startsOn: '2026-08-03', nextDueOn: '2026-08-03' });
    expect(occurrencesBetween(weekly, '2026-09-01', '2026-09-30')).toEqual([
      '2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28',
    ]);
  });
});

describe('duePostings', () => {
  it('posts nothing when the due date is still ahead', () => {
    expect(duePostings(item(), '2026-07-28')).toEqual({ dueOn: [], nextDueOn: '2026-08-01' });
  });

  it('catches up everything missed while the app was closed', () => {
    const weekly = item({ cycle: 'weekly', startsOn: '2026-07-01', nextDueOn: '2026-07-01' });
    const result = duePostings(weekly, '2026-07-28');
    expect(result.dueOn).toEqual(['2026-07-01', '2026-07-08', '2026-07-15', '2026-07-22']);
    expect(result.nextDueOn).toBe('2026-07-29');
  });

  it('includes an item due today', () => {
    const result = duePostings(item({ nextDueOn: '2026-07-28' }), '2026-07-28');
    expect(result.dueOn).toEqual(['2026-07-28']);
    expect(result.nextDueOn).toBe('2026-08-28');
  });

  it('never posts for a paused item', () => {
    const paused = item({ nextDueOn: '2026-01-01', pausedAt: '2026-07-01T00:00:00' });
    expect(duePostings(paused, '2026-07-28').dueOn).toEqual([]);
  });
});

describe('monthlyEquivalentMinor', () => {
  it('leaves monthly alone', () => {
    expect(monthlyEquivalentMinor(item({ amountMinor: 11900 }))).toBe(11900);
  });

  it('spreads a yearly cost', () => {
    expect(monthlyEquivalentMinor(item({ cycle: 'yearly', amountMinor: 79900 }))).toBe(6658);
  });

  it('uses 52 weeks a year, not four weeks a month', () => {
    // 4x/month would understate a weekly cost by about 8%.
    expect(monthlyEquivalentMinor(item({ cycle: 'weekly', amountMinor: 10000 }))).toBe(43333);
  });
});
