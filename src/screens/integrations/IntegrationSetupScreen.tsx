// Integration Setup Screen - Configure individual integrations

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIntegrationStore } from '../../stores';
import { IntegrationType, RootStackParamList } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { IntegrationIcons, IntegrationColors } from '../../constants/theme';

// Import services
import { notionService } from '../../services/integrations/notionService';
import { pocketService } from '../../services/integrations/pocketService';
import { readwiseService } from '../../services/integrations/readwiseService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type IntegrationSetupRouteProp = RouteProp<RootStackParamList, 'IntegrationSetup'>;

const IntegrationSetupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<IntegrationSetupRouteProp>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const { type } = route.params;

  const {
    integrations,
    connect,
    disconnect,
    updateSettings,
    setApiKey,
    getIntegration,
  } = useIntegrationStore();

  const integration = getIntegration(type);

  const [apiKey, setApiKeyInput] = useState(integration.settings.apiKey || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(integration.settings.syncEnabled);
  const [autoSync, setAutoSync] = useState(integration.settings.autoSync);
  const [importHighlights, setImportHighlights] = useState(integration.settings.importHighlights);
  const [exportHighlights, setExportHighlights] = useState(integration.settings.exportHighlights);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      switch (type) {
        case 'notion':
          await notionService.initiateOAuth();
          // After OAuth, you'd get the token and save it
          connect(type, { syncEnabled: true });
          break;

        case 'pocket':
          const success = await pocketService.authenticate();
          if (success) {
            connect(type, { syncEnabled: true });
          }
          break;

        case 'readwise':
          if (!apiKey) {
            Alert.alert('Error', 'Please enter your Readwise API token');
            setIsConnecting(false);
            return;
          }
          const isValid = await readwiseService.authenticate(apiKey);
          if (isValid) {
            setApiKey(type, apiKey);
            connect(type, { apiKey, syncEnabled: true });
          } else {
            Alert.alert('Error', 'Invalid API token');
          }
          break;

        case 'instapaper':
        case 'obsidian':
        case 'raindrop':
        case 'omnivore':
          // For services that need API key
          if (apiKey) {
            setApiKey(type, apiKey);
            connect(type, { apiKey, syncEnabled: true });
          } else {
            Alert.alert('Error', 'Please enter your API key');
          }
          break;
      }
    } catch (error) {
      Alert.alert('Connection Failed', `Could not connect to ${integration.name}. Please try again.`);
    }

    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect',
      `Are you sure you want to disconnect from ${integration.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            disconnect(type);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSaveSettings = () => {
    updateSettings(type, {
      syncEnabled,
      autoSync,
      importHighlights,
      exportHighlights,
    });
    Alert.alert('Saved', 'Settings have been updated');
  };

  const needsApiKey = ['readwise', 'instapaper', 'raindrop', 'omnivore'].includes(type);
  const needsOAuth = ['notion', 'pocket'].includes(type);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Integration Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconContainer, { backgroundColor: IntegrationColors[type] + '20' }]}>
          <Text style={styles.icon}>{IntegrationIcons[type]}</Text>
        </View>
        <Text style={[styles.integrationName, { color: colors.text }]}>{integration.name}</Text>
        <Text style={[styles.integrationDescription, { color: colors.textSecondary }]}>
          {integration.description}
        </Text>
        {integration.isConnected && (
          <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.statusText, { color: colors.success }]}>✓ Connected</Text>
          </View>
        )}
      </View>

      {/* Connection Section */}
      {!integration.isConnected && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Connect</Text>

          {needsApiKey && (
            <>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                API Key / Token
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder={`Enter your ${integration.name} API key`}
                placeholderTextColor={colors.textTertiary}
                value={apiKey}
                onChangeText={setApiKeyInput}
                secureTextEntry
                autoCapitalize="none"
              />
              <Text style={[styles.helpText, { color: colors.textTertiary }]}>
                You can find your API key in your {integration.name} account settings.
              </Text>
            </>
          )}

          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: IntegrationColors[type] }]}
            onPress={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.connectButtonText}>
                {needsOAuth ? `Sign in with ${integration.name}` : 'Connect'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Settings Section (only shown when connected) */}
      {integration.isConnected && (
        <>
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sync Settings</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Enable Sync</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Sync articles and highlights with {integration.name}
                </Text>
              </View>
              <Switch
                value={syncEnabled}
                onValueChange={setSyncEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Auto Sync</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Automatically sync in the background
                </Text>
              </View>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {integration.capabilities.supportsHighlights && (
              <>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Import Highlights</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      Import highlights from {integration.name}
                    </Text>
                  </View>
                  <Switch
                    value={importHighlights}
                    onValueChange={setImportHighlights}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Export Highlights</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      Send your highlights to {integration.name}
                    </Text>
                  </View>
                  <Switch
                    value={exportHighlights}
                    onValueChange={setExportHighlights}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveSettings}
            >
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Actions Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>

            {integration.capabilities.canImport && (
              <TouchableOpacity style={[styles.actionButton, { borderColor: colors.border }]}>
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Import from {integration.name}
                </Text>
              </TouchableOpacity>
            )}

            {integration.capabilities.canExport && (
              <TouchableOpacity style={[styles.actionButton, { borderColor: colors.border }]}>
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Export to {integration.name}
                </Text>
              </TouchableOpacity>
            )}

            {integration.capabilities.canSync && (
              <TouchableOpacity style={[styles.actionButton, { borderColor: colors.border }]}>
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Sync Now
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Disconnect Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.disconnectButton, { borderColor: colors.error }]}
              onPress={handleDisconnect}
            >
              <Text style={[styles.disconnectButtonText, { color: colors.error }]}>
                Disconnect from {integration.name}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Capabilities Info */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Capabilities</Text>
        <View style={styles.capabilitiesList}>
          <View style={styles.capability}>
            <Text style={styles.capabilityIcon}>
              {integration.capabilities.canImport ? '✓' : '✗'}
            </Text>
            <Text style={[styles.capabilityText, { color: colors.text }]}>Import articles</Text>
          </View>
          <View style={styles.capability}>
            <Text style={styles.capabilityIcon}>
              {integration.capabilities.canExport ? '✓' : '✗'}
            </Text>
            <Text style={[styles.capabilityText, { color: colors.text }]}>Export articles</Text>
          </View>
          <View style={styles.capability}>
            <Text style={styles.capabilityIcon}>
              {integration.capabilities.canSync ? '✓' : '✗'}
            </Text>
            <Text style={[styles.capabilityText, { color: colors.text }]}>Two-way sync</Text>
          </View>
          <View style={styles.capability}>
            <Text style={styles.capabilityIcon}>
              {integration.capabilities.supportsHighlights ? '✓' : '✗'}
            </Text>
            <Text style={[styles.capabilityText, { color: colors.text }]}>Highlights</Text>
          </View>
          <View style={styles.capability}>
            <Text style={styles.capabilityIcon}>
              {integration.capabilities.supportsTags ? '✓' : '✗'}
            </Text>
            <Text style={[styles.capabilityText, { color: colors.text }]}>Tags</Text>
          </View>
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
  header: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  integrationName: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.sm,
  },
  integrationDescription: {
    fontSize: Typography.fontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  statusBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
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
  inputLabel: {
    fontSize: Typography.fontSizes.sm,
    marginBottom: Spacing.sm,
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: Typography.fontSizes.md,
    marginBottom: Spacing.sm,
  },
  helpText: {
    fontSize: Typography.fontSizes.sm,
    marginBottom: Spacing.lg,
  },
  connectButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: Typography.fontSizes.sm,
  },
  saveButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  actionButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionButtonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
  disconnectButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  disconnectButtonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
  capabilitiesList: {
    gap: Spacing.sm,
  },
  capability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capabilityIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  capabilityText: {
    fontSize: Typography.fontSizes.md,
  },
  bottomPadding: {
    height: Spacing['3xl'],
  },
});

export default IntegrationSetupScreen;
