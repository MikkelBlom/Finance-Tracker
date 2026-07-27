import { buildSeedCategories } from './seed';
import { defaultSettings } from './types';
import type { Category, Entry, Settings, Store } from './types';

const KEY = 'finance-tracker/v1';

type Snapshot = {
  categories: Category[];
  entries: Entry[];
  settings: Settings;
};

/**
 * Browser-preview storage.
 *
 * expo-sqlite on web needs a WASM build plus COOP/COEP headers on the dev server,
 * which is a fragile dependency for what is currently the main iteration loop. The
 * browser is a design and flow preview, not the real PC client — that will talk to
 * the sync API — so a localStorage snapshot is enough here.
 *
 * The aggregation logic in lib/ operates on plain objects and is shared by both
 * drivers, so the only thing that differs between web and device is persistence.
 */
export class WebStore implements Store {
  private data: Snapshot = { categories: [], entries: [], settings: defaultSettings };

  async init(): Promise<void> {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Snapshot;
        this.data = {
          categories: parsed.categories ?? [],
          entries: parsed.entries ?? [],
          settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
        };
      } catch {
        // A corrupt snapshot is not worth crashing the app over — start clean.
        this.data = { categories: [], entries: [], settings: defaultSettings };
      }
    }
    if (this.data.categories.length === 0) {
      this.data.categories = buildSeedCategories(new Date());
      this.flush();
    }
  }

  private flush(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(KEY, JSON.stringify(this.data));
  }

  async getCategories(): Promise<Category[]> {
    return this.data.categories
      .filter((c) => c.deletedAt === null)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async putCategory(category: Category): Promise<void> {
    const i = this.data.categories.findIndex((c) => c.id === category.id);
    if (i >= 0) this.data.categories[i] = category;
    else this.data.categories.push(category);
    this.flush();
  }

  async getEntries(): Promise<Entry[]> {
    return this.data.entries
      .filter((e) => e.deletedAt === null)
      .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
  }

  async putEntry(entry: Entry): Promise<void> {
    const i = this.data.entries.findIndex((e) => e.id === entry.id);
    if (i >= 0) this.data.entries[i] = entry;
    else this.data.entries.push(entry);
    this.flush();
  }

  async getSettings(): Promise<Settings> {
    return this.data.settings;
  }

  async putSettings(settings: Settings): Promise<void> {
    this.data.settings = settings;
    this.flush();
  }
}
