import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { getStore } from '../db';
import type { Category, Cycle, Direction, Entry, ScheduledItem, Settings } from '../db/types';
import { defaultSettings } from '../db/types';
import { newId } from '../lib/id';
import { toDayKey, toIso } from '../lib/dates';
import { firstDueOnOrAfter, rollForward } from '../lib/recurrence';
import { planAutoPost } from '../lib/autopost';
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

type NewScheduledItem = {
  name: string;
  amountMinor: number;
  direction: Direction;
  categoryId: string | null;
  cycle: Cycle;
  /** The next date it should post. No backfilling of dates already past. */
  nextDueOn: string;
};

type DataContextValue = {
  ready: boolean;
  categories: Category[];
  /** Categories still offered when logging — archived ones are excluded. */
  activeCategories: Category[];
  entries: Entry[];
  scheduled: ScheduledItem[];
  /** Scheduled items that are still posting. */
  activeScheduled: ScheduledItem[];
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

  addScheduledItem: (input: NewScheduledItem) => Promise<void>;
  updateScheduledItem: (item: ScheduledItem) => Promise<void>;
  pauseScheduledItem: (id: string) => Promise<void>;
  resumeScheduledItem: (id: string) => Promise<void>;
  deleteScheduledItem: (id: string) => Promise<void>;

  setBudget: (minor: number | null) => Promise<void>;
  setBalanceAnchor: (minor: number | null, observedOn: string | null) => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledItem[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const store = useMemo(() => getStore(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await store.init();
      const [loadedCategories, loadedEntries, loadedScheduled, loadedSettings] = await Promise.all([
        store.getCategories(), store.getEntries(), store.getScheduledItems(), store.getSettings(),
      ]);

      // Anything that came due while the app was closed posts now. Advancing nextDueOn
      // is persisted, so running this on every start cannot double-post.
      const now = new Date();
      const plan = planAutoPost(loadedScheduled, toDayKey(now), toIso(now), newId);
      for (const entry of plan.entries) await store.putEntry(entry);
      for (const item of plan.updatedItems) await store.putScheduledItem(item);

      if (cancelled) return;
      setCategories(loadedCategories);
      setEntries(
        plan.entries.length > 0
          ? [...plan.entries, ...loadedEntries].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
          : loadedEntries
      );
      setScheduled(
        plan.updatedItems.length === 0
          ? loadedScheduled
          : loadedScheduled.map((item) => plan.updatedItems.find((u) => u.id === item.id) ?? item)
      );
      setSettings(loadedSettings);
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [store]);

  const refreshCategories = useCallback(async () => {
    setCategories(await store.getCategories());
  }, [store]);

  const refreshScheduled = useCallback(async () => {
    setScheduled(await store.getScheduledItems());
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
      scheduledItemId: null,
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

  const addScheduledItem = useCallback(async (input: NewScheduledItem) => {
    const stamp = toIso(new Date());
    const todayKey = toDayKey(new Date());
    // If a past date is given, roll forward to the next real occurrence rather than
    // posting months of backdated charges the moment it is saved.
    const nextDueOn = firstDueOnOrAfter(input.nextDueOn, input.cycle, todayKey);
    await store.putScheduledItem({
      id: newId(),
      name: input.name.trim(),
      amountMinor: input.amountMinor,
      direction: input.direction,
      categoryId: input.categoryId,
      cycle: input.cycle,
      startsOn: input.nextDueOn,
      nextDueOn,
      pausedAt: null,
      createdAt: stamp,
      updatedAt: stamp,
      deletedAt: null,
    });
    await refreshScheduled();
  }, [refreshScheduled, store]);

  const patchScheduled = useCallback(async (id: string, patch: Partial<ScheduledItem>) => {
    const target = scheduled.find((s) => s.id === id);
    if (!target) return;
    await store.putScheduledItem({ ...target, ...patch, updatedAt: toIso(new Date()) });
    await refreshScheduled();
  }, [refreshScheduled, scheduled, store]);

  const updateScheduledItem = useCallback(async (item: ScheduledItem) => {
    await store.putScheduledItem({ ...item, updatedAt: toIso(new Date()) });
    await refreshScheduled();
  }, [refreshScheduled, store]);

  const pauseScheduledItem = useCallback(
    (id: string) => patchScheduled(id, { pausedAt: toIso(new Date()) }),
    [patchScheduled]
  );

  const resumeScheduledItem = useCallback(async (id: string) => {
    const target = scheduled.find((s) => s.id === id);
    if (!target) return;
    // While paused its due date fell behind. Roll forward so resuming does not fire off
    // every payment that would have happened in the meantime. Uses the item's own anchor
    // day, so a date that was clamped by a short month is not made permanent.
    const nextDueOn = rollForward(target, toDayKey(new Date()));
    await patchScheduled(id, { pausedAt: null, nextDueOn });
  }, [patchScheduled, scheduled]);

  const deleteScheduledItem = useCallback(
    (id: string) => patchScheduled(id, { deletedAt: toIso(new Date()) }),
    [patchScheduled]
  );

  const setBudget = useCallback(async (minor: number | null) => {
    const next: Settings = { ...settings, monthlyBudgetMinor: minor };
    await store.putSettings(next);
    setSettings(next);
  }, [settings, store]);

  const setBalanceAnchor = useCallback(
    async (minor: number | null, observedOn: string | null) => {
      const next: Settings = { ...settings, balanceMinor: minor, balanceObservedOn: observedOn };
      await store.putSettings(next);
      setSettings(next);
    },
    [settings, store]
  );

  const categoryById = useCallback(
    (id: string | null) => (id ? categories.find((c) => c.id === id) ?? null : null),
    [categories]
  );

  const activeCategories = useMemo(
    () => categories.filter((c) => c.archivedAt === null),
    [categories]
  );

  const activeScheduled = useMemo(
    () => scheduled.filter((s) => s.pausedAt === null && s.deletedAt === null),
    [scheduled]
  );

  const value: DataContextValue = {
    ready, categories, activeCategories, entries, scheduled, activeScheduled, settings, categoryById,
    addEntry, updateEntry, deleteEntry,
    addCategory, renameCategory, recolourCategory, archiveCategory, restoreCategory,
    addScheduledItem, updateScheduledItem, pauseScheduledItem, resumeScheduledItem, deleteScheduledItem,
    setBudget, setBalanceAnchor,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
