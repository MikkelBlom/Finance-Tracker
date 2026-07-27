import React, { useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../state/DataProvider';
import { Chip, PrimaryButton } from '../components/ui';
import {
  emptyAmount, displayAmount, isEmpty, pressBackspace, pressComma, pressDigit, toMinor,
} from '../lib/amountInput';
import type { AmountInput } from '../lib/amountInput';
import { toIso } from '../lib/dates';
import { colors, radius, space } from '../theme/tokens';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'];

/**
 * The whole product lives on this screen. Amount, category, save — nothing between
 * opening it and the ledger. Category is optional on purpose: logging fast and
 * categorising later beats not logging at all.
 */
export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeCategories, addEntry } = useData();

  const [amount, setAmount] = useState<AmountInput>(emptyAmount);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [direction, setDirection] = useState<'out' | 'in'>('out');
  const [yesterday, setYesterday] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const onKey = (key: string) => {
    if (key === '⌫') setAmount((a) => pressBackspace(a));
    else if (key === ',') setAmount((a) => pressComma(a));
    else setAmount((a) => pressDigit(a, key));
  };

  /**
   * The widget and a deep link both open this screen as the first route, where there
   * is no history to pop — falling back to the overview keeps the close and save
   * actions working however the screen was reached.
   */
  const dismiss = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const save = async () => {
    if (isEmpty(amount) || saving) return;
    setSaving(true);
    const when = new Date();
    if (yesterday) when.setDate(when.getDate() - 1);
    await addEntry({
      amountMinor: toMinor(amount),
      direction,
      categoryId: direction === 'in' ? null : categoryId,
      note: note.trim() || null,
      occurredAt: toIso(when),
    });
    dismiss();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.sm }]}>
      <View style={styles.header}>
        <View style={styles.toggle}>
          <Pressable
            onPress={() => setDirection('out')}
            style={[styles.toggleItem, direction === 'out' && styles.toggleOn]}
          >
            <Text style={[styles.toggleText, direction === 'out' && styles.toggleTextOn]}>
              Expense
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setDirection('in')}
            style={[styles.toggleItem, direction === 'in' && styles.toggleOn]}
          >
            <Text style={[styles.toggleText, direction === 'in' && styles.toggleTextOn]}>
              Income
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
        >
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.amountBlock}>
        <Text style={[styles.amount, direction === 'in' && { color: colors.accent }]}>
          {displayAmount(amount)}
        </Text>
        <Text style={styles.unit}>KRONER</Text>
      </View>

      {direction === 'out' ? (
        <ScrollView
          horizontal={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chips}
          showsVerticalScrollIndicator={false}
        >
          {activeCategories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              color={category.color}
              selected={categoryId === category.id}
              onPress={() => setCategoryId(categoryId === category.id ? null : category.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.incomeNote}>
          <Text style={styles.incomeNoteText}>Income isn't categorised.</Text>
        </View>
      )}

      <View style={styles.metaRow}>
        <Pressable
          style={[styles.meta, styles.metaFilled]}
          onPress={() => setYesterday((v) => !v)}
        >
          <Text style={styles.metaTextFilled}>{yesterday ? 'Yesterday' : 'Today'}</Text>
        </Pressable>
        <Pressable
          style={[styles.meta, note.trim() ? styles.metaFilled : null]}
          onPress={() => setNoteOpen((v) => !v)}
        >
          <Text style={note.trim() ? styles.metaTextFilled : styles.metaText}>
            {note.trim() ? note.trim().slice(0, 18) : '+ Note'}
          </Text>
        </Pressable>
      </View>

      {noteOpen ? (
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="What was it for?"
          placeholderTextColor={colors.ink3}
          style={styles.noteInput}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => setNoteOpen(false)}
        />
      ) : null}

      <View style={styles.pad}>
        {KEYS.map((key) => (
          <Pressable
            key={key}
            onPress={() => onKey(key)}
            accessibilityRole="button"
            accessibilityLabel={key === '⌫' ? 'Backspace' : key}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          >
            <Text style={[styles.keyText, (key === ',' || key === '⌫') && styles.keyTextSoft]}>
              {key}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.saveWrap, { paddingBottom: insets.bottom + space.md }]}>
        <PrimaryButton
          label={saving ? 'Saving…' : 'Save'}
          onPress={save}
          disabled={isEmpty(amount) || saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground, paddingHorizontal: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    padding: 2,
  },
  toggleItem: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: radius.pill },
  toggleOn: { backgroundColor: colors.accent },
  toggleText: { fontSize: 13, fontWeight: '500', color: colors.ink2 },
  toggleTextOn: { color: colors.onAccent, fontWeight: '600' },
  close: { fontSize: 18, color: colors.ink3, paddingHorizontal: 4 },

  amountBlock: { alignItems: 'center', paddingTop: 14, paddingBottom: 4 },
  amount: {
    fontSize: 46,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -1.8,
    fontVariant: ['tabular-nums'],
  },
  unit: { fontSize: 10, letterSpacing: 1.6, color: colors.ink3, marginTop: 2 },

  chipScroll: { flexGrow: 0, maxHeight: 96 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingVertical: 2 },
  incomeNote: { paddingVertical: 12, alignItems: 'center' },
  incomeNoteText: { fontSize: 12.5, color: colors.ink3 },

  metaRow: { flexDirection: 'row', gap: 7, paddingTop: 6 },
  meta: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 8,
  },
  metaFilled: { borderStyle: 'solid' },
  metaText: { fontSize: 12, color: colors.ink2 },
  metaTextFilled: { fontSize: 12, color: colors.ink, fontWeight: '500' },
  noteInput: {
    marginTop: 7,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },

  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 'auto',
    paddingTop: 8,
    gap: 4,
  },
  key: {
    width: '32.2%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  keyPressed: { backgroundColor: colors.accentTint },
  keyText: { fontSize: 21, fontWeight: '500', color: colors.ink },
  keyTextSoft: { fontSize: 17, color: colors.ink2 },

  saveWrap: { paddingTop: 8 },
});
