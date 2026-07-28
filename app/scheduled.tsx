import React, { useMemo, useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../state/DataProvider';
import { Card, Chip, Eyebrow, PrimaryButton } from '../components/ui';
import { formatKr, formatWhole } from '../lib/money';
import { addDays, longDate, shiftMonth, toDayKey, toMonthKey } from '../lib/dates';
import { CYCLE_LABELS, monthlyEquivalentMinor } from '../lib/recurrence';
import type { Cycle, Direction } from '../db/types';
import { colors, radius, space } from '../theme/tokens';

const CYCLES: Cycle[] = ['monthly', 'yearly', 'weekly'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function ScheduledScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    scheduled, activeScheduled, activeCategories, categoryById,
    addScheduledItem, pauseScheduledItem, resumeScheduledItem, deleteScheduledItem,
  } = useData();

  const today = useMemo(() => new Date(), []);
  const todayKey = toDayKey(today);
  const firstOfNextMonth = `${shiftMonth(toMonthKey(today), 1)}-01`;

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<Direction>('out');
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [dueOn, setDueOn] = useState(firstOfNextMonth);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const paused = scheduled.filter((s) => s.pausedAt !== null && s.deletedAt === null);

  const outgoingsMonthly = activeScheduled
    .filter((s) => s.direction === 'out')
    .reduce((total, s) => total + monthlyEquivalentMinor(s), 0);
  const incomeMonthly = activeScheduled
    .filter((s) => s.direction === 'in')
    .reduce((total, s) => total + monthlyEquivalentMinor(s), 0);

  const amountMinor = Math.round(Number(amount.replace(',', '.')) * 100);
  const dateValid = DATE_PATTERN.test(dueOn) && !Number.isNaN(Date.parse(dueOn));
  const canSave = name.trim().length > 0 && Number.isFinite(amountMinor) && amountMinor > 0 && dateValid;

  const reset = () => {
    setName(''); setAmount(''); setDirection('out'); setCycle('monthly');
    setDueOn(firstOfNextMonth); setCategoryId(null); setFormOpen(false);
  };

  const save = async () => {
    if (!canSave) return;
    await addScheduledItem({
      name, amountMinor, direction, cycle,
      categoryId: direction === 'in' ? null : categoryId,
      nextDueOn: dueOn,
    });
    reset();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + 48 },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Scheduled</Text>
      </View>

      <Card>
        <Eyebrow>Every month, on average</Eyebrow>
        <Text style={styles.total}>
          {formatWhole(outgoingsMonthly)}
          <Text style={styles.totalUnit}> kr. out</Text>
        </Text>
        {incomeMonthly > 0 ? (
          <Text style={styles.sub}>
            <Text style={styles.subStrong}>{formatWhole(incomeMonthly)} kr.</Text> in — net{' '}
            <Text style={styles.subStrong}>{formatWhole(incomeMonthly - outgoingsMonthly)} kr.</Text>
          </Text>
        ) : null}
        {outgoingsMonthly > 0 ? (
          <Text style={[styles.sub, { marginTop: 4 }]}>
            {formatWhole(outgoingsMonthly * 12)} kr. a year. Yearly and weekly items are shown at
            their monthly equivalent.
          </Text>
        ) : null}
      </Card>

      {activeScheduled.length > 0 ? (
        <Card style={styles.listCard}>
          <Eyebrow>Active</Eyebrow>
          <View style={styles.list}>
            {activeScheduled.map((item) => {
              const category = categoryById(item.categoryId);
              const expanded = expandedId === item.id;
              const equivalent = monthlyEquivalentMinor(item);
              return (
                <View key={item.id}>
                  <Pressable
                    style={styles.row}
                    onPress={() => setExpandedId(expanded ? null : item.id)}
                    accessibilityRole="button"
                  >
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            item.direction === 'in' ? colors.accent : category?.color ?? colors.ochre,
                        },
                      ]}
                    />
                    <View style={styles.rowText}>
                      <Text style={styles.rowName}>{item.name}</Text>
                      <Text style={styles.rowMeta}>
                        {CYCLE_LABELS[item.cycle]} · next {longDate(item.nextDueOn)}
                      </Text>
                    </View>
                    <View style={styles.rowAmounts}>
                      <Text
                        style={[styles.rowAmount, item.direction === 'in' && styles.rowAmountIn]}
                      >
                        {formatWhole(item.amountMinor)}
                      </Text>
                      {item.cycle !== 'monthly' ? (
                        <Text style={styles.rowEquivalent}>≈ {formatWhole(equivalent)}/mo</Text>
                      ) : null}
                    </View>
                  </Pressable>
                  {expanded ? (
                    <View style={styles.actions}>
                      <Pressable
                        onPress={() => { setExpandedId(null); void pauseScheduledItem(item.id); }}
                        style={styles.actionButton}
                      >
                        <Text style={styles.actionText}>Pause</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => { setExpandedId(null); void deleteScheduledItem(item.id); }}
                        style={[styles.actionButton, styles.actionDanger]}
                      >
                        <Text style={[styles.actionText, styles.actionTextDanger]}>Delete</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}

      {paused.length > 0 ? (
        <Card style={styles.listCard}>
          <Eyebrow>Paused</Eyebrow>
          <Text style={styles.hint}>
            These stop posting but keep everything they've already posted. Resuming picks up from
            the next due date, not the ones missed.
          </Text>
          <View style={styles.list}>
            {paused.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={[styles.dot, { backgroundColor: colors.ink3 }]} />
                <View style={styles.rowText}>
                  <Text style={[styles.rowName, styles.rowNamePaused]}>{item.name}</Text>
                  <Text style={styles.rowMeta}>{CYCLE_LABELS[item.cycle]} · paused</Text>
                </View>
                <Pressable onPress={() => void resumeScheduledItem(item.id)} hitSlop={8}>
                  <Text style={styles.resume}>Resume</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {formOpen ? (
        <Card style={styles.formCard}>
          <Eyebrow>New scheduled item</Eyebrow>

          <View style={styles.toggle}>
            <Pressable
              onPress={() => setDirection('out')}
              style={[styles.toggleItem, direction === 'out' && styles.toggleOn]}
            >
              <Text style={[styles.toggleText, direction === 'out' && styles.toggleTextOn]}>
                Money out
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDirection('in')}
              style={[styles.toggleItem, direction === 'in' && styles.toggleOn]}
            >
              <Text style={[styles.toggleText, direction === 'in' && styles.toggleTextOn]}>
                Money in
              </Text>
            </Pressable>
          </View>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name — Rent, Spotify, Salary"
            placeholderTextColor={colors.ink3}
            style={styles.input}
          />

          <View style={styles.amountRow}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={colors.ink3}
              keyboardType="decimal-pad"
              style={[styles.input, styles.amountInput]}
            />
            <Text style={styles.suffix}>kr.</Text>
          </View>

          <Text style={styles.fieldLabel}>How often</Text>
          <View style={styles.chipRow}>
            {CYCLES.map((option) => (
              <Chip
                key={option}
                label={CYCLE_LABELS[option]}
                selected={cycle === option}
                onPress={() => setCycle(option)}
              />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Next payment date</Text>
          <TextInput
            value={dueOn}
            onChangeText={setDueOn}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.ink3}
            style={[styles.input, !dateValid && styles.inputInvalid]}
            autoCapitalize="none"
          />
          <View style={styles.chipRow}>
            <Chip label="1st next month" onPress={() => setDueOn(firstOfNextMonth)} />
            <Chip label="Today" onPress={() => setDueOn(todayKey)} />
            <Chip label="In a week" onPress={() => setDueOn(addDays(todayKey, 7))} />
          </View>
          {!dateValid ? (
            <Text style={styles.error}>Use the form YYYY-MM-DD, for example {firstOfNextMonth}.</Text>
          ) : null}

          {direction === 'out' ? (
            <>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.chipRow}>
                {activeCategories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    color={category.color}
                    selected={categoryId === category.id}
                    onPress={() => setCategoryId(categoryId === category.id ? null : category.id)}
                  />
                ))}
              </View>
            </>
          ) : null}

          <View style={styles.formActions}>
            <PrimaryButton label="Add" onPress={save} disabled={!canSave} />
            <Pressable onPress={reset} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Card>
      ) : (
        <Pressable
          onPress={() => setFormOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Add a bill, subscription or salary"
        >
          <Card style={styles.addCard}>
            <Text style={styles.addText}>+ Add a bill, subscription or salary</Text>
          </Card>
        </Pressable>
      )}

      <Text style={styles.footnote}>
        Scheduled items post themselves on their date — you never log them by hand. They're kept
        out of your day-to-day spending average, so rent doesn't distort what a normal day costs.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  content: { paddingHorizontal: 14, gap: 10 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingBottom: 8, paddingHorizontal: 4,
  },
  back: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '600', color: colors.ink },

  total: {
    fontSize: 38, fontWeight: '600', color: colors.ink,
    letterSpacing: -1.2, marginTop: 4, fontVariant: ['tabular-nums'],
  },
  totalUnit: { fontSize: 17, fontWeight: '500', color: colors.ink2, letterSpacing: 0 },
  sub: { fontSize: 12.5, color: colors.ink2, marginTop: 6 },
  subStrong: { color: colors.ink, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.ink3, lineHeight: 17, marginTop: 6 },

  listCard: { paddingBottom: 6 },
  list: { marginTop: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.line,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowText: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '500', color: colors.ink },
  rowNamePaused: { color: colors.ink3 },
  rowMeta: { fontSize: 11.5, color: colors.ink3 },
  rowAmounts: { alignItems: 'flex-end' },
  rowAmount: {
    fontSize: 14, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'],
  },
  rowAmountIn: { color: colors.accent },
  rowEquivalent: { fontSize: 10.5, color: colors.ink3 },
  resume: { fontSize: 12.5, color: colors.accent, fontWeight: '600' },

  actions: { flexDirection: 'row', gap: 8, paddingBottom: 10 },
  actionButton: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line,
  },
  actionDanger: { borderColor: colors.brick },
  actionText: { fontSize: 12.5, fontWeight: '600', color: colors.ink2 },
  actionTextDanger: { color: colors.brick },

  formCard: { gap: 4 },
  toggle: {
    flexDirection: 'row', backgroundColor: colors.ground,
    borderRadius: radius.pill, padding: 2, marginTop: 10, marginBottom: 4,
  },
  toggleItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.pill },
  toggleOn: { backgroundColor: colors.accent },
  toggleText: { fontSize: 13, fontWeight: '500', color: colors.ink2 },
  toggleTextOn: { color: colors.onAccent, fontWeight: '600' },
  input: {
    backgroundColor: colors.ground, borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14.5, color: colors.ink, marginTop: 8,
    borderWidth: 1, borderColor: 'transparent',
  },
  inputInvalid: { borderColor: colors.brick },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amountInput: { flex: 1, fontSize: 18, fontWeight: '600', fontVariant: ['tabular-nums'] },
  suffix: { fontSize: 14, color: colors.ink2, marginTop: 8 },
  fieldLabel: { fontSize: 12, color: colors.ink2, marginTop: 14, fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 7 },
  error: { fontSize: 11.5, color: colors.brick, marginTop: 7 },
  formActions: { marginTop: 18, gap: 4 },
  cancel: { alignItems: 'center', paddingVertical: 10 },
  cancelText: { fontSize: 13, color: colors.ink2 },

  addCard: { alignItems: 'center', paddingVertical: 16 },
  addText: { fontSize: 14, color: colors.accent, fontWeight: '600' },

  footnote: {
    fontSize: 12, color: colors.ink3, lineHeight: 18,
    paddingHorizontal: 4, paddingTop: 4,
  },
});
