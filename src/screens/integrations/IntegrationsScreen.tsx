// Integrations Screen - Manage third-party integrations

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIntegrationStore } from '../../stores';
import { IntegrationType, RootStackParamList } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { IntegrationIcons, IntegrationColors } from '../../constants/theme';
import { formatDate } from '../../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const IntegrationsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const { integrations, getConnectedIntegrations, getSyncState } = useIntegrationStore();

  const connectedIntegrations = getConnectedIntegrations();
  const allIntegrations = Object.values(integrations);

  const handleIntegrationPress = (type: IntegrationType) => {
    navigation.navigate('IntegrationSetup', { type });
  };

  const renderIntegrationCard = (type: IntegrationType) => {
    const integration = integrations[type];
    const syncState = getSyncState(type);

    return (
      <TouchableOpacity
        key={type}
        style={[styles.integrationCard, { backgroundColor: colors.surface }]}
        onPress={() => handleIntegrationPress(type)}
      >
        <View style={[styles.iconContainer, { backgroundColor: IntegrationColors[type] + '20' }]}>
          <Text style={styles.icon}>{IntegrationIcons[type]}</Text>
        </View>
        <View style={styles.integrationInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.integrationName, { color: colors.text }]}>
              {integration.name}
            </Text>
            {integration.isConnected && (
              <View style={[styles.connectedBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.connectedText, { color: colors.success }]}>Connected</Text>
              </View>
            )}
          </View>
          <Text style={[styles.integrationDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {integration.description}
          </Text>
          {integration.isConnected && integration.lastSyncAt && (
            <Text style={[styles.lastSync, { color: colors.textTertiary }]}>
              Last synced: {formatDate(integration.lastSyncAt)}
            </Text>
          )}
        </View>
        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Connected Integrations */}
      {connectedIntegrations.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Connected ({connectedIntegrations.length})
          </Text>
          {connectedIntegrations.map(integration => renderIntegrationCard(integration.type))}
        </View>
      )}

      {/* Available Integrations */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {connectedIntegrations.length > 0 ? 'Available' : 'All Integrations'}
        </Text>
        {allIntegrations
          .filter(i => !i.isConnected)
          .map(integration => renderIntegrationCard(integration.type))}
      </View>

      {/* Import/Export Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Import & Export</Text>
        <TouchableOpacity
          style={[styles.integrationCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('ImportExport')}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.icon}>📦</Text>
          </View>
          <View style={styles.integrationInfo}>
            <Text style={[styles.integrationName, { color: colors.text }]}>
              Import & Export
            </Text>
            <Text style={[styles.integrationDescription, { color: colors.textSecondary }]}>
              Import from CSV/JSON or export your data
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
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
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.md,
  },
  integrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  integrationInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  integrationName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
  connectedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  connectedText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
  },
  integrationDescription: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 18,
  },
  lastSync: {
    fontSize: Typography.fontSizes.xs,
    marginTop: Spacing.xs,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  bottomPadding: {
    height: Spacing['3xl'],
  },
});

export default IntegrationsScreen;
