// Folder Detail Screen - Shows articles in a specific folder

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFolderStore, useArticleStore } from '../../stores';
import { Article, RootStackParamList } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import ArticleCard from '../../components/library/ArticleCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FolderDetailRouteProp = RouteProp<RootStackParamList, 'FolderDetail'>;

const FolderDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FolderDetailRouteProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const { folderId } = route.params;

  const { folders, deleteFolder, getFolderById } = useFolderStore();
  const { getArticlesByFolder, toggleFavorite, archiveArticle, deleteArticle } = useArticleStore();

  const folder = getFolderById(folderId);
  const articles = getArticlesByFolder(folderId);

  React.useLayoutEffect(() => {
    if (folder) {
      navigation.setOptions({
        title: folder.name,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Delete Folder',
                `Are you sure you want to delete "${folder.name}"?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      deleteFolder(folderId);
                      navigation.goBack();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={[styles.deleteButton, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [folder, navigation, deleteFolder, folderId, colors]);

  const handleArticlePress = useCallback(
    (article: Article) => {
      navigation.navigate('Reader', { articleId: article.id });
    },
    [navigation]
  );

  const renderArticle = useCallback(
    ({ item }: { item: Article }) => (
      <ArticleCard
        article={item}
        onPress={() => handleArticlePress(item)}
        onFavorite={() => toggleFavorite(item.id)}
        onArchive={() => archiveArticle(item.id)}
        onDelete={() => deleteArticle(item.id)}
      />
    ),
    [handleArticlePress, toggleFavorite, archiveArticle, deleteArticle]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{folder?.icon || '📁'}</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No articles</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Move articles to this folder from the library
      </Text>
    </View>
  );

  if (!folder) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Folder not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Folder Header */}
      <View style={[styles.folderHeader, { backgroundColor: colors.surface }]}>
        <View style={[styles.folderIcon, { backgroundColor: (folder.color || colors.primary) + '20' }]}>
          <Text style={styles.folderEmoji}>{folder.icon || '📁'}</Text>
        </View>
        <View style={styles.folderInfo}>
          <Text style={[styles.folderName, { color: colors.text }]}>{folder.name}</Text>
          <Text style={[styles.articleCount, { color: colors.textSecondary }]}>
            {articles.length} article{articles.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Articles List */}
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deleteButton: {
    fontSize: Typography.fontSizes.md,
    marginRight: Spacing.md,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  folderIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  folderEmoji: {
    fontSize: 28,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 2,
  },
  articleCount: {
    fontSize: Typography.fontSizes.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
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
    paddingHorizontal: Spacing.xl,
  },
});

export default FolderDetailScreen;
