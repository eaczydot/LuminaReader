// Integration Store - Zustand state management for third-party integrations

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  IntegrationType,
  IntegrationConfig,
  IntegrationSettings,
  SyncState,
} from '../types';

// Default integration configurations
const createDefaultIntegration = (type: IntegrationType): IntegrationConfig => {
  const defaults: Record<IntegrationType, Omit<IntegrationConfig, 'type'>> = {
    notion: {
      name: 'Notion',
      description: 'Sync articles and highlights with Notion databases',
      icon: '📝',
      isConnected: false,
      settings: {
        syncEnabled: false,
        syncInterval: 60,
        importHighlights: true,
        exportHighlights: true,
        autoSync: false,
      },
      capabilities: {
        canImport: true,
        canExport: true,
        canSync: true,
        supportsHighlights: true,
        supportsTags: true,
        supportsFolders: false,
      },
    },
    obsidian: {
      name: 'Obsidian',
      description: 'Export articles and highlights to your Obsidian vault',
      icon: '🔮',
      isConnected: false,
      settings: {
        syncEnabled: false,
        syncInterval: 30,
        importHighlights: false,
        exportHighlights: true,
        autoSync: false,
      },
      capabilities: {
        canImport: false,
        canExport: true,
        canSync: false,
        supportsHighlights: true,
        supportsTags: true,
        supportsFolders: true,
      },
    },
    instapaper: {
      name: 'Instapaper',
      description: 'Import articles from your Instapaper account',
      icon: '📰',
      isConnected: false,
      settings: {
        syncEnabled: false,
        syncInterval: 60,
        importHighlights: true,
        exportHighlights: false,
        autoSync: false,
      },
      capabilities: {
        canImport: true,
        canExport: false,
        canSync: true,
        supportsHighlights: true,
        supportsTags: false,
        supportsFolders: true,
      },
    },
    pocket: {
      name: 'Pocket',
      description: 'Import your saved articles from Pocket',
      icon: '👜',
      isConnected: false,
      settings: {
        syncEnabled: false,
        syncInterval: 60,
        importHighlights: false,
        exportHighlights: false,
        autoSync: false,
      },
      capabilities: {
        canImport: true,
        canExport: false,
        canSync: true,
        supportsHighlights: false,
        supportsTags: true,
        supportsFolders: false,
      },
    },
    readwise: {
      name: 'Readwise',
      description: 'Sync highlights with Readwise for spaced repetition',
      icon: '📚',
      isConnected: false,
      settings: {
        syncEnabled: false,
        syncInterval: 60,
        importHighlights: true,
        exportHighlights: true,
        autoSync: false,
      },
      capabilities: {
        canImport: true,
        canExport: true,
        canSync: true,
        supportsHighlights: true,
        supportsTags: true,
        supportsFolders: false,
      },
    },
    raindrop: {
      name: 'Raindrop.io',
      description: 'Import bookmarks from Raindrop.io',
      icon: '💧',
      isConnected: false,
      settings: {
        syncEnabled: false,
        syncInterval: 60,
        importHighlights: false,
        exportHighlights: false,
        autoSync: false,
      },
      capabilities: {
        canImport: true,
        canExport: true,
        canSync: true,
        supportsHighlights: false,
        supportsTags: true,
        supportsFolders: true,
      },
    },
    omnivore: {
      name: 'Omnivore',
      description: 'Import articles from Omnivore read-it-later service',
      icon: '🦁',
      isConnected: false,
      settings: {
        syncEnabled: false,
        syncInterval: 60,
        importHighlights: true,
        exportHighlights: false,
        autoSync: false,
      },
      capabilities: {
        canImport: true,
        canExport: false,
        canSync: true,
        supportsHighlights: true,
        supportsTags: true,
        supportsFolders: false,
      },
    },
  };

  return {
    type,
    ...defaults[type],
  };
};

interface IntegrationState {
  integrations: Record<IntegrationType, IntegrationConfig>;
  syncStates: Record<IntegrationType, SyncState>;
  isLoading: boolean;
  error: string | null;

  // Connection actions
  connect: (type: IntegrationType, settings: Partial<IntegrationSettings>) => void;
  disconnect: (type: IntegrationType) => void;
  updateSettings: (type: IntegrationType, settings: Partial<IntegrationSettings>) => void;

  // Sync actions
  startSync: (type: IntegrationType) => void;
  completeSync: (type: IntegrationType, error?: string) => void;
  setLastSyncAt: (type: IntegrationType, date: string) => void;

  // Token management
  setAccessToken: (type: IntegrationType, token: string) => void;
  setRefreshToken: (type: IntegrationType, token: string) => void;
  setApiKey: (type: IntegrationType, apiKey: string) => void;
  clearTokens: (type: IntegrationType) => void;

  // Notion specific
  setNotionWorkspace: (workspaceId: string) => void;
  setNotionDatabase: (databaseId: string) => void;

