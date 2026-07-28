/**
 * Every row carries id / updatedAt / deletedAt because the ledger is append-only and
 * syncs last-write-wins. Nothing is ever hard-deleted once it could have reached
 * another device — a missing row is indistinguishable from a row not yet seen.
 */

export type Direction = 'out' | 'in';

export type Cycle = 'weekly' | 'monthly' | 'yearly';

export type Category = {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  /** Set when the user removes a category. Entries keep pointing at it, so history stays intact. */
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Entry = {
  id: string;
  /** Integer øre. Never a float. */
  amountMinor: number;
  direction: Direction;
  categoryId: string | null;
  note: string | null;
  /** Local ISO timestamp, e.g. 2026-07-27T09:12:00 */
  occurredAt: string;
  /**
   * Set when this entry was posted automatically by a scheduled item. Keeps recurring
   * costs out of the "what am I spending day to day" average, and makes it obvious in
   * the list where a figure came from.
   */
  scheduledItemId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

/**
 * A bill, subscription or salary that arrives on its own schedule. These are never
 * logged by hand — they post themselves on their due date and then advance.
 */
export type ScheduledItem = {
  id: string;
  name: string;
  amountMinor: number;
  direction: Direction;
  categoryId: string | null;
  cycle: Cycle;
  /** The first due date the user entered, YYYY-MM-DD. Fixes the day-of-month intent. */
  startsOn: string;
  /** The next date this will post, YYYY-MM-DD. Advances as it posts. */
  nextDueOn: string;
  /** Paused items keep their history and stop posting. */
  pausedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Settings = {
  /** null until the user sets one — the overview shows spend instead of "left" until then. */
  monthlyBudgetMinor: number | null;
  /** Manually entered account balance. With no bank feed, projection has to start somewhere. */
  balanceMinor: number | null;
  /** The date that balance was true, YYYY-MM-DD. Re-anchoring corrects accumulated drift. */
  balanceObservedOn: string | null;
};

export const defaultSettings: Settings = {
  monthlyBudgetMinor: null,
  balanceMinor: null,
  balanceObservedOn: null,
};

export interface Store {
  init(): Promise<void>;
  getCategories(): Promise<Category[]>;
  putCategory(category: Category): Promise<void>;
  getEntries(): Promise<Entry[]>;
  putEntry(entry: Entry): Promise<void>;
  getScheduledItems(): Promise<ScheduledItem[]>;
  putScheduledItem(item: ScheduledItem): Promise<void>;
  getSettings(): Promise<Settings>;
  putSettings(settings: Settings): Promise<void>;
}
