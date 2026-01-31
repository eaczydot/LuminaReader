// Library Screen - Main article list view

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useArticleStore } from '../../stores';
import { Article, RootStackParamList, ArticleStatus } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { formatDate, formatReadingTime, extractDomain, truncateText } from '../../utils/helpers';
import ArticleCard from '../../components/library/ArticleCard';
import AddArticleModal from '../../components/library/AddArticleModal';
import FilterBar from '../../components/library/FilterBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LibraryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'reading' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    articles,
    getFilteredArticles,
    getFavoriteArticles,
    getUnreadArticles,
    deleteArticle,
    toggleFavorite,
    archiveArticle,
    setFilters,
    clearFilters,
  } = useArticleStore();

  // Filter articles based on selected filter and search
  const filteredArticles = useMemo(() => {
    let result: Article[];

    switch (selectedFilter) {
      case 'unread':
        result = articles.filter(a => a.status === 'unread' && !a.isArchived);
        break;
      case 'reading':
        result = articles.filter(a => a.status === 'reading' && !a.isArchived);
        break;
      case 'favorites':
        result = articles.filter(a => a.isFavorite && !a.isArchived);
        break;
      default:
        result = articles.filter(a => !a.isArchived);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.title.toLowerCase().includes(query) ||
          a.author?.toLowerCase().includes(query) ||
          a.excerpt?.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }, [articles, selectedFilter, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Trigger sync with integrations here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const handleArticlePress = useCallback(
    (article: Article) => {
      navigation.navigate('Reader', { articleId: article.id });
    },
    [navigation]
  );

  const handleDeleteArticle = useCallback(
    (article: Article) => {
      Alert.alert(
        'Delete Article',
        `Are you sure you want to delete "${truncateText(article.title, 50)}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteArticle(article.id),
          },
        ]
      );
    },
    [deleteArticle]
  );

  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  const renderArticle = useCallback(
    ({ item }: { item: Article }) => (
      <ArticleCard
        article={item}
        onPress={() => handleArticlePress(item)}
        onFavorite={() => toggleFavorite(item.id)}
        onArchive={() => archiveArticle(item.id)}
        onDelete={() => handleDeleteArticle(item)}
      />
    ),
    [handleArticlePress, toggleFavorite, archiveArticle, handleDeleteArticle]
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
      <Text style={[styles.emptyEmoji]}>📚</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No articles yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Add your first article by tapping the + button or sharing a link to the app
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>Add Article</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = createStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.surface }]}
          onPress={handleSearchPress}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={[styles.searchPlaceholder, { color: colors.textTertiary }]}>
            Search articles...
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addIconButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <FilterBar
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        articleCounts={{
          all: articles.filter(a => !a.isArchived).length,
          unread: articles.filter(a => a.status === 'unread' && !a.isArchived).length,
          reading: articles.filter(a => a.status === 'reading' && !a.isArchived).length,
          favorites: articles.filter(a => a.isFavorite && !a.isArchived).length,
        }}
      />

      {/* Article List */}
      <FlatList
        data={filteredArticles}
        renderItem={renderArticle}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Add Article Modal */}
      <AddArticleModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </View>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    searchContainer: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      gap: Spacing.md,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: Spacing.sm,
    },
    searchPlaceholder: {
      fontSize: Typography.fontSizes.md,
    },
    addIconButton: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addIcon: {
      fontSize: 24,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    listContent: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing['2xl'],
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing['2xl'],
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
      lineHeight: 22,
      marginBottom: Spacing.xl,
    },
    addButton: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: Typography.fontSizes.md,
      fontWeight: Typography.fontWeights.semibold,
    },
  });

export default LibraryScreen;
