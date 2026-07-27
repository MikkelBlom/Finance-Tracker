import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../state/DataProvider';
import { Card, Eyebrow, EmptyState, Hero } from '../../components/ui';
import { entriesInMonth, summariseMonth } from '../../lib/totals';
import { formatAmount, formatKr, formatWhole } from '../../lib/money';
import { monthLabel, shiftMonth, shortDate, toMonthKey } from '../../lib/dates';
import { colors, radius, space, SCROLL_BOTTOM_INSET } from '../../theme/tokens';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { entries, categories, settings, categoryById } = useData();

  const today = useMemo(() => new Date(), []);
  const [monthKey, setMonthKey] = useState(() => toMonthKey(today));

  const summary = useMemo(
    () => summariseMonth(entries, categories, settings.monthlyBudgetMinor, monthKey, today),
    [entries, categories, settings.monthlyBudgetMinor, monthKey, today]
  );

  const previous = useMemo(
    () => summariseMonth(entries, categories, null, shiftMonth(monthKey, -1), today),
    [entries, categories, monthKey, today]
  );

  const biggest = useMemo(
    () =>
      entriesInMonth(entries, monthKey)
        .filter((e) => e.direction === 'out')
        .sort((a, b) => b.amountMinor - a.amountMinor)
        .slice(0, 5),
    [entries, monthKey]
  );

  const delta = summary.spentMinor - previous.spentMinor;
  const hasPrevious = previous.spentMinor > 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.sm, paddingBottom: SCROLL_BOTTOM_INSET },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => setMonthKey(shiftMonth(monthKey, -1))} hitSlop={12}>
          <Text style={styles.nav}>←</Text>
        </Pressable>
        <Text style={styles.month}>{monthLabel(monthKey)}</Text>
        <Pressable
          onPress={() => setMonthKey(shiftMonth(monthKey, 1))}
          hitSlop={12}
          disabled={monthKey >= toMonthKey(today)}
        >
          <Text style={[styles.nav, monthKey >= toMonthKey(today) && styles.navOff]}>→</Text>
        </Pressable>
      </View>

      <Card>
        <Eyebrow>Spent</Eyebrow>
        <Hero value={formatWhole(summary.spentMinor)} />
        {hasPrevious ? (
          <Text style={styles.sub}>
            <Text style={[styles.delta, delta > 0 ? styles.deltaUp : styles.deltaDown]}>
              {delta > 0 ? '+' : '−'}{formatKr(Math.abs(delta))}
            </Text>{' '}
            vs {monthLabel(shiftMonth(monthKey, -1)).split(' ')[0]}
          </Text>
        ) : null}
        {summary.incomeMinor > 0 ? (
          <Text style={[styles.sub, { marginTop: 5 }]}>
            Income <Text style={styles.subStrong}>{formatKr(summary.incomeMinor)}</Text> — net{' '}
            <Text style={styles.subStrong}>
              {formatKr(summary.incomeMinor - summary.spentMinor)}
            </Text>
          </Text>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <Eyebrow>By category</Eyebrow>
        {summary.byCategory.length === 0 ? (
          <EmptyState
            title="Nothing to show yet"
            body="Log a few expenses and the breakdown appears here."
          />
        ) : (
          <View style={styles.bars}>
            {summary.byCategory.map((row) => (
              <View key={row.category?.id ?? 'none'} style={styles.barRow}>
                <Text style={styles.barName} numberOfLines={1}>
                  {row.category?.name ?? 'Uncategorised'}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.max(2, Math.round(row.ratio * 100))}%`,
                        backgroundColor: row.category?.color ?? colors.ink3,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barAmount}>{formatWhole(row.minor)}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {biggest.length > 0 ? (
        <Card style={styles.card}>
          <Eyebrow>Biggest this month</Eyebrow>
          <View style={styles.list}>
            {biggest.map((entry) => {
              const category = categoryById(entry.categoryId);
              return (
                <View key={entry.id} style={styles.bigRow}>
                  <Text style={styles.bigDate}>{shortDate(entry.occurredAt)}</Text>
                  <View
                    style={[styles.dot, { backgroundColor: category?.color ?? colors.ink3 }]}
                  />
                  <Text style={styles.bigName} numberOfLines={1}>
                    {entry.note?.trim() || category?.name || 'Uncategorised'}
                  </Text>
                  <Text style={styles.bigAmount}>{formatAmount(entry.amountMinor)}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  content: { paddingHorizontal: 14, gap: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  nav: { fontSize: 18, color: colors.accent },
  navOff: { color: colors.line },
  month: { fontSize: 15, fontWeight: '600', color: colors.ink },
  card: { gap: 2 },
  sub: { fontSize: 12.5, color: colors.ink2, marginTop: 7 },
  subStrong: { color: colors.ink, fontWeight: '600' },
  delta: { fontWeight: '700' },
  deltaUp: { color: colors.brick },
  deltaDown: { color: colors.accent },
  bars: { marginTop: 8, gap: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  barName: { width: 88, fontSize: 12.5, color: colors.ink },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 3,
    backgroundColor: colors.ground,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  barAmount: {
    width: 56,
    textAlign: 'right',
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  list: { marginTop: 6 },
  bigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  bigDate: { width: 46, fontSize: 11, color: colors.ink3 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  bigName: { flex: 1, fontSize: 13.5, color: colors.ink, fontWeight: '500' },
  bigAmount: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
});
