// Tags Screen - Tag management view

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTagStore, useArticleStore, TAG_COLORS } from '../../stores';
import { Tag, RootStackParamList } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TagsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const { tags, addTag, deleteTag, getPopularTags } = useTagStore();
  const { getArticlesByTag } = useArticleStore();

  const sortedTags = [...tags].sort((a, b) => b.articleCount - a.articleCount);

  const handleCreateTag = useCallback(() => {
    if (!newTagName.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    addTag(newTagName.trim(), selectedColor);

    setNewTagName('');
    setSelectedColor(TAG_COLORS[0]);
    setShowCreateModal(false);
  }, [newTagName, selectedColor, addTag]);

  const handleDeleteTag = useCallback(
    (tag: Tag) => {
      Alert.alert(
        'Delete Tag',
        `Are you sure you want to delete "${tag.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteTag(tag.id),
          },
        ]
      );
    },
    [deleteTag]
  );

  const renderTag = useCallback(
    ({ item }: { item: Tag }) => {
      const articleCount = getArticlesByTag(item.id).length;

      return (
        <TouchableOpacity
          style={[styles.tagCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('TagDetail', { tagId: item.id })}
          onLongPress={() => handleDeleteTag(item)}
        >
          <View style={[styles.tagColor, { backgroundColor: item.color }]} />
          <View style={styles.tagInfo}>
            <Text style={[styles.tagName, { color: colors.text }]}>#{item.name}</Text>
            <Text style={[styles.tagCount, { color: colors.textSecondary }]}>
              {articleCount} article{articleCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>
      );
    },
    [colors, navigation, getArticlesByTag, handleDeleteTag]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🏷️</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No tags yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Create tags to categorize your articles
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {tags.length} Tag{tags.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ New Tag</Text>
        </TouchableOpacity>
      </View>

      {/* Tags List */}
      <FlatList
        data={sortedTags}
        renderItem={renderTag}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Create Tag Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Tag</Text>
            <TouchableOpacity onPress={handleCreateTag}>
              <Text style={[styles.saveButton, { color: colors.primary }]}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Tag Name Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="Enter tag name"
              placeholderTextColor={colors.textTertiary}
              value={newTagName}
              onChangeText={setNewTagName}
              autoFocus
              autoCapitalize="none"
            />

            {/* Color Selection */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Color</Text>
            <View style={styles.colorGrid}>
              {TAG_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            {/* Preview */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Preview</Text>
            <View style={[styles.previewContainer, { backgroundColor: colors.surface }]}>
              <View style={[styles.previewTag, { backgroundColor: selectedColor + '20' }]}>
                <Text style={[styles.previewText, { color: selectedColor }]}>
                  #{newTagName || 'tag-name'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  createButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  tagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  tagColor: {
    width: 12,
    height: 40,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: 2,
  },
  tagCount: {
    fontSize: Typography.fontSizes.sm,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing['5xl'],
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.md,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    fontSize: Typography.fontSizes.md,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  saveButton: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: Typography.fontSizes.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  previewContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'flex-start',
  },
  previewTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  previewText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
});

export default TagsScreen;
