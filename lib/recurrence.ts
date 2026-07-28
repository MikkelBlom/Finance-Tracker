import type { Cycle, ScheduledItem } from '../db/types';

/**
 * Recurrence maths. Kept pure and separate because the awkward cases — a rent due on
 * the 31st in a 30-day month, a yearly item on 29 February — are exactly the sort of
 * thing that is easy to get wrong and easy to test.
 */

/** Runaway guard. No sane schedule produces this many occurrences in a projection window. */
const MAX_STEPS = 600;

function parse(dayKey: string): { y: number; m: number; d: number } {
  const [y, m, d] = dayKey.split('-').map(Number);
  return { y, m, d };
}

function format(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function daysIn(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

/**
 * The next occurrence after `dayKey`.
 *
 * `anchorDay` is the day-of-month the user originally chose. Carrying it forward stops
 * a bill due on the 31st from permanently sliding to the 28th after one trip through
 * February — the clamp applies to the short month only.
 */
export function advance(dayKey: string, cycle: Cycle, anchorDay: number): string {
  const { y, m, d } = parse(dayKey);

  if (cycle === 'weekly') {
    const next = new Date(y, m - 1, d + 7);
    return format(next.getFullYear(), next.getMonth() + 1, next.getDate());
  }

  const targetYear = cycle === 'yearly' ? y + 1 : m === 12 ? y + 1 : y;
  const targetMonth = cycle === 'yearly' ? m : m === 12 ? 1 : m + 1;
  return format(targetYear, targetMonth, Math.min(anchorDay, daysIn(targetYear, targetMonth)));
}

export function anchorDayOf(item: ScheduledItem): number {
  return parse(item.startsOn).d;
}

/**
 * The first occurrence on or after `fromKey`, given a user-chosen start date.
 * Used when creating an item so adding "rent, monthly, started in January" does not
 * suddenly post seven months of backdated rent.
 */
export function firstDueOnOrAfter(startsOn: string, cycle: Cycle, fromKey: string): string {
  const anchorDay = parse(startsOn).d;
  let due = startsOn;
  let steps = 0;
  while (due < fromKey && steps < MAX_STEPS) {
    due = advance(due, cycle, anchorDay);
    steps += 1;
  }
  return due;
}

/**
 * Moves an item's due date forward to the next occurrence on or after `fromKey`,
 * using the item's own anchor day rather than whatever day it happens to sit on now.
 *
 * Used when resuming a paused item: its due date has fallen behind, and resuming
 * should not fire off every payment that would have happened while it was paused.
 */
export function rollForward(item: ScheduledItem, fromKey: string): string {
  const anchorDay = anchorDayOf(item);
  let due = item.nextDueOn;
  let steps = 0;
  while (due < fromKey && steps < MAX_STEPS) {
    due = advance(due, item.cycle, anchorDay);
    steps += 1;
  }
  return due;
}

/**
 * Dates this item posts on, from its current nextDueOn through `toKey` inclusive.
 * Only ever looks forward — anything already due has been posted as a real entry.
 */
export function occurrencesUntil(item: ScheduledItem, toKey: string): string[] {
  if (item.pausedAt !== null || item.deletedAt !== null) return [];
  const anchorDay = anchorDayOf(item);
  const out: string[] = [];
  let due = item.nextDueOn;
  let steps = 0;
  while (due <= toKey && steps < MAX_STEPS) {
    out.push(due);
    due = advance(due, item.cycle, anchorDay);
    steps += 1;
  }
  return out;
}

/** Occurrences falling inside a window, used to mark up a calendar month. */
export function occurrencesBetween(item: ScheduledItem, fromKey: string, toKey: string): string[] {
  return occurrencesUntil(item, toKey).filter((day) => day >= fromKey);
}

/**
 * Everything due on or before today that has not posted yet, plus where nextDueOn
 * should land afterwards. Returning both keeps the caller's write atomic in intent:
 * post these, then store that.
 */
export function duePostings(
  item: ScheduledItem,
  todayKey: string
): { dueOn: string[]; nextDueOn: string } {
  if (item.pausedAt !== null || item.deletedAt !== null) {
    return { dueOn: [], nextDueOn: item.nextDueOn };
  }
  const anchorDay = anchorDayOf(item);
  const dueOn: string[] = [];
  let due = item.nextDueOn;
  let steps = 0;
  while (due <= todayKey && steps < MAX_STEPS) {
    dueOn.push(due);
    due = advance(due, item.cycle, anchorDay);
    steps += 1;
  }
  return { dueOn, nextDueOn: due };
}

/** Monthly-equivalent cost, so yearly and weekly items can share one total. */
export function monthlyEquivalentMinor(item: ScheduledItem): number {
  switch (item.cycle) {
    case 'weekly':
      // 52 weeks over 12 months, not 4 weeks per month — that would understate by 8%.
      return Math.round((item.amountMinor * 52) / 12);
    case 'yearly':
      return Math.round(item.amountMinor / 12);
    default:
      return item.amountMinor;
  }
}

export const CYCLE_LABELS: Record<Cycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};
