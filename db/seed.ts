import { newId } from '../lib/id';
import { categoryPalette } from '../theme/tokens';
import type { Category } from './types';
import { toIso } from '../lib/dates';

/**
 * Eight starter categories, seeded on first run only. The user can rename, recolour,
 * reorder, add and archive freely afterwards — nothing here is fixed.
 *
 * Deliberately narrow: every extra category is another decision at the moment of
 * logging, which is exactly where friction kills the habit.
 */
const STARTERS = [
  'Groceries',
  'Eating out',
  'Transport',
  'Home & bills',
  'Subscriptions',
  'Fun',
  'Health',
  'Other',
];

export function buildSeedCategories(now: Date): Category[] {
  const iso = toIso(now);
  return STARTERS.map((name, i) => ({
    id: newId(),
    name,
    color: categoryPalette[i % categoryPalette.length],
    sortOrder: i,
    archivedAt: null,
    createdAt: iso,
    updatedAt: iso,
    deletedAt: null,
  }));
}
