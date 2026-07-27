import type { Category, Entry } from '../db/types';
import { dayKeyOfIso, daysLeftInMonth, monthKeyOfIso, monthProgress } from './dates';

export type CategoryTotal = {
  category: Category | null;
  minor: number;
  /** Share of the largest category, for bar widths. */
  ratio: number;
};

export type MonthSummary = {
  monthKey: string;
  spentMinor: number;
  incomeMinor: number;
  budgetMinor: number | null;
  /** null when no budget is set. May go negative. */
  leftMinor: number | null;
  daysLeft: number;
  /** What's left divided by days remaining. null without a budget, floored at zero. */
  perDayMinor: number | null;
  /** Spend as a share of budget, 0..1 clamped for the bar. */
  spentRatio: number;
  /** How far through the month, 0..1 — the pace marker. */
  paceRatio: number;
  overBudget: boolean;
  /** True when spending is running ahead of the calendar. */
  aheadOfPace: boolean;
  byCategory: CategoryTotal[];
};

export function entriesInMonth(entries: Entry[], monthKey: string): Entry[] {
  return entries.filter((e) => monthKeyOfIso(e.occurredAt) === monthKey);
}

export function entriesOnDay(entries: Entry[], dayKey: string): Entry[] {
  return entries.filter((e) => dayKeyOfIso(e.occurredAt) === dayKey);
}

export function sumMinor(entries: Entry[], direction: 'in' | 'out'): number {
  return entries
    .filter((e) => e.direction === direction)
    .reduce((total, e) => total + e.amountMinor, 0);
}

/**
 * Everything the overview and insights screens need, computed in one pass over the
 * month's entries. Pure — no database, no dates beyond the `today` passed in — so
 * every branch here is testable.
 */
export function summariseMonth(
  entries: Entry[],
  categories: Category[],
  budgetMinor: number | null,
  monthKey: string,
  today: Date
): MonthSummary {
  const monthEntries = entriesInMonth(entries, monthKey);
  const spentMinor = sumMinor(monthEntries, 'out');
  const incomeMinor = sumMinor(monthEntries, 'in');

  const daysLeft = daysLeftInMonth(monthKey, today);
  const paceRatio = monthProgress(monthKey, today);

  const leftMinor = budgetMinor === null ? null : budgetMinor - spentMinor;
  const perDayMinor =
    leftMinor === null ? null : Math.max(0, Math.floor(leftMinor / Math.max(1, daysLeft)));

  const spentRatio =
    budgetMinor === null || budgetMinor === 0
      ? 0
      : Math.min(1, spentMinor / budgetMinor);

  const byId = new Map(categories.map((c) => [c.id, c]));
  const buckets = new Map<string, number>();
  for (const entry of monthEntries) {
    if (entry.direction !== 'out') continue;
    const key = entry.categoryId ?? '';
    buckets.set(key, (buckets.get(key) ?? 0) + entry.amountMinor);
  }

  const rows = [...buckets.entries()]
    .map(([id, minor]) => ({ category: byId.get(id) ?? null, minor, ratio: 0 }))
    .sort((a, b) => b.minor - a.minor);

  const largest = rows.length > 0 ? rows[0].minor : 0;
  for (const row of rows) {
    row.ratio = largest === 0 ? 0 : row.minor / largest;
  }

  return {
    monthKey,
    spentMinor,
    incomeMinor,
    budgetMinor,
    leftMinor,
    daysLeft,
    perDayMinor,
    spentRatio,
    paceRatio,
    overBudget: leftMinor !== null && leftMinor < 0,
    aheadOfPace:
      budgetMinor !== null && budgetMinor > 0 && spentMinor / budgetMinor > paceRatio,
    byCategory: rows,
  };
}
