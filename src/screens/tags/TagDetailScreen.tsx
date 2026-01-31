// Tag Detail Screen - Shows articles with a specific tag

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
import { useTagStore, useArticleStore } from '../../stores';
import { Article, RootStackParamList } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import ArticleCard from '../../components/library/ArticleCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TagDetailRouteProp = RouteProp<RootStackParamList, 'TagDetail'>;

const TagDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TagDetailRouteProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const { tagId } = route.params;

  const { tags, deleteTag, getTagById } = useTagStore();
  const { getArticlesByTag, toggleFavorite, archiveArticle, deleteArticle } = useArticleStore();

  const tag = getTagById(tagId);
  const articles = getArticlesByTag(tagId);

  React.useLayoutEffect(() => {
    if (tag) {
      navigation.setOptions({
        title: `#${tag.name}`,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Delete Tag',
                `Are you sure you want to delete "${tag.name}"?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      deleteTag(tagId);
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
  }, [tag, navigation, deleteTag, tagId, colors]);

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
      <Text style={styles.emptyEmoji}>🏷️</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No articles</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Add this tag to articles from the library
      </Text>
    </View>
  );

  if (!tag) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Tag not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tag Header */}
      <View style={[styles.tagHeader, { backgroundColor: colors.surface }]}>
        <View style={[styles.tagBadge, { backgroundColor: tag.color + '20' }]}>
          <Text style={[styles.tagName, { color: tag.color }]}>#{tag.name}</Text>
        </View>
        <Text style={[styles.articleCount, { color: colors.textSecondary }]}>
          {articles.length} article{articles.length !== 1 ? 's' : ''}
        </Text>
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
  tagHeader: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  tagBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  tagName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
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

export default TagDetailScreen;
