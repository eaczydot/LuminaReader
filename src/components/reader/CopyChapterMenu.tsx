// Copy Chapter Menu - Copy chapter content with reading pass templates

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Article, Chapter } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import {
  generateCopyTemplate,
  getReadingPassDisplayName,
  getReadingPassEmoji,
  extractChapterContent,
} from '../../utils/chapterUtils';

interface CopyChapterMenuProps {
  visible: boolean;
  article: Article;
  currentChapter: Chapter | null;
  onClose: () => void;
}

const CopyChapterMenu: React.FC<CopyChapterMenuProps> = ({
  visible,
  article,
  currentChapter,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const handleCopy = async (passType: 'manual' | 'explain' | 'qa') => {
    try {
      const template = generateCopyTemplate(article, currentChapter, passType);
      await Clipboard.setStringAsync(template);

      Alert.alert(
        'Copied!',
        `${getReadingPassDisplayName(passType)} template copied to clipboard.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleCopyPlain = async () => {
    try {
      const content = currentChapter
        ? extractChapterContent(article.content, currentChapter)
        : article.content;

      await Clipboard.setStringAsync(content);

      Alert.alert(
        'Copied!',
        'Plain text copied to clipboard.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.menu, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={[styles.title, { color: colors.text }]}>
              Copy {currentChapter ? 'Chapter' : 'Article'}
            </Text>
            {currentChapter && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                {currentChapter.title}
              </Text>
            )}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Three-Pass Reading Templates */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Reading Pass Templates
              </Text>

              <TouchableOpacity
                style={[styles.option, { backgroundColor: colors.surface }]}
                onPress={() => handleCopy('manual')}
              >
                <Text style={styles.emoji}>{getReadingPassEmoji('manual')}</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {getReadingPassDisplayName('manual')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    Simple formatted text for reading
                  </Text>
                </View>
                <Text style={[styles.arrow, { color: colors.textTertiary }]}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, { backgroundColor: colors.surface }]}
                onPress={() => handleCopy('explain')}
              >
                <Text style={styles.emoji}>{getReadingPassEmoji('explain')}</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {getReadingPassDisplayName('explain')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    Template asking LLM to explain & summarize
                  </Text>
                </View>
                <Text style={[styles.arrow, { color: colors.textTertiary }]}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, { backgroundColor: colors.surface }]}
                onPress={() => handleCopy('qa')}
              >
                <Text style={styles.emoji}>{getReadingPassEmoji('qa')}</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {getReadingPassDisplayName('qa')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    Template for Q&A and deeper exploration
                  </Text>
                </View>
                <Text style={[styles.arrow, { color: colors.textTertiary }]}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Plain Copy */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Plain Text
              </Text>

              <TouchableOpacity
                style={[styles.option, { backgroundColor: colors.surface }]}
                onPress={handleCopyPlain}
              >
                <Text style={styles.emoji}>📋</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    Copy Plain Text
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    Copy without template
                  </Text>
                </View>
                <Text style={[styles.arrow, { color: colors.textTertiary }]}>→</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.surface }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '80%',
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
  },
  subtitle: {
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 32,
  },
  optionText: {
    flex: 1,
    gap: Spacing.xs,
  },
  optionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
  optionDescription: {
    fontSize: Typography.fontSizes.sm,
  },
  arrow: {
    fontSize: Typography.fontSizes.lg,
  },
  cancelButton: {
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
});

export default CopyChapterMenu;
