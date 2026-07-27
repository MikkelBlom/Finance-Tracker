import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { getStore } from '../db';
import type { Category, Direction, Entry, Settings } from '../db/types';
import { defaultSettings } from '../db/types';
import { newId } from '../lib/id';
import { toIso } from '../lib/dates';
import { categoryPalette } from '../theme/tokens';

/**
 * Binds the store to React. Screens never touch db/ directly — they read the arrays
 * held here and call these actions, which keeps all persistence in one place.
 *
 * The whole ledger lives in memory. A few thousand rows over several years is nothing,
 * and it means every total is computed by a pure function in lib/ rather than by SQL.
 */

type NewEntry = {
  amountMinor: number;
  direction: Direction;
  categoryId: string | null;
  note?: string | null;
  occurredAt?: string;
};

type DataContextValue = {
  ready: boolean;
  categories: Category[];
  /** Categories still offered when logging — archived ones are excluded. */
  activeCategories: Category[];
  entries: Entry[];
  settings: Settings;
  categoryById: (id: string | null) => Category | null;

  addEntry: (input: NewEntry) => Promise<Entry>;
  updateEntry: (entry: Entry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  addCategory: (name: string) => Promise<void>;
  renameCategory: (id: string, name: string) => Promise<void>;
  recolourCategory: (id: string, color: string) => Promise<void>;
  archiveCategory: (id: string) => Promise<void>;
  restoreCategory: (id: string) => Promise<void>;

  setBudget: (minor: number | null) => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const store = useMemo(() => getStore(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await store.init();
      const [c, e, s] = await Promise.all([
        store.getCategories(), store.getEntries(), store.getSettings(),
      ]);
      if (cancelled) return;
      setCategories(c);
      setEntries(e);
      setSettings(s);
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [store]);

  const refreshCategories = useCallback(async () => {
    setCategories(await store.getCategories());
  }, [store]);

  const addEntry = useCallback(async (input: NewEntry): Promise<Entry> => {
    const now = toIso(new Date());
    const entry: Entry = {
      id: newId(),
      amountMinor: input.amountMinor,
      direction: input.direction,
      categoryId: input.categoryId,
      note: input.note ?? null,
      occurredAt: input.occurredAt ?? now,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await store.putEntry(entry);
    setEntries((prev) => [entry, ...prev].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1)));
    return entry;
  }, [store]);

  const updateEntry = useCallback(async (entry: Entry) => {
    const next = { ...entry, updatedAt: toIso(new Date()) };
    await store.putEntry(next);
    setEntries((prev) => prev.map((e) => (e.id === next.id ? next : e)));
  }, [store]);

  const deleteEntry = useCallback(async (id: string) => {
    const target = entries.find((e) => e.id === id);
    if (!target) return;
    // Soft delete — a hard delete cannot be distinguished from a row the other
    // device has not seen yet once sync exists.
    const stamp = toIso(new Date());
    await store.putEntry({ ...target, deletedAt: stamp, updatedAt: stamp });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, [entries, store]);

  const addCategory = useCallback(async (name: string) => {
    const stamp = toIso(new Date());
    const used = new Set(categories.map((c) => c.color));
    const colour =
      categoryPalette.find((c) => !used.has(c)) ??
      categoryPalette[categories.length % categoryPalette.length];
    await store.putCategory({
      id: newId(),
      name: name.trim(),
      color: colour,
      sortOrder: categories.length,
      archivedAt: null,
      createdAt: stamp,
      updatedAt: stamp,
      deletedAt: null,
    });
    await refreshCategories();
  }, [categories, refreshCategories, store]);

  const patchCategory = useCallback(async (id: string, patch: Partial<Category>) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    await store.putCategory({ ...target, ...patch, updatedAt: toIso(new Date()) });
    await refreshCategories();
  }, [categories, refreshCategories, store]);

  const renameCategory = useCallback(
    (id: string, name: string) => patchCategory(id, { name: name.trim() }),
    [patchCategory]
  );
  const recolourCategory = useCallback(
    (id: string, color: string) => patchCategory(id, { color }),
    [patchCategory]
  );
  /** Removal is non-destructive: entries keep their category and history stays correct. */
  const archiveCategory = useCallback(
    (id: string) => patchCategory(id, { archivedAt: toIso(new Date()) }),
    [patchCategory]
  );
  const restoreCategory = useCallback(
    (id: string) => patchCategory(id, { archivedAt: null }),
    [patchCategory]
  );

  const setBudget = useCallback(async (minor: number | null) => {
    const next: Settings = { ...settings, monthlyBudgetMinor: minor };
    await store.putSettings(next);
    setSettings(next);
  }, [settings, store]);

  const categoryById = useCallback(
    (id: string | null) => (id ? categories.find((c) => c.id === id) ?? null : null),
    [categories]
  );

  const activeCategories = useMemo(
    () => categories.filter((c) => c.archivedAt === null),
    [categories]
  );

  const value: DataContextValue = {
    ready, categories, activeCategories, entries, settings, categoryById,
    addEntry, updateEntry, deleteEntry,
    addCategory, renameCategory, recolourCategory, archiveCategory, restoreCategory,
    setBudget,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
