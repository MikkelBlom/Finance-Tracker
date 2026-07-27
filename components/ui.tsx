import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, space } from '../theme/tokens';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Monospace-feeling uppercase label. Metadata only — never competes with a number. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function ScreenTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.screenTitle}>{children}</Text>;
}

export function Hero({ value, unit = 'kr.' }: { value: string; unit?: string }) {
  return (
    <Text style={styles.hero}>
      {value}
      <Text style={styles.heroUnit}> {unit}</Text>
    </Text>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function Chip({
  label, color, selected, onPress,
}: {
  label: string;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : {}}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && styles.pressed]}
    >
      {color ? (
        <View style={[styles.chipDot, { backgroundColor: selected ? colors.onAccent : color }]} />
      ) : null}
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label, onPress, disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        disabled && styles.primaryDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.xl,
    padding: space.lg,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.ink3,
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  hero: {
    fontSize: 42,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -1.4,
    marginTop: 4,
  },
  heroUnit: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.ink2,
    letterSpacing: 0,
  },
  divider: { height: 1, backgroundColor: colors.line },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.ink },
  chipTextOn: { color: colors.onAccent },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryDisabled: { backgroundColor: colors.line },
  primaryText: { color: colors.onAccent, fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  empty: { paddingVertical: 28, alignItems: 'center', gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  emptyBody: {
    fontSize: 13,
    color: colors.ink2,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 19,
  },
});
