// Search Screen - Full-text article search

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useArticleStore, useTagStore, useFolderStore } from '../../stores';
import { Article, RootStackParamList } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { truncateText, formatDate, debounce } from '../../utils/helpers';
import ArticleCard from '../../components/library/ArticleCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { articles, toggleFavorite, archiveArticle, deleteArticle } = useArticleStore();
  const { tags } = useTagStore();
  const { folders } = useFolderStore();

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Search function
  const searchArticles = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      const lowerQuery = searchQuery.toLowerCase();
      const filtered = articles.filter(article => {
        // Search in title
        if (article.title.toLowerCase().includes(lowerQuery)) return true;
        // Search in author
        if (article.author?.toLowerCase().includes(lowerQuery)) return true;
        // Search in content
        if (article.content.toLowerCase().includes(lowerQuery)) return true;
        // Search in excerpt
        if (article.excerpt?.toLowerCase().includes(lowerQuery)) return true;
        // Search in URL
        if (article.url.toLowerCase().includes(lowerQuery)) return true;
        // Search in highlights
        if (article.highlights.some(h => h.text.toLowerCase().includes(lowerQuery))) return true;
        return false;
      });

      setResults(filtered);
    },
    [articles]
  );

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((q: string) => searchArticles(q), 300),
    [searchArticles]
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const handleArticlePress = (article: Article) => {
    // Add to recent searches
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
    navigation.navigate('Reader', { articleId: article.id });
  };

  const handleRecentSearchPress = (search: string) => {
    setQuery(search);
    searchArticles(search);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <ArticleCard
      article={item}
      onPress={() => handleArticlePress(item)}
      onFavorite={() => toggleFavorite(item.id)}
      onArchive={() => archiveArticle(item.id)}
      onDelete={() => deleteArticle(item.id)}
      compact
    />
  );

  const renderRecentSearches = () => (
    <View style={styles.recentSection}>
      <View style={styles.recentHeader}>
        <Text style={[styles.recentTitle, { color: colors.text }]}>Recent Searches</Text>
        {recentSearches.length > 0 && (
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={[styles.clearButton, { color: colors.primary }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      {recentSearches.length === 0 ? (
        <Text style={[styles.noRecent, { color: colors.textSecondary }]}>
          No recent searches
        </Text>
      ) : (
        recentSearches.map((search, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.recentItem, { borderBottomColor: colors.border }]}
            onPress={() => handleRecentSearchPress(search)}
          >
            <Text style={styles.recentIcon}>🔍</Text>
            <Text style={[styles.recentText, { color: colors.text }]}>{search}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderEmptyResults = () => (
    <View style={styles.emptyResults}>
      <Text style={styles.emptyEmoji}>🔎</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Try searching for a different term
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search articles, highlights, authors..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={handleQueryChange}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleQueryChange('')}>
            <Text style={[styles.clearIcon, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results or Recent Searches */}
      {query.length === 0 ? (
        renderRecentSearches()
      ) : results.length === 0 ? (
        renderEmptyResults()
      ) : (
        <FlatList
          data={results}
          renderItem={renderArticle}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    paddingVertical: Spacing.md,
  },
  clearIcon: {
    fontSize: 16,
    padding: Spacing.sm,
  },
  resultsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  resultsCount: {
    fontSize: Typography.fontSizes.sm,
    marginBottom: Spacing.md,
  },
  recentSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  recentTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  clearButton: {
    fontSize: Typography.fontSizes.sm,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  recentIcon: {
    fontSize: 16,
    marginRight: Spacing.md,
    opacity: 0.5,
  },
  recentText: {
    fontSize: Typography.fontSizes.md,
  },
  noRecent: {
    fontSize: Typography.fontSizes.md,
    fontStyle: 'italic',
  },
  emptyResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['5xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.md,
  },
});

export default SearchScreen;
