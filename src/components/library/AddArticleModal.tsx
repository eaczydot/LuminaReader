// Add Article Modal - Modal for adding new articles by URL

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useArticleStore } from '../../stores';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { isValidUrl, generateId, countWords, calculateReadingTime, extractDomain } from '../../utils/helpers';

interface AddArticleModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddArticleModal: React.FC<AddArticleModalProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addArticle } = useArticleStore();

  const handleAdd = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    if (!isValidUrl(normalizedUrl)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, you would fetch the article content here
      // For now, we'll create a placeholder article
      const domain = extractDomain(normalizedUrl);

      addArticle({
        url: normalizedUrl,
        title: `Article from ${domain}`,
        content: 'Article content will be fetched here...',
        wordCount: 0,
        estimatedReadTime: 5,
        readingProgress: 0,
        isArchived: false,
        isFavorite: false,
        tagIds: [],
        status: 'unread',
        source: 'manual',
      });

      setUrl('');
      onClose();
      Alert.alert('Success', 'Article added to your library');
    } catch (error) {
      Alert.alert('Error', 'Failed to add article. Please try again.');
    }

    setIsLoading(false);
  };

  const handlePaste = async () => {
    // In a real app, you would use Clipboard.getStringAsync()
    // For now, just show a message
    Alert.alert('Paste', 'Paste functionality would paste from clipboard');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Add Article</Text>
          <TouchableOpacity onPress={handleAdd} disabled={isLoading}>
            <Text
              style={[
                styles.addButton,
                { color: colors.primary },
                isLoading && styles.disabled,
              ]}
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Article URL</Text>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <Text style={styles.inputIcon}>🔗</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="https://example.com/article"
              placeholderTextColor={colors.textTertiary}
              value={url}
              onChangeText={setUrl}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            {url.length > 0 && (
              <TouchableOpacity onPress={() => setUrl('')}>
                <Text style={[styles.clearIcon, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.pasteButton, { backgroundColor: colors.surface }]}
            onPress={handlePaste}
          >
            <Text style={[styles.pasteButtonText, { color: colors.text }]}>
              📋 Paste from Clipboard
            </Text>
          </TouchableOpacity>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Fetching article...
              </Text>
            </View>
          )}
        </View>

        {/* Tips */}
        <View style={[styles.tips, { backgroundColor: colors.surface }]}>
          <Text style={styles.tipsIcon}>💡</Text>
          <View style={styles.tipsContent}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>Tip</Text>
            <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
              You can also share articles directly from your browser or other apps using the share sheet.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: Typography.fontSizes.md,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  addButton: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    padding: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    paddingVertical: Spacing.md,
  },
  clearIcon: {
    fontSize: 16,
    padding: Spacing.sm,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  pasteButtonText: {
    fontSize: Typography.fontSizes.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSizes.md,
  },
  tips: {
    flexDirection: 'row',
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  tipsIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  tipsText: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
  },
});

export default AddArticleModal;
