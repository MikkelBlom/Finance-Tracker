/**
 * Every row carries id / updatedAt / deletedAt because the ledger is append-only and
 * syncs last-write-wins. Nothing is ever hard-deleted once it could have reached
 * another device — a missing row is indistinguishable from a row not yet seen.
 */

export type Direction = 'out' | 'in';

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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Settings = {
  /** null until the user sets one — the overview shows spend instead of "left" until then. */
  monthlyBudgetMinor: number | null;
};

export const defaultSettings: Settings = {
  monthlyBudgetMinor: null,
};

export interface Store {
  init(): Promise<void>;
  getCategories(): Promise<Category[]>;
  putCategory(category: Category): Promise<void>;
  getEntries(): Promise<Entry[]>;
  putEntry(entry: Entry): Promise<void>;
  getSettings(): Promise<Settings>;
  putSettings(settings: Settings): Promise<void>;
}
