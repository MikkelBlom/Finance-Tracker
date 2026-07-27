import { Platform } from 'react-native';
import { SqliteStore } from './sqliteStore';
import { WebStore } from './webStore';
import type { Store } from './types';

let instance: Store | null = null;

/**
 * SQLite on device — the source of truth. localStorage in the browser, which is
 * preview-only; see webStore.ts for why.
 */
export function getStore(): Store {
  if (!instance) {
    instance = Platform.OS === 'web' ? new WebStore() : new SqliteStore();
  }
  return instance;
}

export * from './types';
