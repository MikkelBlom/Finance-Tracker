import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Eyebrow } from '../../components/ui';
import { colors, space, SCROLL_BOTTOM_INSET } from '../../theme/tokens';

/**
 * Placeholder. The calendar depends on scheduled items and a balance anchor, neither
 * of which exists yet — showing a fake projection would be worse than showing nothing.
 */
export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.sm, paddingBottom: SCROLL_BOTTOM_INSET },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <Card style={styles.card}>
        <Eyebrow>Not built yet</Eyebrow>
        <Text style={styles.body}>
          This is where scheduled bills and income will sit on their real dates, with a
          projected balance you can read off any day of the month.
        </Text>
        <Text style={styles.body}>
          It needs two things first: recurring items, so the app knows what's coming, and a
          balance figure you enter by hand, since there's no bank feed to read one from.
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
  card: { gap: 10 },
  body: { fontSize: 13.5, color: colors.ink2, lineHeight: 20 },
});
