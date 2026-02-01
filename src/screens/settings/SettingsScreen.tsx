// Settings Screen - App settings and preferences

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  useColorScheme,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSettingsStore, useArticleStore, useFolderStore, useTagStore } from '../../stores';
import { RootStackParamList } from '../../types';
import { Colors, Spacing, Typography, BorderRadius, ReaderDefaults } from '../../constants/theme';
import Constants from 'expo-constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const {
    theme,
    fontSize,
    autoArchiveOnComplete,
    showReadingProgress,
    enableSync,
    syncOnWifiOnly,
    setTheme,
    setAutoArchiveOnComplete,
    setShowReadingProgress,
    setEnableSync,
    setSyncOnWifiOnly,
    resetAllSettings,
  } = useSettingsStore();

  const { articles } = useArticleStore();
  const { folders } = useFolderStore();
  const { tags } = useTagStore();

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetAllSettings,
        },
      ]
    );
  };

  const SettingRow = ({
    icon,
    title,
    description,
    value,
    onValueChange,
  }: {
    icon: string;
    title: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
      />
    </View>
  );

  const LinkRow = ({
    icon,
    title,
    description,
    onPress,
    value,
  }: {
    icon: string;
    title: string;
    description?: string;
    onPress: () => void;
    value?: string;
  }) => (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {value && (
        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>
      )}
      <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
          <LinkRow
            icon="🎨"
            title="Theme"
            description="Choose light, dark, or system theme"
            value={theme.charAt(0).toUpperCase() + theme.slice(1)}
            onPress={() => {
              const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              setTheme(nextTheme);
            }}
          />
          <LinkRow
            icon="📖"
            title="Reader Settings"
            description="Font size, family, and line height"
            value={`${fontSize}pt`}
            onPress={() => {
              // Open reader settings modal
              Alert.alert('Reader Settings', 'Open this in the reader view');
            }}
          />
        </View>
      </View>

      {/* Reading Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reading</Text>
        <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="📊"
            title="Show Reading Progress"
            description="Display progress bar while reading"
            value={showReadingProgress}
            onValueChange={setShowReadingProgress}
          />
          <SettingRow
            icon="📦"
            title="Auto Archive on Complete"
            description="Archive articles when finished reading"
            value={autoArchiveOnComplete}
            onValueChange={setAutoArchiveOnComplete}
          />
        </View>
      </View>

      {/* Sync Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sync</Text>
        <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="🔄"
            title="Enable Sync"
            description="Sync with connected integrations"
            value={enableSync}
            onValueChange={setEnableSync}
          />
          <SettingRow
            icon="📶"
            title="Sync on WiFi Only"
            description="Only sync when connected to WiFi"
            value={syncOnWifiOnly}
            onValueChange={setSyncOnWifiOnly}
          />
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
        <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
          <LinkRow
            icon="📦"
            title="Import & Export"
            description="Import or export your data"
            onPress={() => navigation.navigate('ImportExport')}
          />
          <LinkRow
            icon="🔗"
            title="Integrations"
            description="Manage connected services"
            onPress={() => navigation.navigate('Main', { screen: 'Integrations' } as any)}
          />
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
        <View style={[styles.statsGrid, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{articles.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Articles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{folders.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Folders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{tags.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tags</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {articles.reduce((sum, a) => sum + a.highlights.length, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highlights</Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
          <LinkRow
            icon="ℹ️"
            title="Version"
            value={Constants.expoConfig?.version || '1.0.0'}
            onPress={() => {}}
          />
          <LinkRow
            icon="📧"
            title="Send Feedback"
            onPress={() => Linking.openURL('mailto:feedback@luminareader.app')}
          />
          <LinkRow
            icon="⭐"
            title="Rate the App"
            onPress={() => {
              // Open app store
              Alert.alert('Rate', 'Thanks for your support!');
            }}
          />
          <LinkRow
            icon="📜"
            title="Privacy Policy"
            onPress={() => Linking.openURL('https://luminareader.app/privacy')}
          />
        </View>
      </View>

      {/* Reset Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.error }]}
          onPress={handleResetSettings}
        >
          <Text style={[styles.resetButtonText, { color: colors.error }]}>Reset All Settings</Text>
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
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sectionContent: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
  settingDescription: {
    fontSize: Typography.fontSizes.sm,
    marginTop: 2,
  },
  settingValue: {
    fontSize: Typography.fontSizes.sm,
    marginRight: Spacing.sm,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
  },
  statLabel: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.xs,
  },
  resetButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
  bottomPadding: {
    height: Spacing['3xl'],
  },
});

export default SettingsScreen;
