import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../../state/DataProvider';
import { Card, Eyebrow, PrimaryButton } from '../../components/ui';
import { formatKr } from '../../lib/money';
import { colors, radius, space, SCROLL_BOTTOM_INSET } from '../../theme/tokens';

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, setBudget, entries, categories } = useData();

  const current = settings.monthlyBudgetMinor;
  const [draft, setDraft] = useState(current === null ? '' : String(Math.round(current / 100)));

  const save = async () => {
    const cleaned = draft.replace(/[^\d]/g, '');
    await setBudget(cleaned === '' ? null : Number(cleaned) * 100);
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
        <Eyebrow>Monthly budget</Eyebrow>
        <Text style={styles.hint}>
          Covers day-to-day spending only. Rent and subscriptions will be handled by the
          calendar once it exists, so leaving them out keeps this number meaningful.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="10000"
            placeholderTextColor={colors.ink3}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Text style={styles.suffix}>kr.</Text>
        </View>
        <PrimaryButton label="Save budget" onPress={save} />
        {current !== null ? (
          <Pressable onPress={() => { setDraft(''); void setBudget(null); }} style={styles.clear}>
            <Text style={styles.clearText}>Remove budget</Text>
          </Pressable>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <Eyebrow>Categories</Eyebrow>
        <Pressable style={styles.link} onPress={() => router.push('/categories')}>
          <Text style={styles.linkText}>
            {categories.filter((c) => c.archivedAt === null).length} in use
          </Text>
          <Text style={styles.chevron}>→</Text>
        </Pressable>
      </Card>

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
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 4,
  },
  linkText: { fontSize: 14.5, color: colors.ink, fontWeight: '500' },
  chevron: { fontSize: 16, color: colors.accent },
});
