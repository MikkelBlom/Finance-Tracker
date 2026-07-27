import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Category, Entry } from '../db/types';
import { formatAmount, formatSigned } from '../lib/money';
import { shortDate, timeOfDay } from '../lib/dates';
import { colors, radius } from '../theme/tokens';

/**
 * Tapping a row reveals its delete action rather than opening a dialog — Alert is
 * not available on web, and an inline reveal is one tap either way.
 */
export default function EntryRow({
  entry, category, showDate, expanded, onToggle, onDelete,
}: {
  entry: Entry;
  category: Category | null;
  showDate?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const stamp = showDate ? shortDate(entry.occurredAt) : timeOfDay(entry.occurredAt);
  const isIncome = entry.direction === 'in';

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.row} onPress={onToggle} accessibilityRole="button">
        <Text style={styles.when}>{stamp}</Text>
        <View
          style={[
            styles.dot,
            { backgroundColor: isIncome ? colors.accent : category?.color ?? colors.ink3 },
          ]}
        />
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={1}>
            {entry.note?.trim() || category?.name || (isIncome ? 'Income' : 'Uncategorised')}
          </Text>
          {entry.note?.trim() && category ? (
            <Text style={styles.sub}>{category.name}</Text>
          ) : null}
        </View>
        <Text style={[styles.amount, isIncome && styles.amountIn]}>
          {isIncome ? formatSigned(entry.amountMinor, 'in') : formatAmount(entry.amountMinor)}
        </Text>
      </Pressable>

      {expanded ? (
        <View style={styles.actions}>
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            style={({ pressed }) => [styles.delete, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, borderTopColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10 },
  when: { width: 42, fontSize: 11, color: colors.ink3, fontVariant: ['tabular-nums'] },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '500', color: colors.ink },
  sub: { fontSize: 11.5, color: colors.ink3 },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  amountIn: { color: colors.accent },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 10 },
  delete: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.brick,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  deleteText: { color: colors.brick, fontSize: 12.5, fontWeight: '600' },
});
