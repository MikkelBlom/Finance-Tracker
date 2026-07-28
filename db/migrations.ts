/**
 * Schema changes ship as migrations — append a new array, never edit an existing one.
 * Applied in order and tracked by SQLite's own PRAGMA user_version.
 */
export const MIGRATIONS: string[][] = [
  // v1 — initial ledger
  [
    `CREATE TABLE IF NOT EXISTS categories (
      id          TEXT PRIMARY KEY NOT NULL,
      name        TEXT NOT NULL,
      color       TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      archived_at TEXT,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      deleted_at  TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS entries (
      id           TEXT PRIMARY KEY NOT NULL,
      amount_minor INTEGER NOT NULL,
      direction    TEXT NOT NULL,
      category_id  TEXT,
      note         TEXT,
      occurred_at  TEXT NOT NULL,
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL,
      deleted_at   TEXT
    );`,
    `CREATE INDEX IF NOT EXISTS idx_entries_occurred_at ON entries (occurred_at);`,
    `CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );`,
  ],

  // v2 — scheduled items, and the link from an auto-posted entry back to its rule
  [
    `CREATE TABLE IF NOT EXISTS scheduled_items (
      id           TEXT PRIMARY KEY NOT NULL,
      name         TEXT NOT NULL,
      amount_minor INTEGER NOT NULL,
      direction    TEXT NOT NULL,
      category_id  TEXT,
      cycle        TEXT NOT NULL,
      starts_on    TEXT NOT NULL,
      next_due_on  TEXT NOT NULL,
      paused_at    TEXT,
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL,
      deleted_at   TEXT
    );`,
    `ALTER TABLE entries ADD COLUMN scheduled_item_id TEXT;`,
    `CREATE INDEX IF NOT EXISTS idx_scheduled_next_due ON scheduled_items (next_due_on);`,
  ],
];
