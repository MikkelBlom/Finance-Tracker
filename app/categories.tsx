import React, { useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '../state/DataProvider';
import { Card, Eyebrow, PrimaryButton } from '../components/ui';
import { colors, radius, space, categoryPalette } from '../theme/tokens';

/**
 * Categories are fully editable and removal is non-destructive — archiving hides a
 * category from the numpad but leaves every past entry pointing at it, so history and
 * insights stay correct.
 */
export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    categories, addCategory, renameCategory, recolourCategory, archiveCategory, restoreCategory,
  } = useData();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const active = categories.filter((c) => c.archivedAt === null);
  const archived = categories.filter((c) => c.archivedAt !== null);

  const commitRename = async (id: string) => {
    if (draftName.trim()) await renameCategory(id, draftName);
    setEditingId(null);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + 40 },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Categories</Text>
      </View>

      <Card style={styles.card}>
        <Eyebrow>In use</Eyebrow>
        <View style={styles.list}>
          {active.map((category) => (
            <View key={category.id} style={styles.row}>
              {editingId === category.id ? (
                <>
                  <View style={[styles.dot, { backgroundColor: category.color }]} />
                  <TextInput
                    value={draftName}
                    onChangeText={setDraftName}
                    style={styles.input}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={() => commitRename(category.id)}
                    onBlur={() => commitRename(category.id)}
                  />
                </>
              ) : (
                <>
                  <Pressable
                    onPress={() => {
                      const next =
                        categoryPalette[
                          (categoryPalette.indexOf(category.color as (typeof categoryPalette)[number]) + 1) %
                            categoryPalette.length
                        ];
                      void recolourCategory(category.id, next);
                    }}
                    accessibilityLabel={`Change colour of ${category.name}`}
                    hitSlop={10}
                  >
                    <View style={[styles.dot, { backgroundColor: category.color }]} />
                  </Pressable>
                  <Pressable
                    style={styles.nameWrap}
                    onPress={() => {
                      setEditingId(category.id);
                      setDraftName(category.name);
                    }}
                  >
                    <Text style={styles.name}>{category.name}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void archiveCategory(category.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                  >
                    <Text style={styles.action}>Remove</Text>
                  </Pressable>
                </>
              )}
            </View>
          ))}
        </View>
        <Text style={styles.hint}>Tap a name to rename it, or the dot to change its colour.</Text>
      </Card>

      <Card style={styles.card}>
        <Eyebrow>Add a category</Eyebrow>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Name"
          placeholderTextColor={colors.ink3}
          style={[styles.input, styles.newInput]}
          returnKeyType="done"
        />
        <PrimaryButton
          label="Add"
          disabled={!newName.trim()}
          onPress={async () => {
            await addCategory(newName);
            setNewName('');
          }}
        />
      </Card>

      {archived.length > 0 ? (
        <Card style={styles.card}>
          <Eyebrow>Removed</Eyebrow>
          <Text style={styles.hint}>
            Past entries still use these, so your history and totals are unchanged. They just
            don't appear when logging.
          </Text>
          <View style={styles.list}>
            {archived.map((category) => (
              <View key={category.id} style={styles.row}>
                <View style={[styles.dot, { backgroundColor: category.color, opacity: 0.45 }]} />
                <View style={styles.nameWrap}>
                  <Text style={[styles.name, styles.nameArchived]}>{category.name}</Text>
                </View>
                <Pressable
                  onPress={() => void restoreCategory(category.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <Text style={[styles.action, styles.actionRestore]}>Restore</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  content: { paddingHorizontal: 14, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8, paddingHorizontal: 4 },
  back: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '600', color: colors.ink },
  card: { gap: 4 },
  list: { marginTop: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  nameWrap: { flex: 1 },
  name: { fontSize: 14.5, color: colors.ink, fontWeight: '500' },
  nameArchived: { color: colors.ink3 },
  action: { fontSize: 12.5, color: colors.brick, fontWeight: '600' },
  actionRestore: { color: colors.accent },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: colors.ink,
    paddingVertical: 4,
  },
  newInput: {
    flex: 0,
    backgroundColor: colors.ground,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginVertical: 10,
  },
  hint: { fontSize: 12, color: colors.ink3, lineHeight: 17, marginTop: 8 },
});
