import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../../state/DataProvider';
import { Card, Eyebrow, EmptyState, Hero } from '../../components/ui';
import EntryRow from '../../components/EntryRow';
import { summariseMonth, entriesInMonth, entriesOnDay } from '../../lib/totals';
import { formatKr, formatWhole } from '../../lib/money';
import { monthLabel, toDayKey, toMonthKey } from '../../lib/dates';
import { colors, radius, space, SCROLL_BOTTOM_INSET } from '../../theme/tokens';

export default function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ready, entries, categories, settings, categoryById } = useData();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { deleteEntry } = useData();

  const today = useMemo(() => new Date(), []);
  const monthKey = toMonthKey(today);
  const todayKey = toDayKey(today);

  const summary = useMemo(
    () => summariseMonth(entries, categories, settings.monthlyBudgetMinor, monthKey, today),
    [entries, categories, settings.monthlyBudgetMinor, monthKey, today]
  );

  const todayEntries = useMemo(() => entriesOnDay(entries, todayKey), [entries, todayKey]);
  const earlierEntries = useMemo(
    () => entriesInMonth(entries, monthKey).filter((e) => !e.occurredAt.startsWith(todayKey)),
    [entries, monthKey, todayKey]
  );

  if (!ready) {
    return <View style={styles.loading} />;
  }

  const hasBudget = summary.budgetMinor !== null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.sm, paddingBottom: SCROLL_BOTTOM_INSET },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.appName}>Finance Tracker</Text>
        <Text style={styles.month}>{monthLabel(monthKey)}</Text>
      </View>

      <Card>
        {hasBudget ? (
          <>
            <Eyebrow>{summary.overBudget ? 'Over budget' : 'Left to spend'}</Eyebrow>
            <Hero value={formatWhole(Math.abs(summary.leftMinor ?? 0))} />
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.round(summary.spentRatio * 100)}%`,
                    backgroundColor: summary.overBudget ? colors.brick : colors.accent,
                  },
                ]}
              />
              <View style={[styles.pace, { left: `${Math.round(summary.paceRatio * 100)}%` }]} />
            </View>
            <Text style={styles.sub}>
              Spent <Text style={styles.subStrong}>{formatWhole(summary.spentMinor)} kr.</Text> of{' '}
              {formatWhole(summary.budgetMinor ?? 0)} kr. —{' '}
              {summary.aheadOfPace ? 'ahead of pace' : 'under pace'}
            </Text>
            <Text style={[styles.sub, { marginTop: 5 }]}>
              <Text style={styles.subStrong}>{formatWhole(summary.perDayMinor ?? 0)} kr./day</Text>{' '}
              for the {summary.daysLeft} {summary.daysLeft === 1 ? 'day' : 'days'} left
            </Text>
          </>
        ) : (
          <>
            <Eyebrow>Spent this month</Eyebrow>
            <Hero value={formatWhole(summary.spentMinor)} />
            <Pressable onPress={() => router.push('/(tabs)/more')} style={styles.budgetPrompt}>
              <Text style={styles.budgetPromptText}>
                Set a monthly budget to see what's left →
              </Text>
            </Pressable>
          </>
        )}
      </Card>

      <Card style={styles.listCard}>
        <Eyebrow>Today</Eyebrow>
        {todayEntries.length === 0 ? (
          <EmptyState
            title="Nothing logged today"
            body="Tap the plus button to add what you've spent. It takes about three seconds."
          />
        ) : (
          <View style={styles.list}>
            {todayEntries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                category={categoryById(entry.categoryId)}
                expanded={expandedId === entry.id}
                onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                onDelete={() => {
                  setExpandedId(null);
                  void deleteEntry(entry.id);
                }}
              />
            ))}
          </View>
        )}
      </Card>

      {earlierEntries.length > 0 ? (
        <Card style={styles.listCard}>
          <Eyebrow>Earlier this month</Eyebrow>
          <View style={styles.list}>
            {earlierEntries.slice(0, 12).map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                category={categoryById(entry.categoryId)}
                showDate
                expanded={expandedId === entry.id}
                onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                onDelete={() => {
                  setExpandedId(null);
                  void deleteEntry(entry.id);
                }}
              />
            ))}
          </View>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  loading: { flex: 1, backgroundColor: colors.ground },
  content: { paddingHorizontal: 14, gap: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  appName: { fontSize: 15, fontWeight: '600', color: colors.ink, letterSpacing: -0.2 },
  month: { fontSize: 13, color: colors.ink2, fontWeight: '500' },
  track: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.ground,
    marginTop: 13,
    marginBottom: 9,
    position: 'relative',
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4 },
  pace: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    width: 2,
    backgroundColor: colors.ink,
    opacity: 0.55,
  },
  sub: { fontSize: 12.5, color: colors.ink2 },
  subStrong: { color: colors.ink, fontWeight: '600' },
  budgetPrompt: { marginTop: 12 },
  budgetPromptText: { fontSize: 13, color: colors.accent, fontWeight: '600' },
  listCard: { paddingBottom: 6 },
  list: { marginTop: 4 },
});
