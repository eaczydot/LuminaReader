// Article Info Screen - Detailed article information and management

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useArticleStore, useFolderStore, useTagStore } from '../../stores';
import { RootStackParamList } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { formatDate, formatReadingTime, extractDomain } from '../../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ArticleInfoRouteProp = RouteProp<RootStackParamList, 'ArticleInfo'>;

const ArticleInfoScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ArticleInfoRouteProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const { articleId } = route.params;

  const { articles, updateArticle, deleteArticle, toggleFavorite, archiveArticle } = useArticleStore();
  const { folders } = useFolderStore();
  const { tags, getTagsByIds } = useTagStore();

  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Article not found</Text>
      </View>
    );
  }

  const articleTags = getTagsByIds(article.tagIds);
  const folder = folders.find(f => f.id === article.folderId);

  const handleDelete = () => {
    Alert.alert(
      'Delete Article',
      'Are you sure you want to delete this article? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteArticle(articleId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const InfoRow = ({ label, value, icon }: { label: string; value: string; icon?: string }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <View style={styles.infoLabel}>
        {icon && <Text style={styles.infoIcon}>{icon}</Text>}
        <Text style={[styles.labelText, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.valueText, { color: colors.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Title Section */}
      <View style={[styles.titleSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
        {article.author && (
          <Text style={[styles.author, { color: colors.textSecondary }]}>
            By {article.author}
          </Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={() => toggleFavorite(articleId)}
        >
          <Text style={styles.actionIcon}>{article.isFavorite ? '❤️' : '🤍'}</Text>
          <Text style={[styles.actionText, { color: colors.text }]}>
            {article.isFavorite ? 'Favorited' : 'Favorite'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={() => archiveArticle(articleId)}
        >
          <Text style={styles.actionIcon}>{article.isArchived ? '📥' : '📦'}</Text>
          <Text style={[styles.actionText, { color: colors.text }]}>
            {article.isArchived ? 'Unarchive' : 'Archive'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={handleDelete}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Information Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Information</Text>

        <InfoRow icon="🌐" label="Source" value={extractDomain(article.url)} />
        <InfoRow icon="📅" label="Saved" value={formatDate(article.savedAt)} />
        <InfoRow icon="⏱️" label="Reading Time" value={formatReadingTime(article.estimatedReadTime)} />
        <InfoRow icon="📊" label="Progress" value={`${article.readingProgress}%`} />
        <InfoRow icon="📝" label="Words" value={article.wordCount.toLocaleString()} />
        <InfoRow icon="✨" label="Highlights" value={article.highlights.length.toString()} />
        <InfoRow icon="📌" label="Status" value={article.status.charAt(0).toUpperCase() + article.status.slice(1)} />
      </View>

      {/* Folder Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Folder</Text>
        <TouchableOpacity style={[styles.folderRow, { borderColor: colors.border }]}>
          <Text style={styles.folderIcon}>📁</Text>
          <Text style={[styles.folderText, { color: colors.text }]}>
            {folder ? folder.name : 'No folder'}
          </Text>
          <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Tags Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
        <View style={styles.tagsContainer}>
          {articleTags.length > 0 ? (
            articleTags.map(tag => (
              <View
                key={tag.id}
                style={[styles.tag, { backgroundColor: tag.color + '20' }]}
              >
                <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noTags, { color: colors.textSecondary }]}>No tags</Text>
          )}
          <TouchableOpacity style={[styles.addTagButton, { borderColor: colors.border }]}>
            <Text style={[styles.addTagText, { color: colors.primary }]}>+ Add Tag</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* URL Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>URL</Text>
        <Text style={[styles.url, { color: colors.textSecondary }]} numberOfLines={3}>
          {article.url}
        </Text>
        <TouchableOpacity style={[styles.copyButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.copyButtonText}>Copy URL</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleSection: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.sm,
  },
  author: {
    fontSize: Typography.fontSizes.md,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.fontSizes.sm,
  },
  section: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  labelText: {
    fontSize: Typography.fontSizes.md,
  },
  valueText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    maxWidth: '50%',
    textAlign: 'right',
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  folderIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  folderText: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
  },
  changeText: {
    fontSize: Typography.fontSizes.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  noTags: {
    fontSize: Typography.fontSizes.md,
  },
  addTagButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addTagText: {
    fontSize: Typography.fontSizes.sm,
  },
  url: {
    fontSize: Typography.fontSizes.sm,
    marginBottom: Spacing.md,
  },
  copyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  errorText: {
    fontSize: Typography.fontSizes.lg,
    textAlign: 'center',
    marginTop: Spacing['3xl'],
  },
  bottomPadding: {
    height: Spacing['3xl'],
  },
});

export default ArticleInfoScreen;
