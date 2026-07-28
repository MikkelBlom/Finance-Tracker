import { estimateDailyVariableMinor, projectBalance, scheduledOn } from '../projection';
import { planAutoPost } from '../autopost';
import type { Entry, ScheduledItem } from '../../db/types';

function entry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'e1',
    amountMinor: 10000,
    direction: 'out',
    categoryId: null,
    note: null,
    occurredAt: '2026-07-25T12:00:00',
    scheduledItemId: null,
    createdAt: '2026-07-25T12:00:00',
    updatedAt: '2026-07-25T12:00:00',
    deletedAt: null,
    ...overrides,
  };
}

function scheduledItem(overrides: Partial<ScheduledItem> = {}): ScheduledItem {
  const merged: ScheduledItem = {
    id: 's1',
    name: 'Rent',
    amountMinor: 745000,
    direction: 'out',
    categoryId: null,
    cycle: 'monthly',
    startsOn: '2026-08-01',
    nextDueOn: '2026-08-01',
    pausedAt: null,
    createdAt: '2026-07-28T00:00:00',
    updatedAt: '2026-07-28T00:00:00',
    deletedAt: null,
    ...overrides,
  };
  // startsOn fixes the day-of-month, and the app always keeps the two in step.
  if (overrides.nextDueOn && !overrides.startsOn) merged.startsOn = overrides.nextDueOn;
  return merged;
}

const base = {
  anchorMinor: 1000000, // 10.000 kr.
  anchorOn: '2026-07-20',
  todayKey: '2026-07-28',
  dailyVariableMinor: 0,
};

describe('projectBalance', () => {
  it('applies what has been logged since the anchor', () => {
    const result = projectBalance({
      ...base,
      targetKey: '2026-07-28',
      entries: [
        entry({ id: 'a', amountMinor: 50000, direction: 'out', occurredAt: '2026-07-22T10:00:00' }),
        entry({ id: 'b', amountMinor: 200000, direction: 'in', occurredAt: '2026-07-25T10:00:00' }),
      ],
      scheduled: [],
    });
    expect(result.loggedNetMinor).toBe(150000);
    expect(result.projectedMinor).toBe(1150000);
  });

  it('ignores entries from before the anchor, and on the anchor day itself', () => {
    const result = projectBalance({
      ...base,
      targetKey: '2026-07-28',
      entries: [
        entry({ id: 'old', amountMinor: 99900, occurredAt: '2026-07-10T10:00:00' }),
        entry({ id: 'same-day', amountMinor: 99900, occurredAt: '2026-07-20T10:00:00' }),
      ],
      scheduled: [],
    });
    expect(result.loggedNetMinor).toBe(0);
  });

  it('adds scheduled items that land before the target', () => {
    const result = projectBalance({
      ...base,
      targetKey: '2026-08-02',
      entries: [],
      scheduled: [scheduledItem()],
    });
    expect(result.scheduledNetMinor).toBe(-745000);
    expect(result.projectedMinor).toBe(255000);
  });

  it('stops short of scheduled items beyond the target', () => {
    const result = projectBalance({
      ...base,
      targetKey: '2026-07-31',
      entries: [],
      scheduled: [scheduledItem()], // due 1 Aug
    });
    expect(result.scheduledNetMinor).toBe(0);
    expect(result.projectedMinor).toBe(1000000);
  });

  it('does not double count a scheduled item that already posted', () => {
    // The auto-posted entry counts through loggedNet; the rule's nextDueOn has moved on,
    // so the same charge must not also appear as a future occurrence.
    const posted = entry({
      id: 'posted', amountMinor: 745000, direction: 'out',
      occurredAt: '2026-07-25T00:00:00', scheduledItemId: 's1',
    });
    const result = projectBalance({
      ...base,
      targetKey: '2026-07-31',
      entries: [posted],
      scheduled: [scheduledItem({ nextDueOn: '2026-08-25' })],
    });
    expect(result.loggedNetMinor).toBe(-745000);
    expect(result.scheduledNetMinor).toBe(0);
    expect(result.projectedMinor).toBe(255000);
  });

  it('subtracts an allowance for ordinary spending on future days', () => {
    const result = projectBalance({
      ...base,
      dailyVariableMinor: 30000,
      targetKey: '2026-08-02', // 5 days ahead
      entries: [],
      scheduled: [],
    });
    expect(result.daysAhead).toBe(5);
    expect(result.estimatedSpendMinor).toBe(150000);
    expect(result.projectedMinor).toBe(850000);
  });

  it('treats a past target as no days ahead', () => {
    const result = projectBalance({
      ...base,
      dailyVariableMinor: 30000,
      targetKey: '2026-07-22',
      entries: [],
      scheduled: [],
    });
    expect(result.daysAhead).toBe(0);
    expect(result.estimatedSpendMinor).toBe(0);
  });

  it('skips deleted entries', () => {
    const result = projectBalance({
      ...base,
      targetKey: '2026-07-28',
      entries: [entry({ occurredAt: '2026-07-25T10:00:00', deletedAt: '2026-07-26T10:00:00' })],
      scheduled: [],
    });
    expect(result.loggedNetMinor).toBe(0);
  });
});

