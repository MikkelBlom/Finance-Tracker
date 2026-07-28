import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../../state/DataProvider';
import { Card, Eyebrow, Hero } from '../../components/ui';
import { formatKr, formatSigned, formatWhole } from '../../lib/money';
import {
  addDays, dayKeyOfIso, daysInMonth, firstDayOfMonth, lastDayOfMonth, longDate,
  mondayFirstWeekday, monthLabel, shiftMonth, shortDate, toDayKey, toMonthKey,
} from '../../lib/dates';
import { occurrencesBetween } from '../../lib/recurrence';
import { estimateDailyVariableMinor, projectBalance, scheduledOn } from '../../lib/projection';
import { colors, radius, space, SCROLL_BOTTOM_INSET } from '../../theme/tokens';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { entries, activeScheduled, settings, categoryById } = useData();

  const today = useMemo(() => new Date(), []);
  const todayKey = toDayKey(today);
  const [monthKey, setMonthKey] = useState(() => toMonthKey(today));
  const [selectedDay, setSelectedDay] = useState(todayKey);

  const hasAnchor = settings.balanceMinor !== null && settings.balanceObservedOn !== null;

  const dailyVariableMinor = useMemo(
    () => estimateDailyVariableMinor(entries, todayKey),
    [entries, todayKey]
  );

  const project = (targetKey: string) =>
    projectBalance({
      anchorMinor: settings.balanceMinor ?? 0,
      anchorOn: settings.balanceObservedOn ?? todayKey,
      todayKey,
      targetKey,
      entries,
      scheduled: activeScheduled,
      dailyVariableMinor,
    });

  const selectedProjection = useMemo(
    () => project(selectedDay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDay, entries, activeScheduled, settings, dailyVariableMinor, todayKey]
  );

  const monthAhead = useMemo(
    () => project(addDays(todayKey, 30)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, activeScheduled, settings, dailyVariableMinor, todayKey]
  );

  /** Which days show a marker, and in which direction. */
  const marks = useMemo(() => {
    const map = new Map<string, { in: boolean; out: boolean }>();
    const touch = (day: string, direction: 'in' | 'out') => {
      const current = map.get(day) ?? { in: false, out: false };
      if (direction === 'in') current.in = true;
      else current.out = true;
      map.set(day, current);
    };

    for (const entry of entries) {
      const day = dayKeyOfIso(entry.occurredAt);
      if (day.slice(0, 7) === monthKey) touch(day, entry.direction);
    }
    // Future days have no entries yet, so they are marked from the schedule instead.
    // Past days already posted as real entries and are covered by the loop above.
    for (const item of activeScheduled) {
      for (const day of occurrencesBetween(item, firstDayOfMonth(monthKey), lastDayOfMonth(monthKey))) {
        if (day > todayKey) touch(day, item.direction);
      }
    }
    return map;
  }, [entries, activeScheduled, monthKey, todayKey]);

  const cells = useMemo(() => {
    const lead = mondayFirstWeekday(firstDayOfMonth(monthKey));
    const total = daysInMonth(monthKey);
    const out: (string | null)[] = Array(lead).fill(null);
    for (let day = 1; day <= total; day++) {
      out.push(`${monthKey}-${String(day).padStart(2, '0')}`);
    }
    return out;
  }, [monthKey]);

  const dayEntries = useMemo(
    () => entries.filter((e) => dayKeyOfIso(e.occurredAt) === selectedDay),
    [entries, selectedDay]
  );
  const dayScheduled = useMemo(
    () => (selectedDay > todayKey ? scheduledOn(activeScheduled, selectedDay) : []),
    [activeScheduled, selectedDay, todayKey]
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.sm, paddingBottom: SCROLL_BOTTOM_INSET },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => setMonthKey(shiftMonth(monthKey, -1))}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Text style={styles.nav}>←</Text>
        </Pressable>
        <Text style={styles.month}>{monthLabel(monthKey)}</Text>
        <Pressable
          onPress={() => setMonthKey(shiftMonth(monthKey, 1))}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Text style={styles.nav}>→</Text>
        </Pressable>
      </View>

      {hasAnchor ? (
        <Card>
          <Eyebrow>
            {selectedDay === todayKey ? 'Balance today' : `Projected on ${longDate(selectedDay)}`}
          </Eyebrow>
          <Hero value={formatWhole(selectedProjection.projectedMinor)} />
          {selectedProjection.daysAhead > 0 ? (
            <View style={styles.breakdown}>
              {selectedProjection.scheduledNetMinor !== 0 ? (
                <Text style={styles.sub}>
                  Scheduled{' '}
                  <Text style={styles.subStrong}>
                    {selectedProjection.scheduledNetMinor > 0 ? '+' : '−'}
                    {formatWhole(Math.abs(selectedProjection.scheduledNetMinor))} kr.
                  </Text>
                </Text>
              ) : null}
              {selectedProjection.estimatedSpendMinor > 0 ? (
                <Text style={styles.sub}>
                  Usual spending, estimated{' '}
                  <Text style={styles.subStrong}>
                    −{formatWhole(selectedProjection.estimatedSpendMinor)} kr.
                  </Text>
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.sub}>
              From {formatKr(settings.balanceMinor ?? 0)} on {longDate(settings.balanceObservedOn!)}
            </Text>
          )}
        </Card>
      ) : (
        <Pressable
          onPress={() => router.push('/(tabs)/more')}
          accessibilityRole="button"
          accessibilityLabel="Set your account balance"
        >
          <Card style={styles.prompt}>
            <Eyebrow>Set your balance</Eyebrow>
            <Text style={styles.promptBody}>
              Projection needs a starting number. Type in what's actually in your account and
              everything below fills in.
            </Text>
            <Text style={styles.promptLink}>Set it in More →</Text>
          </Card>
        </Pressable>
      )}

      <Card style={styles.calendarCard}>
        <View style={styles.weekRow}>
          {WEEKDAYS.map((label, i) => (
            <Text key={`${label}-${i}`} style={styles.weekday}>{label}</Text>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((day, index) => {
            if (day === null) return <View key={`blank-${index}`} style={styles.cell} />;
            const mark = marks.get(day);
            const isSelected = day === selectedDay;
            const isToday = day === todayKey;
            return (
              <Pressable
                key={day}
                style={styles.cell}
                onPress={() => setSelectedDay(day)}
                accessibilityRole="button"
                accessibilityLabel={longDate(day)}
              >
                <View style={[styles.dayInner, isSelected && styles.daySelected]}>
                  <Text
                    style={[
                      styles.dayNumber,
                      isToday && !isSelected && styles.dayToday,
                      isSelected && styles.dayNumberSelected,
                    ]}
                  >
                    {Number(day.slice(8))}
                  </Text>
                  <View style={styles.dots}>
                    {mark?.in ? (
                      <View style={[styles.dot, isSelected ? styles.dotOnSelected : styles.dotIn]} />
                    ) : null}
                    {mark?.out ? (
                      <View style={[styles.dot, isSelected ? styles.dotOnSelected : styles.dotOut]} />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.legend}>
          <View style={[styles.dot, styles.dotIn]} />
          <Text style={styles.legendText}>In</Text>
          <View style={[styles.dot, styles.dotOut, { marginLeft: 12 }]} />
          <Text style={styles.legendText}>Out</Text>
        </View>
      </Card>

      <Card style={styles.dayCard}>
        <Eyebrow>{longDate(selectedDay)}</Eyebrow>
        {dayEntries.length === 0 && dayScheduled.length === 0 ? (
          <Text style={styles.empty}>Nothing on this day.</Text>
        ) : (
          <View style={styles.list}>
            {dayScheduled.map((item) => (
              <View key={item.id} style={styles.row}>
                <View
                  style={[
                    styles.rowDot,
                    { backgroundColor: item.direction === 'in' ? colors.accent : colors.ochre },
                  ]}
                />
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Text style={styles.rowMeta}>Scheduled</Text>
                </View>
                <Text style={[styles.rowAmount, item.direction === 'in' && styles.rowAmountIn]}>
                  {formatSigned(item.amountMinor, item.direction)}
                </Text>
              </View>
            ))}
            {dayEntries.map((entry) => {
              const category = categoryById(entry.categoryId);
              return (
                <View key={entry.id} style={styles.row}>
                  <View
                    style={[
                      styles.rowDot,
                      {
                        backgroundColor:
                          entry.direction === 'in' ? colors.accent : category?.color ?? colors.ink3,
                      },
                    ]}
                  />
                  <View style={styles.rowText}>
                    <Text style={styles.rowName}>
                      {entry.note?.trim() || category?.name || 'Uncategorised'}
                    </Text>
                    <Text style={styles.rowMeta}>
                      {entry.scheduledItemId ? 'Posted automatically' : category?.name ?? '—'}
                    </Text>
                  </View>
                  <Text style={[styles.rowAmount, entry.direction === 'in' && styles.rowAmountIn]}>
                    {formatSigned(entry.amountMinor, entry.direction)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {hasAnchor ? (
        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>In 30 days, after everything scheduled</Text>
          <Text style={styles.calloutAmount}>
            {formatWhole(monthAhead.projectedMinor)} kr.
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => router.push('/scheduled')}
        accessibilityRole="button"
        accessibilityLabel="Scheduled items"
      >
        <Card style={styles.linkCard}>
          <Text style={styles.linkText}>
            {activeScheduled.length === 0
              ? 'Add bills, subscriptions and salary'
              : `${activeScheduled.length} scheduled ${activeScheduled.length === 1 ? 'item' : 'items'}`}
          </Text>
          <Text style={styles.chevron}>→</Text>
        </Card>
      </Pressable>
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
  month: { fontSize: 15, fontWeight: '600', color: colors.ink },

  breakdown: { marginTop: 9, gap: 4 },
  sub: { fontSize: 12.5, color: colors.ink2 },
  subStrong: { color: colors.ink, fontWeight: '600' },

  prompt: { gap: 6 },
  promptBody: { fontSize: 13, color: colors.ink2, lineHeight: 19, marginTop: 6 },
  promptLink: { fontSize: 13, color: colors.accent, fontWeight: '600', marginTop: 4 },

  calendarCard: { paddingHorizontal: 10, paddingTop: 12, paddingBottom: 10 },
  weekRow: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: colors.ink3,
    fontWeight: '600',
    paddingBottom: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  dayInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    gap: 2,
  },
  daySelected: { backgroundColor: colors.accent },
  dayNumber: { fontSize: 12.5, color: colors.ink },
  dayToday: { color: colors.accent, fontWeight: '700' },
  dayNumberSelected: { color: colors.onAccent, fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 2, height: 5 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotIn: { backgroundColor: colors.accent },
  dotOut: { backgroundColor: colors.ochre },
  dotOnSelected: { backgroundColor: 'rgba(255,255,255,0.9)' },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 8,
    paddingLeft: 2,
  },
  legendText: { fontSize: 11, color: colors.ink3 },

  dayCard: { paddingBottom: 8 },
  empty: { fontSize: 13, color: colors.ink3, paddingVertical: 12 },
  list: { marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  rowDot: { width: 8, height: 8, borderRadius: 4 },
  rowText: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '500', color: colors.ink },
  rowMeta: { fontSize: 11.5, color: colors.ink3 },
  rowAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  rowAmountIn: { color: colors.accent },

  callout: {
    backgroundColor: colors.ochreTint,
    borderWidth: 1,
    borderColor: 'rgba(169,106,21,0.22)',
    borderRadius: radius.lg,
    padding: 14,
    gap: 2,
  },
  calloutLabel: { fontSize: 12, color: colors.ochreInk },
  calloutAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ochreInk,
    fontVariant: ['tabular-nums'],
  },

  linkCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkText: { fontSize: 14, color: colors.ink, fontWeight: '500' },
  chevron: { fontSize: 16, color: colors.accent },
});
