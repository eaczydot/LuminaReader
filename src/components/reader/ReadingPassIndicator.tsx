// Reading Pass Indicator - Shows Karpathy's three-pass reading method progress

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { ReadingPassProgress } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import {
  getReadingPassDisplayName,
  getReadingPassDescription,
  getReadingPassEmoji,
  getReadingPassCompletionPercentage,
} from '../../utils/chapterUtils';

interface ReadingPassIndicatorProps {
  progress: ReadingPassProgress;
  onPassToggle?: (pass: 'manual' | 'explain' | 'qa') => void;
  compact?: boolean;
}

const ReadingPassIndicator: React.FC<ReadingPassIndicatorProps> = ({
  progress,
  onPassToggle,
  compact = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const completionPercentage = getReadingPassCompletionPercentage(progress);

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.compactText, { color: colors.textSecondary }]}>
          Reading Progress: {completionPercentage}%
        </Text>
        <View style={styles.compactDots}>
          <View style={[styles.dot, { backgroundColor: progress.manual ? colors.primary : colors.border }]} />
          <View style={[styles.dot, { backgroundColor: progress.explain ? colors.primary : colors.border }]} />
          <View style={[styles.dot, { backgroundColor: progress.qa ? colors.primary : colors.border }]} />
        </View>
      </View>
    );
  }

  const passes: Array<'manual' | 'explain' | 'qa'> = ['manual', 'explain', 'qa'];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Three-Pass Reading Method
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {completionPercentage}% Complete
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary, width: `${completionPercentage}%` },
          ]}
        />
      </View>

      {/* Pass Checklist */}
      <View style={styles.passList}>
        {passes.map((pass) => (
          <TouchableOpacity
            key={pass}
            style={[
              styles.passItem,
              { borderColor: colors.border },
              progress[pass] && { backgroundColor: colors.primary + '15' },
            ]}
            onPress={() => onPassToggle?.(pass)}
            disabled={!onPassToggle}
          >
            <View style={styles.passLeft}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: progress[pass] ? colors.primary : colors.border },
                  progress[pass] && { backgroundColor: colors.primary },
                ]}
              >
                {progress[pass] && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={[styles.passEmoji]}>{getReadingPassEmoji(pass)}</Text>
              <View style={styles.passTextContainer}>
                <Text style={[styles.passTitle, { color: colors.text }]}>
                  {getReadingPassDisplayName(pass)}
                </Text>
                <Text style={[styles.passDescription, { color: colors.textSecondary }]}>
                  {getReadingPassDescription(pass)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tip */}
      <View style={[styles.tip, { backgroundColor: colors.background }]}>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          💡 Tip: Use the copy button to share content with an LLM for passes 2 & 3
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  subtitle: {
    fontSize: Typography.fontSizes.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  passList: {
    gap: Spacing.sm,
  },
  passItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  passLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: Typography.fontWeights.bold,
  },
  passEmoji: {
    fontSize: 24,
  },
  passTextContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  passTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
  passDescription: {
    fontSize: Typography.fontSizes.sm,
  },
  tip: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tipText: {
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  compactText: {
    fontSize: Typography.fontSizes.xs,
  },
  compactDots: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default ReadingPassIndicator;
