// Article Card Component - Displays article preview in lists

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
} from 'react-native';
import { Article } from '../../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import { formatDate, formatReadingTime, extractDomain, truncateText } from '../../utils/helpers';

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
  onFavorite?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onPress,
  onFavorite,
  onArchive,
  onDelete,
  compact = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const statusColors = {
    unread: colors.info,
    reading: colors.warning,
    finished: colors.success,
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: colors.surface }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={2}>
            {article.title}
          </Text>
          <View style={styles.compactMeta}>
            <Text style={[styles.compactDomain, { color: colors.textSecondary }]}>
              {extractDomain(article.url)}
            </Text>
            <Text style={[styles.dot, { color: colors.textTertiary }]}>•</Text>
            <Text style={[styles.compactTime, { color: colors.textTertiary }]}>
              {formatReadingTime(article.estimatedReadTime)}
            </Text>
          </View>
        </View>
        {article.isFavorite && <Text style={styles.favoriteIcon}>❤️</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }, Shadows.sm]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Cover Image */}
      {article.coverImage && (
        <Image source={{ uri: article.coverImage }} style={styles.coverImage} />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Status & Favorite */}
        <View style={styles.topRow}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusColors[article.status] },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {article.status === 'unread'
                ? 'New'
                : article.status === 'reading'
                ? `${article.readingProgress}%`
                : 'Done'}
            </Text>
          </View>
          <View style={styles.actions}>
            {onFavorite && (
              <TouchableOpacity onPress={onFavorite} style={styles.actionButton}>
                <Text style={styles.actionIcon}>{article.isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {article.title}
        </Text>

        {/* Author */}
        {article.author && (
          <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
            By {article.author}
          </Text>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <Text style={[styles.excerpt, { color: colors.textTertiary }]} numberOfLines={2}>
            {truncateText(article.excerpt, 120)}
          </Text>
        )}

        {/* Meta Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <Text style={[styles.domain, { color: colors.textSecondary }]}>
              {extractDomain(article.url)}
            </Text>
            <Text style={[styles.dot, { color: colors.textTertiary }]}>•</Text>
            <Text style={[styles.readTime, { color: colors.textTertiary }]}>
              {formatReadingTime(article.estimatedReadTime)}
            </Text>
          </View>
          <Text style={[styles.date, { color: colors.textTertiary }]}>
            {formatDate(article.savedAt)}
          </Text>
        </View>

        {/* Progress Bar */}
        {article.readingProgress > 0 && article.readingProgress < 100 && (
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${article.readingProgress}%` },
              ]}
            />
          </View>
        )}

        {/* Highlights Badge */}
        {article.highlights.length > 0 && (
          <View style={[styles.highlightsBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.highlightsBadgeText, { color: colors.primary }]}>
              ✨ {article.highlights.length} highlight{article.highlights.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  content: {
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: Spacing.xs,
  },
  actionIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    lineHeight: 24,
    marginBottom: Spacing.xs,
  },
  author: {
    fontSize: Typography.fontSizes.sm,
    marginBottom: Spacing.sm,
  },
  excerpt: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  domain: {
    fontSize: Typography.fontSizes.sm,
  },
  dot: {
    marginHorizontal: Spacing.xs,
    fontSize: Typography.fontSizes.sm,
  },
  readTime: {
    fontSize: Typography.fontSizes.sm,
  },
  date: {
    fontSize: Typography.fontSizes.sm,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  highlightsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  highlightsBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: Spacing.xs,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactDomain: {
    fontSize: Typography.fontSizes.sm,
  },
  compactTime: {
    fontSize: Typography.fontSizes.sm,
  },
  favoriteIcon: {
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
});

export default ArticleCard;
