// Settings Store - Zustand state management for app settings

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, HighlightColor } from '../types';
import { ReaderDefaults } from '../constants/theme';

interface SettingsState extends AppSettings {
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setLineHeight: (height: number) => void;
  setMargins: (margins: number) => void;
  setDefaultHighlightColor: (color: HighlightColor) => void;
  setAutoArchiveOnComplete: (enabled: boolean) => void;
  setShowReadingProgress: (enabled: boolean) => void;
  setEnableSync: (enabled: boolean) => void;
  setSyncOnWifiOnly: (enabled: boolean) => void;
  setDefaultFolder: (folderId: string | undefined) => void;
  resetReaderSettings: () => void;
  resetAllSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  fontSize: ReaderDefaults.fontSize,
  fontFamily: ReaderDefaults.fontFamily,
  lineHeight: ReaderDefaults.lineHeight,
  margins: ReaderDefaults.margins,
  defaultHighlightColor: 'yellow',
  autoArchiveOnComplete: false,
  showReadingProgress: true,
  enableSync: true,
  syncOnWifiOnly: false,
  defaultFolder: undefined,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme) => set({ theme }),

      setFontSize: (fontSize) => set({ fontSize }),

      setFontFamily: (fontFamily) => set({ fontFamily }),

      setLineHeight: (lineHeight) => set({ lineHeight }),

      setMargins: (margins) => set({ margins }),

      setDefaultHighlightColor: (defaultHighlightColor) => set({ defaultHighlightColor }),

      setAutoArchiveOnComplete: (autoArchiveOnComplete) => set({ autoArchiveOnComplete }),

      setShowReadingProgress: (showReadingProgress) => set({ showReadingProgress }),

      setEnableSync: (enableSync) => set({ enableSync }),

      setSyncOnWifiOnly: (syncOnWifiOnly) => set({ syncOnWifiOnly }),

      setDefaultFolder: (defaultFolder) => set({ defaultFolder }),

      resetReaderSettings: () =>
        set({
          fontSize: ReaderDefaults.fontSize,
          fontFamily: ReaderDefaults.fontFamily,
          lineHeight: ReaderDefaults.lineHeight,
          margins: ReaderDefaults.margins,
        }),

      resetAllSettings: () => set(defaultSettings),
    }),
    {
      name: 'lumina-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
