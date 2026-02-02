// Chapter Navigation Component - Navigate between chapters

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Chapter } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { formatChapterTitle } from '../../utils/chapterUtils';

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  onChapterChange: (index: number) => void;
}

const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  chapters,
  currentChapterIndex,
  onChapterChange,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  if (!chapters || chapters.length <= 1) {
    return null; // Don't show if there's only one chapter
  }

  const currentChapter = chapters[currentChapterIndex];
  const hasPrevious = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < chapters.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {/* Chapter Info */}
      <View style={styles.chapterInfo}>
        <Text style={[styles.chapterLabel, { color: colors.textSecondary }]}>
          Chapter {currentChapterIndex + 1} of {chapters.length}
        </Text>
        <Text style={[styles.chapterTitle, { color: colors.text }]} numberOfLines={1}>
          {currentChapter.title}
        </Text>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.surface, borderColor: colors.border },
            !hasPrevious && styles.buttonDisabled,
          ]}
          onPress={() => hasPrevious && onChapterChange(currentChapterIndex - 1)}
          disabled={!hasPrevious}
        >
          <Text style={[styles.buttonIcon, { color: hasPrevious ? colors.text : colors.textTertiary }]}>
            ←
          </Text>
          <Text style={[styles.buttonText, { color: hasPrevious ? colors.text : colors.textTertiary }]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.surface, borderColor: colors.border },
            !hasNext && styles.buttonDisabled,
          ]}
          onPress={() => hasNext && onChapterChange(currentChapterIndex + 1)}
          disabled={!hasNext}
        >
          <Text style={[styles.buttonText, { color: hasNext ? colors.text : colors.textTertiary }]}>
            Next
          </Text>
          <Text style={[styles.buttonIcon, { color: hasNext ? colors.text : colors.textTertiary }]}>
            →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  chapterInfo: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  chapterLabel: {
    fontSize: Typography.fontSizes.sm,
  },
  chapterTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: Typography.fontSizes.md,
  },
  buttonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
});

export default ChapterNavigation;
