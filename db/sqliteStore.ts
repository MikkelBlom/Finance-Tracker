import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';
import { buildSeedCategories } from './seed';
import { defaultSettings } from './types';
import type { Category, Entry, Settings, Store, Direction } from './types';

type CategoryRow = {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type EntryRow = {
  id: string;
  amount_minor: number;
  direction: string;
  category_id: string | null;
  note: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function toCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    sortOrder: r.sort_order,
    archivedAt: r.archived_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
  };
}

function toEntry(r: EntryRow): Entry {
  return {
    id: r.id,
    amountMinor: r.amount_minor,
    direction: r.direction as Direction,
    categoryId: r.category_id,
    note: r.note,
    occurredAt: r.occurred_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
  };
}

/**
 * The only place in the app that speaks SQL. Everything above this reads and writes
 * plain objects, which is what lets the aggregation logic in lib/ stay pure and testable.
 */
export class SqliteStore implements Store {
  private db: SQLite.SQLiteDatabase | null = null;

  private get handle(): SQLite.SQLiteDatabase {
    if (!this.db) throw new Error('Store used before init()');
    return this.db;
  }

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('finance-tracker.db');
    await this.migrate();
    await this.seedIfEmpty();
  }

  private async migrate(): Promise<void> {
    const db = this.handle;
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const current = row?.user_version ?? 0;

    for (let version = current; version < MIGRATIONS.length; version++) {
      for (const statement of MIGRATIONS[version]) {
        await db.execAsync(statement);
      }
      // PRAGMA does not accept bound parameters, and the value is a loop index, not user input.
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    }
  }

  private async seedIfEmpty(): Promise<void> {
    const row = await this.handle.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM categories'
    );
    if ((row?.n ?? 0) > 0) return;
    for (const category of buildSeedCategories(new Date())) {
      await this.putCategory(category);
    }
  }

  async getCategories(): Promise<Category[]> {
    const rows = await this.handle.getAllAsync<CategoryRow>(
      'SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY sort_order ASC'
    );
    return rows.map(toCategory);
  }

  async putCategory(c: Category): Promise<void> {
    await this.handle.runAsync(
      `INSERT INTO categories (id, name, color, sort_order, archived_at, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         color = excluded.color,
         sort_order = excluded.sort_order,
         archived_at = excluded.archived_at,
         updated_at = excluded.updated_at,
         deleted_at = excluded.deleted_at`,
      [c.id, c.name, c.color, c.sortOrder, c.archivedAt, c.createdAt, c.updatedAt, c.deletedAt]
    );
  }

  async getEntries(): Promise<Entry[]> {
    const rows = await this.handle.getAllAsync<EntryRow>(
      'SELECT * FROM entries WHERE deleted_at IS NULL ORDER BY occurred_at DESC'
    );
    return rows.map(toEntry);
  }

  async putEntry(e: Entry): Promise<void> {
    await this.handle.runAsync(
      `INSERT INTO entries (id, amount_minor, direction, category_id, note, occurred_at, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         amount_minor = excluded.amount_minor,
         direction = excluded.direction,
         category_id = excluded.category_id,
         note = excluded.note,
         occurred_at = excluded.occurred_at,
         updated_at = excluded.updated_at,
         deleted_at = excluded.deleted_at`,
      [
        e.id, e.amountMinor, e.direction, e.categoryId, e.note,
        e.occurredAt, e.createdAt, e.updatedAt, e.deletedAt,
      ]
    );
  }

  async getSettings(): Promise<Settings> {
    const rows = await this.handle.getAllAsync<{ key: string; value: string | null }>(
      'SELECT key, value FROM settings'
    );
    const map = new Map(rows.map((r) => [r.key, r.value]));
    const budget = map.get('monthlyBudgetMinor');
    return {
      monthlyBudgetMinor: budget == null || budget === '' ? null : Number(budget),
    };
  }

  async putSettings(s: Settings): Promise<void> {
    await this.handle.runAsync(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      ['monthlyBudgetMinor', s.monthlyBudgetMinor == null ? null : String(s.monthlyBudgetMinor)]
    );
  }
}
