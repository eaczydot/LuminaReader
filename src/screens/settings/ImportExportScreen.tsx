// Import/Export Screen - Data import and export functionality

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useArticleStore, useFolderStore, useTagStore } from '../../stores';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { exportService } from '../../services/storage/exportService';

const ImportExportScreen = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const { articles, importArticles, getAllHighlights } = useArticleStore();
  const { folders } = useFolderStore();
  const { tags } = useTagStore();

  const handleExportJson = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToJson(articles, tags, folders);
      Alert.alert('Success', 'Data exported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
    setIsExporting(false);
  };

  const handleExportArticles = async (format: 'json' | 'csv' | 'markdown') => {
    setIsExporting(true);
    try {
      await exportService.exportArticles(articles, {
        format,
        includeHighlights: true,
        includeTags: true,
        includeNotes: true,
      });
      Alert.alert('Success', 'Articles exported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to export articles');
    }
    setIsExporting(false);
  };

  const handleExportHighlights = async (format: 'json' | 'csv' | 'markdown') => {
    setIsExporting(true);
    try {
      const highlights = getAllHighlights();
      await exportService.exportHighlights(highlights, format);
      Alert.alert('Success', 'Highlights exported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to export highlights');
    }
    setIsExporting(false);
  };

  const handleImportJson = async () => {
    setIsImporting(true);
    try {
      const result = await exportService.importFromJson();
      if (result.success) {
        importArticles(result.articles);
        Alert.alert(
          'Success',
          `Imported ${result.importedCount} articles successfully`
        );
      } else {
        Alert.alert('Error', result.errors.join('\n'));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import data');
    }
    setIsImporting(false);
  };

  const handleImportInstapaper = async () => {
    setIsImporting(true);
    try {
      const result = await exportService.importInstapaperCsv();
      if (result.success) {
        importArticles(result.articles);
        Alert.alert(
          'Success',
          `Imported ${result.importedCount} articles from Instapaper`
        );
      } else {
        Alert.alert('Error', result.errors.join('\n'));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import from Instapaper CSV');
    }
    setIsImporting(false);
  };

  const handleImportPocket = async () => {
    setIsImporting(true);
    try {
      const result = await exportService.importPocketHtml();
      if (result.success) {
        importArticles(result.articles);
        Alert.alert(
          'Success',
          `Imported ${result.importedCount} articles from Pocket`
        );
      } else {
        Alert.alert('Error', result.errors.join('\n'));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import from Pocket HTML');
    }
    setIsImporting(false);
  };

  const ActionButton = ({
    icon,
    title,
    description,
    onPress,
    disabled,
  }: {
    icon: string;
    title: string;
    description: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: colors.surface },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <View style={styles.actionInfo}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Loading Indicator */}
      {(isExporting || isImporting) && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.overlay }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.white }]}>
            {isExporting ? 'Exporting...' : 'Importing...'}
          </Text>
        </View>
      )}

      {/* Export Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Export</Text>
        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          Export your articles, highlights, and settings
        </Text>

        <ActionButton
          icon="📦"
          title="Export All Data"
          description="Export everything as JSON (recommended for backup)"
          onPress={handleExportJson}
          disabled={isExporting}
        />

        <ActionButton
          icon="📄"
          title="Export Articles as JSON"
          description="Export articles in JSON format"
          onPress={() => handleExportArticles('json')}
          disabled={isExporting}
        />

        <ActionButton
          icon="📊"
          title="Export Articles as CSV"
          description="Export articles in spreadsheet format"
          onPress={() => handleExportArticles('csv')}
          disabled={isExporting}
        />

        <ActionButton
          icon="📝"
          title="Export Articles as Markdown"
          description="Export articles as individual .md files"
          onPress={() => handleExportArticles('markdown')}
          disabled={isExporting}
        />

        <ActionButton
          icon="✨"
          title="Export Highlights"
          description="Export all your highlights"
          onPress={() => handleExportHighlights('markdown')}
          disabled={isExporting}
        />
      </View>

      {/* Import Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Import</Text>
        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          Import articles from files or other services
        </Text>

        <ActionButton
          icon="📥"
          title="Import from JSON"
          description="Import a LuminaReader backup file"
          onPress={handleImportJson}
          disabled={isImporting}
        />

        <ActionButton
          icon="📰"
          title="Import Instapaper CSV"
          description="Import from Instapaper export file"
          onPress={handleImportInstapaper}
          disabled={isImporting}
        />

        <ActionButton
          icon="👜"
          title="Import Pocket HTML"
          description="Import from Pocket export file"
          onPress={handleImportPocket}
          disabled={isImporting}
        />
      </View>

      {/* Instructions */}
      <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
        <Text style={styles.infoIcon}>💡</Text>
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            How to export from other services
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Instapaper: Settings → Export → Download CSV{'\n'}
            • Pocket: Export from your Pocket account settings{'\n'}
            • For live sync, connect services in Integrations
          </Text>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSizes.md,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: Typography.fontSizes.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: Typography.fontSizes.sm,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  infoBox: {
    flexDirection: 'row',
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
  },
  bottomPadding: {
    height: Spacing['3xl'],
  },
});

export default ImportExportScreen;