  // Obsidian specific
  setObsidianVaultPath: (path: string) => void;

  // Computed
  getConnectedIntegrations: () => IntegrationConfig[];
  getIntegration: (type: IntegrationType) => IntegrationConfig;
  getSyncState: (type: IntegrationType) => SyncState;
  isIntegrationConnected: (type: IntegrationType) => boolean;
  canImportFrom: (type: IntegrationType) => boolean;
  canExportTo: (type: IntegrationType) => boolean;
}

const initialIntegrations: Record<IntegrationType, IntegrationConfig> = {
  notion: createDefaultIntegration('notion'),
  obsidian: createDefaultIntegration('obsidian'),
  instapaper: createDefaultIntegration('instapaper'),
  pocket: createDefaultIntegration('pocket'),
  readwise: createDefaultIntegration('readwise'),
  raindrop: createDefaultIntegration('raindrop'),
  omnivore: createDefaultIntegration('omnivore'),
};

const initialSyncStates: Record<IntegrationType, SyncState> = {
  notion: { isSyncing: false },
  obsidian: { isSyncing: false },
  instapaper: { isSyncing: false },
  pocket: { isSyncing: false },
  readwise: { isSyncing: false },
  raindrop: { isSyncing: false },
  omnivore: { isSyncing: false },
};

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set, get) => ({
      integrations: initialIntegrations,
      syncStates: initialSyncStates,
      isLoading: false,
      error: null,

      connect: (type, settings) => {
        set((state) => ({
          integrations: {
            ...state.integrations,
            [type]: {
              ...state.integrations[type],
              isConnected: true,
              settings: {
                ...state.integrations[type].settings,
                ...settings,
                syncEnabled: true,
              },
            },
          },
        }));
      },

      disconnect: (type) => {
        set((state) => ({
          integrations: {
            ...state.integrations,
            [type]: {
              ...createDefaultIntegration(type),
            },
          },
          syncStates: {
            ...state.syncStates,
            [type]: { isSyncing: false },
          },
        }));
      },

      updateSettings: (type, settings) => {
        set((state) => ({
          integrations: {
            ...state.integrations,
            [type]: {
              ...state.integrations[type],
              settings: {
                ...state.integrations[type].settings,
                ...settings,
              },
            },
          },
        }));
      },

      startSync: (type) => {
        set((state) => ({
          syncStates: {
            ...state.syncStates,
            [type]: {
              ...state.syncStates[type],
              isSyncing: true,
              error: undefined,
            },
          },
        }));
      },

      completeSync: (type, error) => {
        const now = new Date().toISOString();
        set((state) => ({
          integrations: {
            ...state.integrations,
            [type]: {
              ...state.integrations[type],
              lastSyncAt: error ? state.integrations[type].lastSyncAt : now,
            },
          },
          syncStates: {
            ...state.syncStates,
            [type]: {
              isSyncing: false,
              lastSyncAt: error ? state.syncStates[type].lastSyncAt : now,
              error,
            },
          },
        }));
      },

      setLastSyncAt: (type, date) => {
        set((state) => ({
          integrations: {
            ...state.integrations,
            [type]: {
              ...state.integrations[type],
              lastSyncAt: date,
            },
          },
          syncStates: {
            ...state.syncStates,
            [type]: {
              ...state.syncStates[type],
              lastSyncAt: date,
            },
          },
        }));
      },

      setAccessToken: (type, token) => {
        get().updateSettings(type, { accessToken: token });
      },

      setRefreshToken: (type, token) => {
        get().updateSettings(type, { refreshToken: token });
      },

      setApiKey: (type, apiKey) => {
        get().updateSettings(type, { apiKey });
      },

      clearTokens: (type) => {
        get().updateSettings(type, {
          accessToken: undefined,
          refreshToken: undefined,
          apiKey: undefined,
        });
      },

      setNotionWorkspace: (workspaceId) => {
        get().updateSettings('notion', { workspaceId });
      },

      setNotionDatabase: (databaseId) => {
        get().updateSettings('notion', { databaseId });
      },

      setObsidianVaultPath: (path) => {
        get().updateSettings('obsidian', { vaultPath: path });
      },

      getConnectedIntegrations: () => {
        return Object.values(get().integrations).filter((i) => i.isConnected);
      },

      getIntegration: (type) => {
        return get().integrations[type];
      },

      getSyncState: (type) => {
        return get().syncStates[type];
      },

      isIntegrationConnected: (type) => {
        return get().integrations[type].isConnected;
      },

      canImportFrom: (type) => {
        const integration = get().integrations[type];
        return integration.isConnected && integration.capabilities.canImport;
      },

      canExportTo: (type) => {
        const integration = get().integrations[type];
        return integration.isConnected && integration.capabilities.canExport;
      },
    }),
    {
      name: 'lumina-integrations',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        integrations: state.integrations,
      }),
    }
  )
);