describe('estimateDailyVariableMinor', () => {
  it('excludes scheduled postings, which would otherwise inflate a normal day', () => {
    const entries = [
      entry({ id: 'a', amountMinor: 20000, occurredAt: '2026-07-26T10:00:00' }),
      entry({ id: 'b', amountMinor: 10000, occurredAt: '2026-07-28T10:00:00' }),
      entry({ id: 'rent', amountMinor: 745000, occurredAt: '2026-07-27T00:00:00', scheduledItemId: 's1' }),
    ];
    // 30.000 øre over the three days from the 26th to the 28th.
    expect(estimateDailyVariableMinor(entries, '2026-07-28')).toBe(10000);
  });

  it('ignores income', () => {
    const entries = [
      entry({ id: 'in', amountMinor: 2840000, direction: 'in', occurredAt: '2026-07-27T10:00:00' }),
    ];
    expect(estimateDailyVariableMinor(entries, '2026-07-28')).toBe(0);
  });

  it('returns zero with no history rather than guessing', () => {
    expect(estimateDailyVariableMinor([], '2026-07-28')).toBe(0);
  });

  it('divides by the days that actually have history, not the whole window', () => {
    // One 300 kr. day yesterday should read as ~300/day, not 300/30.
    const entries = [entry({ amountMinor: 30000, occurredAt: '2026-07-27T10:00:00' })];
    expect(estimateDailyVariableMinor(entries, '2026-07-28')).toBe(15000);
  });
});

describe('scheduledOn', () => {
  it('finds the items landing on a given day', () => {
    const rent = scheduledItem();
    const spotify = scheduledItem({ id: 's2', name: 'Spotify', nextDueOn: '2026-08-02' });
    expect(scheduledOn([rent, spotify], '2026-08-01').map((s) => s.name)).toEqual(['Rent']);
    expect(scheduledOn([rent, spotify], '2026-09-02').map((s) => s.name)).toEqual(['Spotify']);
  });
});

describe('planAutoPost', () => {
  let counter = 0;
  const makeId = () => `generated-${++counter}`;
  beforeEach(() => { counter = 0; });

  it('posts nothing when nothing is due', () => {
    const plan = planAutoPost([scheduledItem()], '2026-07-28', '2026-07-28T09:00:00', makeId);
    expect(plan.entries).toHaveLength(0);
    expect(plan.updatedItems).toHaveLength(0);
  });

  it('posts a due item and advances it, so a second run is a no-op', () => {
    const item = scheduledItem({ nextDueOn: '2026-07-28' });
    const plan = planAutoPost([item], '2026-07-28', '2026-07-28T09:00:00', makeId);

    expect(plan.entries).toHaveLength(1);
    expect(plan.entries[0]).toMatchObject({
      amountMinor: 745000,
      direction: 'out',
      note: 'Rent',
      occurredAt: '2026-07-28T00:00:00',
      scheduledItemId: 's1',
    });
    expect(plan.updatedItems[0].nextDueOn).toBe('2026-08-28');

    const second = planAutoPost(plan.updatedItems, '2026-07-28', '2026-07-28T09:01:00', makeId);
    expect(second.entries).toHaveLength(0);
  });

  it('catches up several missed periods at once', () => {
    const weekly = scheduledItem({
      cycle: 'weekly', name: 'Cleaner', amountMinor: 30000,
      startsOn: '2026-07-07', nextDueOn: '2026-07-07',
    });
    const plan = planAutoPost([weekly], '2026-07-28', '2026-07-28T09:00:00', makeId);
    expect(plan.entries.map((e) => e.occurredAt)).toEqual([
      '2026-07-07T00:00:00', '2026-07-14T00:00:00', '2026-07-21T00:00:00', '2026-07-28T00:00:00',
    ]);
    expect(plan.updatedItems[0].nextDueOn).toBe('2026-08-04');
  });
});
