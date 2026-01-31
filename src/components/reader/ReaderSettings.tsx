// Reader Settings Component - Modal for reader customization

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useSettingsStore } from '../../stores';
import { Colors, Spacing, Typography, BorderRadius, ReaderDefaults } from '../../constants/theme';

interface ReaderSettingsProps {
  visible: boolean;
  onClose: () => void;
}

const ReaderSettings: React.FC<ReaderSettingsProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const {
    theme,
    fontSize,
    fontFamily,
    lineHeight,
    margins,
    setTheme,
    setFontSize,
    setFontFamily,
    setLineHeight,
    setMargins,
    resetReaderSettings,
  } = useSettingsStore();

  const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: colors.primary }]}>Done</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Reader Settings</Text>
          <TouchableOpacity onPress={resetReaderSettings}>
            <Text style={[styles.resetButton, { color: colors.primary }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Theme Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
            <View style={styles.themeButtons}>
              {themes.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.themeButton,
                    { backgroundColor: colors.surface },
                    theme === t && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setTheme(t)}
                >
                  <Text style={styles.themeIcon}>
                    {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '⚙️'}
                  </Text>
                  <Text style={[styles.themeLabel, { color: colors.text }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Font Size */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Font Size</Text>
              <Text style={[styles.sectionValue, { color: colors.textSecondary }]}>
                {fontSize}pt
              </Text>
            </View>
            <View style={styles.sliderRow}>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>A</Text>
              <View style={styles.sliderContainer}>
                {/* Note: In real app, you'd need to install @react-native-community/slider */}
                <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.sliderFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${((fontSize - 12) / 20) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.sliderButtons}>
                  <TouchableOpacity
                    style={[styles.sliderButton, { backgroundColor: colors.surface }]}
                    onPress={() => setFontSize(Math.max(12, fontSize - 2))}
                  >
                    <Text style={[styles.sliderButtonText, { color: colors.text }]}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sliderButton, { backgroundColor: colors.surface }]}
                    onPress={() => setFontSize(Math.min(32, fontSize + 2))}
                  >
                    <Text style={[styles.sliderButtonText, { color: colors.text }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.sliderLabelLarge, { color: colors.textSecondary }]}>A</Text>
            </View>
          </View>

          {/* Font Family */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Font Family</Text>
            <View style={styles.fontButtons}>
              {ReaderDefaults.availableFonts.map(font => (
                <TouchableOpacity
                  key={font.value}
                  style={[
                    styles.fontButton,
                    { backgroundColor: colors.surface },
                    fontFamily === font.value && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setFontFamily(font.value)}
                >
                  <Text
                    style={[
                      styles.fontLabel,
                      { color: colors.text, fontFamily: font.value === 'System' ? undefined : font.value },
                    ]}
                  >
                    Aa
                  </Text>
                  <Text style={[styles.fontName, { color: colors.textSecondary }]}>
                    {font.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Line Height */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Line Height</Text>
              <Text style={[styles.sectionValue, { color: colors.textSecondary }]}>
                {lineHeight.toFixed(1)}
              </Text>
            </View>
            <View style={styles.lineHeightButtons}>
              {[1.2, 1.4, 1.6, 1.8, 2.0].map(lh => (
                <TouchableOpacity
                  key={lh}
                  style={[
                    styles.lineHeightButton,
                    { backgroundColor: colors.surface },
                    lineHeight === lh && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setLineHeight(lh)}
                >
                  <View style={styles.lineHeightPreview}>
                    {[1, 2, 3].map(i => (
                      <View
                        key={i}
                        style={[
                          styles.lineHeightLine,
                          { backgroundColor: colors.textTertiary, marginBottom: lh * 2 },
                        ]}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Margins */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Margins</Text>
              <Text style={[styles.sectionValue, { color: colors.textSecondary }]}>
                {margins}px
              </Text>
            </View>
            <View style={styles.marginButtons}>
              {[8, 16, 24, 32, 48].map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.marginButton,
                    { backgroundColor: colors.surface },
                    margins === m && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setMargins(m)}
                >
                  <View style={[styles.marginPreview, { padding: m / 4 }]}>
                    <View style={[styles.marginContent, { backgroundColor: colors.textTertiary }]} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={[styles.preview, { backgroundColor: colors.surface, paddingHorizontal: margins }]}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
            <Text
              style={[
                styles.previewText,
                {
                  color: colors.text,
                  fontSize,
                  lineHeight: fontSize * lineHeight,
                  fontFamily: fontFamily === 'System' ? undefined : fontFamily,
                },
              ]}
            >
              The quick brown fox jumps over the lazy dog. This is a preview of how your reading experience will look.
            </Text>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
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
  closeButton: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  resetButton: {
    fontSize: Typography.fontSizes.md,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  sectionValue: {
    fontSize: Typography.fontSizes.sm,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  themeIcon: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  themeLabel: {
    fontSize: Typography.fontSizes.sm,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 14,
  },
  sliderLabelLarge: {
    fontSize: 20,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  fontButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  fontButton: {
    width: '31%',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  fontLabel: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  fontName: {
    fontSize: Typography.fontSizes.xs,
  },
  lineHeightButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  lineHeightButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  lineHeightPreview: {
    width: 30,
  },
  lineHeightLine: {
    height: 2,
    borderRadius: 1,
  },
  marginButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  marginButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  marginPreview: {
    flex: 1,
  },
  marginContent: {
    flex: 1,
    borderRadius: 2,
  },
  preview: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  previewTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
  },
  previewText: {
    textAlign: 'left',
  },
  bottomPadding: {
    height: Spacing['3xl'],
  },
});

export default ReaderSettings;
