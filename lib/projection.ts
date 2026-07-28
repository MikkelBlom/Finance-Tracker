import type { Entry, ScheduledItem } from '../db/types';
import { occurrencesUntil } from './recurrence';
import { addDays, daysBetween, dayKeyOfIso } from './dates';

/**
 * Answers "how much will I have on the 20th".
 *
 * With no bank feed available, this starts from a balance the user typed in and walks
 * forward: what has already been logged since then, what is scheduled to land before
 * the target date, and an allowance for ordinary day-to-day spending.
 *
 * Re-anchoring the balance corrects any accumulated drift, so the cost of the estimate
 * being slightly wrong is bounded rather than compounding.
 */

export type Projection = {
  /** The headline figure. */
  projectedMinor: number;
  anchorMinor: number;
  anchorOn: string;
  /** Net effect of entries already logged since the anchor date. */
  loggedNetMinor: number;
  /** Net effect of scheduled items landing between today and the target. */
  scheduledNetMinor: number;
  /** Expected ordinary spending over the remaining days. An estimate, and labelled as one. */
  estimatedSpendMinor: number;
  /** Days from today to the target, zero if the target is not in the future. */
  daysAhead: number;
};

export type ProjectionInput = {
  anchorMinor: number;
  anchorOn: string;
  todayKey: string;
  targetKey: string;
  entries: Entry[];
  scheduled: ScheduledItem[];
  dailyVariableMinor: number;
};

function signed(amountMinor: number, direction: 'in' | 'out'): number {
  return direction === 'in' ? amountMinor : -amountMinor;
}

export function projectBalance(input: ProjectionInput): Projection {
  const { anchorMinor, anchorOn, todayKey, targetKey, entries, scheduled } = input;

  // Entries on the anchor day itself are assumed to be already reflected in the balance
  // the user read off their bank — only what came after it moves the number.
  let loggedNetMinor = 0;
  for (const entry of entries) {
    if (entry.deletedAt !== null) continue;
    const day = dayKeyOfIso(entry.occurredAt);
    if (day > anchorOn && day <= todayKey) {
      loggedNetMinor += signed(entry.amountMinor, entry.direction);
    }
  }

  // Anything already due has posted as a real entry and is counted above, so only
  // occurrences strictly after today are added here. No double counting.
  let scheduledNetMinor = 0;
  for (const item of scheduled) {
    for (const day of occurrencesUntil(item, targetKey)) {
      if (day > todayKey) {
        scheduledNetMinor += signed(item.amountMinor, item.direction);
      }
    }
  }

  const daysAhead = Math.max(0, daysBetween(todayKey, targetKey));
  const estimatedSpendMinor = Math.round(input.dailyVariableMinor * daysAhead);

  return {
    projectedMinor: anchorMinor + loggedNetMinor + scheduledNetMinor - estimatedSpendMinor,
    anchorMinor,
    anchorOn,
    loggedNetMinor,
    scheduledNetMinor,
    estimatedSpendMinor,
    daysAhead,
  };
}

/**
 * Typical day-to-day spending, used as the allowance for future days.
 *
 * Scheduled postings are excluded — rent is not evidence about how much you spend on
 * a normal Tuesday, and counting it here would double it, since the projection adds
 * scheduled items separately.
 *
 * The denominator is how many days of history actually exist, not the full window, so
 * a fresh install does not report a misleadingly tiny daily figure.
 */
export function estimateDailyVariableMinor(
  entries: Entry[],
  todayKey: string,
  lookbackDays = 30
): number {
  const windowStart = addDays(todayKey, -(lookbackDays - 1));

  let total = 0;
  let earliest: string | null = null;

  for (const entry of entries) {
    if (entry.deletedAt !== null) continue;
    if (entry.direction !== 'out') continue;
    if (entry.scheduledItemId !== null) continue;
    const day = dayKeyOfIso(entry.occurredAt);
    if (day < windowStart || day > todayKey) continue;
    total += entry.amountMinor;
    if (earliest === null || day < earliest) earliest = day;
  }

  if (earliest === null || total === 0) return 0;
  const days = Math.max(1, daysBetween(earliest, todayKey) + 1);
  return Math.round(total / days);
}

/** Scheduled money in and out landing on a given day, for the calendar's day view. */
export function scheduledOn(
  scheduled: ScheduledItem[],
  dayKey: string
): ScheduledItem[] {
  return scheduled.filter((item) => occurrencesUntil(item, dayKey).includes(dayKey));
}
