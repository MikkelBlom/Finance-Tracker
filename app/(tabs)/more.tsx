import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../../state/DataProvider';
import { Card, Eyebrow, PrimaryButton } from '../../components/ui';
import { formatKr } from '../../lib/money';
import { daysBetween, longDate, toDayKey } from '../../lib/dates';
import { colors, radius, space, SCROLL_BOTTOM_INSET } from '../../theme/tokens';

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    settings, setBudget, setBalanceAnchor, entries, categories, activeScheduled,
  } = useData();

  const todayKey = useMemo(() => toDayKey(new Date()), []);

  const [budgetDraft, setBudgetDraft] = useState(
    settings.monthlyBudgetMinor === null ? '' : String(Math.round(settings.monthlyBudgetMinor / 100))
  );
  const [balanceDraft, setBalanceDraft] = useState(
    settings.balanceMinor === null ? '' : String(Math.round(settings.balanceMinor / 100))
  );

  const anchorAgeDays =
    settings.balanceObservedOn === null
      ? null
      : daysBetween(settings.balanceObservedOn, todayKey);

  const saveBudget = async () => {
    const cleaned = budgetDraft.replace(/[^\d]/g, '');
    await setBudget(cleaned === '' ? null : Number(cleaned) * 100);
  };

  const saveBalance = async () => {
    const cleaned = balanceDraft.replace(/[^\d-]/g, '');
    if (cleaned === '' || cleaned === '-') {
      await setBalanceAnchor(null, null);
      return;
    }
    await setBalanceAnchor(Number(cleaned) * 100, todayKey);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.sm, paddingBottom: SCROLL_BOTTOM_INSET },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <Card style={styles.card}>
        <Eyebrow>Account balance</Eyebrow>
        <Text style={styles.hint}>
          What's actually in your account right now. There's no bank feed, so the calendar has to
          start from a number you type in. Update it whenever you think of it — re-entering it
          corrects any drift that has built up.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            value={balanceDraft}
            onChangeText={setBalanceDraft}
            placeholder="0"
            placeholderTextColor={colors.ink3}
            keyboardType="numbers-and-punctuation"
            style={styles.input}
          />
          <Text style={styles.suffix}>kr.</Text>
        </View>
        <PrimaryButton label="Save balance" onPress={saveBalance} />
        {settings.balanceObservedOn !== null ? (
          <Text style={styles.meta}>
            Last set {longDate(settings.balanceObservedOn)}
            {anchorAgeDays !== null && anchorAgeDays > 0
              ? ` — ${anchorAgeDays} ${anchorAgeDays === 1 ? 'day' : 'days'} ago`
              : ' — today'}
            {anchorAgeDays !== null && anchorAgeDays > 10
              ? '. Worth refreshing; the projection drifts as it ages.'
              : ''}
          </Text>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <Eyebrow>Monthly budget</Eyebrow>
        <Text style={styles.hint}>
          Day-to-day spending only. Rent and subscriptions are handled by the calendar, so leaving
          them out keeps this number one you can act on.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            value={budgetDraft}
            onChangeText={setBudgetDraft}
            placeholder="10000"
            placeholderTextColor={colors.ink3}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Text style={styles.suffix}>kr.</Text>
        </View>
        <PrimaryButton label="Save budget" onPress={saveBudget} />
        {settings.monthlyBudgetMinor !== null ? (
          <Pressable
            onPress={() => { setBudgetDraft(''); void setBudget(null); }}
            style={styles.clear}
          >
            <Text style={styles.clearText}>Remove budget</Text>
          </Pressable>
        ) : null}
      </Card>

      <Pressable onPress={() => router.push('/scheduled')}>
        <Card style={styles.linkCard}>
          <View>
            <Text style={styles.linkText}>Scheduled items</Text>
            <Text style={styles.linkMeta}>
              {activeScheduled.length === 0
                ? 'Bills, subscriptions, salary'
                : `${activeScheduled.length} active`}
            </Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push('/categories')}>
        <Card style={styles.linkCard}>
          <View>
            <Text style={styles.linkText}>Categories</Text>
            <Text style={styles.linkMeta}>
              {categories.filter((c) => c.archivedAt === null).length} in use
            </Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </Card>
      </Pressable>

      <Card style={styles.card}>
        <Eyebrow>Data</Eyebrow>
        <Text style={styles.hint}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} stored on this device.
          Nothing leaves it — sync and export are not built yet.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  content: { paddingHorizontal: 14, gap: 10 },
  header: { paddingHorizontal: 4, paddingBottom: 10 },
  title: { fontSize: 17, fontWeight: '600', color: colors.ink },
  card: { gap: 4 },
  hint: { fontSize: 12.5, color: colors.ink2, lineHeight: 18, marginTop: 6 },
  meta: { fontSize: 11.5, color: colors.ink3, marginTop: 10, lineHeight: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ground,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
    paddingVertical: 12,
    fontVariant: ['tabular-nums'],
  },
  suffix: { fontSize: 14, color: colors.ink2 },
  clear: { alignItems: 'center', paddingTop: 12 },
  clearText: { fontSize: 12.5, color: colors.brick, fontWeight: '600' },
  linkCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkText: { fontSize: 14.5, color: colors.ink, fontWeight: '500' },
  linkMeta: { fontSize: 11.5, color: colors.ink3, marginTop: 2 },
  chevron: { fontSize: 16, color: colors.accent },
});
