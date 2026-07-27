import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radius, TAB_BAR_HEIGHT } from '../theme/tokens';

const LABELS: Record<string, string> = {
  index: 'Home',
  calendar: 'Calendar',
  insights: 'Insights',
  more: 'More',
};

const GLYPHS: Record<string, string> = {
  index: '◧',
  calendar: '▤',
  insights: '◫',
  more: '⋯',
};

type TabRoute = { key: string; name: string };

/**
 * Structural subset of the navigator's tab bar props — only what this component
 * reads. Typing it here avoids taking a direct dependency on @react-navigation
 * just to import one type.
 */
type TabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

/**
 * Four tabs with the add button raised over the centre. The button overlaps the bar
 * only — every scrolling screen pads its content by SCROLL_BOTTOM_INSET so nothing
 * ever ends up hidden underneath it.
 */
export default function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const routes = state.routes.filter((r) => LABELS[r.name] !== undefined);
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const renderTab = (route: (typeof routes)[number]) => {
    const index = state.routes.findIndex((r) => r.key === route.key);
    const focused = state.index === index;
    return (
      <Pressable
        key={route.key}
        style={styles.tab}
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        accessibilityLabel={LABELS[route.name]}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }}
      >
        <Text style={[styles.glyph, focused && styles.glyphOn]}>{GLYPHS[route.name]}</Text>
        <Text style={[styles.label, focused && styles.labelOn]}>{LABELS[route.name]}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {left.map(renderTab)}
        <View style={styles.gap} />
        {right.map(renderTab)}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add expense"
        onPress={() => router.push('/add')}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + TAB_BAR_HEIGHT - 38 },
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TAB_BAR_HEIGHT,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  gap: { width: 76 },
  glyph: { fontSize: 16, lineHeight: 18, color: colors.ink3 },
  glyphOn: { color: colors.accent },
  label: { fontSize: 10, color: colors.ink3 },
  labelOn: { color: colors.accent, fontWeight: '600' },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(14, 94, 88, 0.4)',
    elevation: 6,
  },
  fabPressed: { opacity: 0.85 },
  fabPlus: {
    color: colors.onAccent,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '300',
  },
});
