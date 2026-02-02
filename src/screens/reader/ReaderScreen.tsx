// Reader Screen - Article reading view with highlighting

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useArticleStore, useSettingsStore } from '../../stores';
import { RootStackParamList, HighlightColor, Highlight } from '../../types';
import { Colors, Spacing, Typography, BorderRadius, HIGHLIGHT_COLORS } from '../../constants/theme';
import { formatDate, formatReadingTime, extractDomain } from '../../utils/helpers';
import { shareService } from '../../services/shareService';
import HighlightMenu from '../../components/reader/HighlightMenu';
import ReaderSettings from '../../components/reader/ReaderSettings';
import ChapterNavigation from '../../components/reader/ChapterNavigation';
import ReadingPassIndicator from '../../components/reader/ReadingPassIndicator';
import CopyChapterMenu from '../../components/reader/CopyChapterMenu';
import { extractChapterContent } from '../../utils/chapterUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReaderRouteProp = RouteProp<RootStackParamList, 'Reader'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ReaderScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReaderRouteProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const scrollViewRef = useRef<ScrollView>(null);

  const { articleId } = route.params;

  const {
    articles,
    updateReadingProgress,
    toggleFavorite,
    addHighlight,
    deleteHighlight,
    updateHighlightNote,
    updateHighlightColor,
    detectAndUpdateChapters,
    setCurrentChapter,
    initializeReadingPass,
    toggleReadingPass,
  } = useArticleStore();

  const {
    fontSize,
    fontFamily,
    lineHeight,
    margins,
    defaultHighlightColor,
    theme,
  } = useSettingsStore();

  const article = articles.find(a => a.id === articleId);

  const [showHeader, setShowHeader] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showCopyMenu, setShowCopyMenu] = useState(false);

  const headerOpacity = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);

  // Initialize chapters and reading pass progress on mount
  useEffect(() => {
    if (article) {
      // Detect chapters if not already detected
      if (!article.chapters || article.chapters.length === 0) {
        detectAndUpdateChapters(articleId);
      }

      // Initialize reading pass progress if not set
      if (!article.readingPassProgress) {
        initializeReadingPass(articleId);
      }
    }
  }, [article?.id]); // Only run when article ID changes

  // Handle scroll to track reading progress
  const handleScroll = useCallback(
    (event: any) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const scrollY = contentOffset.y;

      // Calculate reading progress
      const progress = Math.min(
        100,
        Math.max(0, (scrollY / (contentSize.height - layoutMeasurement.height)) * 100)
      );

      if (article && Math.abs(progress - article.readingProgress) > 5) {
        updateReadingProgress(articleId, Math.round(progress));
      }

      // Show/hide header based on scroll direction
      if (scrollY > lastScrollY.current && scrollY > 100) {
        if (showHeader) {
          setShowHeader(false);
          Animated.timing(headerOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      } else if (scrollY < lastScrollY.current) {
        if (!showHeader) {
          setShowHeader(true);
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }

      lastScrollY.current = scrollY;
    },
    [article, articleId, updateReadingProgress, showHeader, headerOpacity]
  );

  // Handle text selection for highlighting
  const handleTextSelection = useCallback(
    (text: string, x: number, y: number) => {
      if (text.length > 0) {
        setSelectedText(text);
        setMenuPosition({ x, y });
        setShowHighlightMenu(true);
      }
    },
    []
  );

  // Create highlight from selected text
  const handleCreateHighlight = useCallback(
    (color: HighlightColor) => {
      if (selectedText && article) {
        addHighlight(articleId, {
          text: selectedText,
          color,
          startOffset: 0, // Would need proper offset calculation
          endOffset: selectedText.length,
        });
        setSelectedText('');
        setShowHighlightMenu(false);
      }
    },
    [selectedText, article, articleId, addHighlight]
  );

  // Handle highlight tap
  const handleHighlightPress = useCallback(
    (highlight: Highlight, x: number, y: number) => {
      setSelectedHighlight(highlight);
      setMenuPosition({ x, y });
      setShowHighlightMenu(true);
    },
    []
  );

  // Delete highlight
  const handleDeleteHighlight = useCallback(() => {
    if (selectedHighlight) {
      deleteHighlight(articleId, selectedHighlight.id);
      setSelectedHighlight(null);
      setShowHighlightMenu(false);
    }
  }, [selectedHighlight, articleId, deleteHighlight]);

  // Share article
  const handleShare = useCallback(async () => {
    if (article) {
      await shareService.shareArticle(article, 'markdown');
    }
  }, [article]);

  // Copy highlight
  const handleCopyHighlight = useCallback(async () => {
    if (selectedHighlight) {
      await shareService.copyHighlight(selectedHighlight);
      setShowHighlightMenu(false);
    }
  }, [selectedHighlight]);

  // Handle chapter navigation
  const handleChapterChange = useCallback((chapterIndex: number) => {
    setCurrentChapter(articleId, chapterIndex);
    // Scroll to top when changing chapters
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [articleId, setCurrentChapter]);

  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>📄</Text>
          <Text style={[styles.notFoundText, { color: colors.text }]}>Article not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const readerColors = theme === 'dark' || (theme === 'system' && colorScheme === 'dark')
    ? Colors.dark
    : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: readerColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: readerColors.background, opacity: headerOpacity },
        ]}
      >
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.headerIcon, { color: readerColors.text }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerDomain, { color: readerColors.textSecondary }]} numberOfLines={1}>
            {extractDomain(article.url)}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => toggleFavorite(articleId)}>
            <Text style={styles.headerIcon}>{article.isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowCopyMenu(true)}>
            <Text style={styles.headerIcon}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowSettings(true)}>
            <Text style={styles.headerIcon}>Aa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Text style={styles.headerIcon}>↗</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Reading Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: readerColors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: readerColors.primary, width: `${article.readingProgress}%` },
          ]}
        />
      </View>

      {/* Article Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingHorizontal: margins }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Article Header */}
        <View style={styles.articleHeader}>
          <Text style={[styles.title, { color: readerColors.text, fontSize: fontSize + 8 }]}>
            {article.title}
          </Text>

          <View style={styles.meta}>
            {article.author && (
              <Text style={[styles.author, { color: readerColors.textSecondary }]}>
                By {article.author}
              </Text>
            )}
            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: readerColors.textTertiary }]}>
                {formatReadingTime(article.estimatedReadTime)}
              </Text>
              <Text style={[styles.metaDot, { color: readerColors.textTertiary }]}>•</Text>
              <Text style={[styles.metaText, { color: readerColors.textTertiary }]}>
                {formatDate(article.savedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Reading Pass Indicator */}
        {article.readingPassProgress && (
          <View style={styles.readingPassSection}>
            <ReadingPassIndicator
              progress={article.readingPassProgress}
              onPassToggle={(pass) => toggleReadingPass(articleId, pass)}
            />
          </View>
        )}

        {/* Article Body */}
        <Text
          style={[
            styles.body,
            {
              color: readerColors.text,
              fontSize,
              fontFamily: fontFamily === 'System' ? undefined : fontFamily,
              lineHeight: fontSize * lineHeight,
            },
          ]}
          selectable
        >
          {article.chapters && article.chapters.length > 1 && article.currentChapterIndex !== undefined
            ? extractChapterContent(article.content, article.chapters[article.currentChapterIndex])
            : article.content}
        </Text>

        {/* Chapter Navigation */}
        {article.chapters && article.chapters.length > 1 && (
          <View style={styles.chapterNavSection}>
            <ChapterNavigation
              chapters={article.chapters}
              currentChapterIndex={article.currentChapterIndex || 0}
              onChapterChange={handleChapterChange}
            />
          </View>
        )}

        {/* Highlights Section */}
        {article.highlights.length > 0 && (
          <View style={styles.highlightsSection}>
            <Text style={[styles.highlightsTitle, { color: readerColors.text }]}>
              Highlights ({article.highlights.length})
            </Text>
            {article.highlights.map(highlight => (
              <TouchableOpacity
                key={highlight.id}
                style={[
                  styles.highlightCard,
                  { backgroundColor: HIGHLIGHT_COLORS[highlight.color] + '40' },
                ]}
                onPress={(e) => handleHighlightPress(highlight, e.nativeEvent.pageX, e.nativeEvent.pageY)}
              >
                <Text style={[styles.highlightText, { color: readerColors.text }]}>
                  "{highlight.text}"
                </Text>
                {highlight.note && (
                  <Text style={[styles.highlightNote, { color: readerColors.textSecondary }]}>
                    Note: {highlight.note}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Highlight Menu */}
      <HighlightMenu
        visible={showHighlightMenu}
        position={menuPosition}
        selectedHighlight={selectedHighlight}
        onClose={() => {
          setShowHighlightMenu(false);
          setSelectedHighlight(null);
          setSelectedText('');
        }}
        onCreateHighlight={handleCreateHighlight}
        onDeleteHighlight={handleDeleteHighlight}
        onCopyHighlight={handleCopyHighlight}
        onUpdateColor={(color) => {
          if (selectedHighlight) {
            updateHighlightColor(articleId, selectedHighlight.id, color);
          }
        }}
      />

      {/* Reader Settings Modal */}
      <ReaderSettings
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Copy Chapter Menu */}
      <CopyChapterMenu
        visible={showCopyMenu}
        article={article}
        currentChapter={
          article.chapters && article.currentChapterIndex !== undefined
            ? article.chapters[article.currentChapterIndex]
            : null
        }
        onClose={() => setShowCopyMenu(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerDomain: {
    fontSize: Typography.fontSizes.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: 2,
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  progressFill: {
    height: '100%',
  },
  scrollView: {
    flex: 1,
    marginTop: 50,
  },
  content: {
    paddingTop: Spacing.xl,
  },
  articleHeader: {
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.md,
  },
  meta: {
    gap: Spacing.xs,
  },
  author: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: Typography.fontSizes.sm,
  },
  metaDot: {
    marginHorizontal: Spacing.sm,
  },
  body: {
    textAlign: 'left',
  },
  readingPassSection: {
    marginBottom: Spacing['2xl'],
  },
  chapterNavSection: {
    marginTop: Spacing['2xl'],
    marginHorizontal: -Spacing.md, // Extend to edges
  },
  highlightsSection: {
    marginTop: Spacing['3xl'],
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  highlightsTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.lg,
  },
  highlightCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  highlightText: {
    fontSize: Typography.fontSizes.md,
    fontStyle: 'italic',
  },
  highlightNote: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.sm,
  },
  bottomPadding: {
    height: 100,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  notFoundText: {
    fontSize: Typography.fontSizes.lg,
    marginBottom: Spacing.md,
  },
  backLink: {
    fontSize: Typography.fontSizes.md,
  },
});

export default ReaderScreen;
