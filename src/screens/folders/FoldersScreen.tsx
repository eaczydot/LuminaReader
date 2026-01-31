// Folders Screen - Folder management view

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
import { useFolderStore, useArticleStore } from '../../stores';
import { Folder, RootStackParamList } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FOLDER_ICONS = ['📁', '📂', '🗂️', '📚', '💼', '🎯', '⭐', '💡', '🔖', '📌'];
const FOLDER_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];

const FoldersScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);

  const { folders, addFolder, deleteFolder, getRootFolders } = useFolderStore();
  const { articles, getArticlesByFolder } = useArticleStore();

  const rootFolders = getRootFolders();

  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    addFolder({
      name: newFolderName.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });

    setNewFolderName('');
    setSelectedIcon('📁');
    setSelectedColor(FOLDER_COLORS[0]);
    setShowCreateModal(false);
  }, [newFolderName, selectedIcon, selectedColor, addFolder]);

  const handleDeleteFolder = useCallback(
    (folder: Folder) => {
      Alert.alert(
        'Delete Folder',
        `Are you sure you want to delete "${folder.name}"? Articles in this folder will not be deleted.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteFolder(folder.id),
          },
        ]
      );
    },
    [deleteFolder]
  );

  const renderFolder = useCallback(
    ({ item }: { item: Folder }) => {
      const articleCount = getArticlesByFolder(item.id).length;

      return (
        <TouchableOpacity
          style={[styles.folderCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('FolderDetail', { folderId: item.id })}
          onLongPress={() => handleDeleteFolder(item)}
        >
          <View style={[styles.folderIcon, { backgroundColor: (item.color || colors.primary) + '20' }]}>
            <Text style={styles.folderEmoji}>{item.icon || '📁'}</Text>
          </View>
          <View style={styles.folderInfo}>
            <Text style={[styles.folderName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.folderCount, { color: colors.textSecondary }]}>
              {articleCount} article{articleCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>
      );
    },
    [colors, navigation, getArticlesByFolder, handleDeleteFolder]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📁</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No folders yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Create folders to organize your articles
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Create Button */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {rootFolders.length} Folder{rootFolders.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ New Folder</Text>
        </TouchableOpacity>
      </View>

      {/* Folders List */}
      <FlatList
        data={rootFolders}
        renderItem={renderFolder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Create Folder Modal */}
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Folder</Text>
            <TouchableOpacity onPress={handleCreateFolder}>
              <Text style={[styles.saveButton, { color: colors.primary }]}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Folder Name Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="Enter folder name"
              placeholderTextColor={colors.textTertiary}
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />

            {/* Icon Selection */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Icon</Text>
            <View style={styles.iconGrid}>
              {FOLDER_ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    { backgroundColor: colors.surface },
                    selectedIcon === icon && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Selection */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Color</Text>
            <View style={styles.colorGrid}>
              {FOLDER_COLORS.map(color => (
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
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  folderIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  folderEmoji: {
    fontSize: 24,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: 2,
  },
  folderCount: {
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 24,
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
});

export default FoldersScreen;
