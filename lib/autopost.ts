import type { Entry, ScheduledItem } from '../db/types';
import { duePostings } from './recurrence';

/**
 * Works out which scheduled items have come due and what should be written.
 *
 * Pure, so the awkward part — a phone left unopened for three weeks, or a monthly item
 * that should post twice — is testable without a database. The caller performs the
 * writes; advancing nextDueOn is what makes this safe to run on every app start.
 */
export function planAutoPost(
  scheduled: ScheduledItem[],
  todayKey: string,
  nowIso: string,
  makeId: () => string
): { entries: Entry[]; updatedItems: ScheduledItem[] } {
  const entries: Entry[] = [];
  const updatedItems: ScheduledItem[] = [];

  for (const item of scheduled) {
    const { dueOn, nextDueOn } = duePostings(item, todayKey);
    if (dueOn.length === 0) continue;

    for (const day of dueOn) {
      entries.push({
        id: makeId(),
        amountMinor: item.amountMinor,
        direction: item.direction,
        categoryId: item.categoryId,
        // The item's name is the most useful thing to see in the list.
        note: item.name,
        occurredAt: `${day}T00:00:00`,
        scheduledItemId: item.id,
        createdAt: nowIso,
        updatedAt: nowIso,
        deletedAt: null,
      });
    }

    updatedItems.push({ ...item, nextDueOn, updatedAt: nowIso });
  }

  return { entries, updatedItems };
}
