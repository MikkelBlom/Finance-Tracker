import { summariseMonth, entriesInMonth, entriesOnDay, sumMinor } from '../totals';
import type { Category, Entry } from '../../db/types';

function category(id: string, name: string, color = '#000000'): Category {
  return {
    id, name, color, sortOrder: 0, archivedAt: null,
    createdAt: '2026-07-01T00:00:00', updatedAt: '2026-07-01T00:00:00', deletedAt: null,
  };
}

function entry(
  id: string,
  amountMinor: number,
  occurredAt: string,
  categoryId: string | null = null,
  direction: 'in' | 'out' = 'out'
): Entry {
  return {
    id, amountMinor, direction, categoryId, note: null, occurredAt,
    scheduledItemId: null,
    createdAt: occurredAt, updatedAt: occurredAt, deletedAt: null,
  };
}

const groceries = category('c1', 'Groceries');
const transport = category('c2', 'Transport');
const categories = [groceries, transport];

const entries: Entry[] = [
  entry('e1', 24850, '2026-07-27T09:12:00', 'c1'),
  entry('e2', 52000, '2026-07-27T07:40:00', 'c2'),
  entry('e3', 10000, '2026-07-15T12:00:00', 'c1'),
  entry('e4', 2840000, '2026-07-27T06:00:00', null, 'in'),
  entry('e5', 9900, '2026-06-30T12:00:00', 'c1'), // previous month
];

describe('filtering', () => {
  it('selects a single month', () => {
    expect(entriesInMonth(entries, '2026-07').map((e) => e.id)).toEqual(['e1', 'e2', 'e3', 'e4']);
  });

  it('selects a single day', () => {
    expect(entriesOnDay(entries, '2026-07-27').map((e) => e.id)).toEqual(['e1', 'e2', 'e4']);
  });

  it('sums by direction', () => {
    expect(sumMinor(entriesInMonth(entries, '2026-07'), 'out')).toBe(86850);
    expect(sumMinor(entriesInMonth(entries, '2026-07'), 'in')).toBe(2840000);
  });
});

describe('summariseMonth', () => {
  const today = new Date(2026, 6, 27); // 27 July 2026

  it('keeps income out of the spend total', () => {
    const s = summariseMonth(entries, categories, null, '2026-07', today);
    expect(s.spentMinor).toBe(86850);
    expect(s.incomeMinor).toBe(2840000);
  });

  it('leaves budget figures null when no budget is set', () => {
    const s = summariseMonth(entries, categories, null, '2026-07', today);
    expect(s.leftMinor).toBeNull();
    expect(s.perDayMinor).toBeNull();
    expect(s.overBudget).toBe(false);
  });

  it('spreads what is left across the days remaining', () => {
    // 27 July of a 31-day month leaves 5 days including today.
    const s = summariseMonth(entries, categories, 100000, '2026-07', today);
    expect(s.daysLeft).toBe(5);
    expect(s.leftMinor).toBe(13150);
    expect(s.perDayMinor).toBe(2630);
  });

  it('flags going over budget and never suggests a negative daily allowance', () => {
    const s = summariseMonth(entries, categories, 50000, '2026-07', today);
    expect(s.overBudget).toBe(true);
    expect(s.leftMinor).toBe(-36850);
    expect(s.perDayMinor).toBe(0);
  });

  it('compares spend against how far through the month it is', () => {
    // 27/31 of the month gone. Spending 90% of a 100.000 budget is ahead of that pace.
    const ahead = summariseMonth(entries, categories, 96500, '2026-07', today);
    expect(ahead.aheadOfPace).toBe(true);
    const behind = summariseMonth(entries, categories, 500000, '2026-07', today);
    expect(behind.aheadOfPace).toBe(false);
  });

  it('ranks categories by spend and scales bars against the largest', () => {
    const s = summariseMonth(entries, categories, null, '2026-07', today);
    expect(s.byCategory.map((r) => [r.category?.name, r.minor])).toEqual([
      ['Transport', 52000],
      ['Groceries', 34850],
    ]);
    expect(s.byCategory[0].ratio).toBe(1);
    expect(s.byCategory[1].ratio).toBeCloseTo(34850 / 52000);
  });

  it('keeps uncategorised spending visible rather than dropping it', () => {
    const withOrphan = [...entries, entry('e6', 5000, '2026-07-20T10:00:00', null)];
    const s = summariseMonth(withOrphan, categories, null, '2026-07', today);
    const orphan = s.byCategory.find((r) => r.category === null);
    expect(orphan?.minor).toBe(5000);
  });

  it('treats a month in the past as fully elapsed', () => {
    const s = summariseMonth(entries, categories, 100000, '2026-06', today);
    expect(s.paceRatio).toBe(1);
    expect(s.daysLeft).toBe(30);
  });
});
