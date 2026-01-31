// Core Types for LuminaReader

// Article/Item Types
export interface Article {
  id: string;
  url: string;
  title: string;
  author?: string;
  excerpt?: string;
  content: string;
  htmlContent?: string;
  coverImage?: string;
  siteName?: string;
  publishedDate?: string;
  savedAt: string;
  updatedAt: string;
  readingProgress: number; // 0-100
  estimatedReadTime: number; // in minutes
  wordCount: number;
  isArchived: boolean;
  isFavorite: boolean;
  folderId?: string;
  tagIds: string[];
  highlights: Highlight[];
  status: ArticleStatus;
  source: ArticleSource;
  syncStatus: SyncStatus;
}

export type ArticleStatus = 'unread' | 'reading' | 'finished';
export type ArticleSource = 'manual' | 'share' | 'notion' | 'obsidian' | 'instapaper' | 'pocket' | 'readwise' | 'rss';

// Highlight Types
export interface Highlight {
  id: string;
  articleId: string;
  text: string;
  note?: string;
  color: HighlightColor;
  startOffset: number;
  endOffset: number;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';

export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#FEF08A',
  green: '#BBF7D0',
  blue: '#BFDBFE',
  pink: '#FBCFE8',
  purple: '#DDD6FE',
  orange: '#FED7AA',
};

// Tag Types
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  articleCount: number;
}

// Folder Types
export interface Folder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  articleCount: number;
  sortOrder: number;
}

// Sync Types
export type SyncStatus = 'synced' | 'pending' | 'error' | 'local';

export interface SyncState {
  lastSyncAt?: string;
  isSyncing: boolean;
  error?: string;
}

// Integration Types
export type IntegrationType = 'notion' | 'obsidian' | 'instapaper' | 'pocket' | 'readwise' | 'raindrop' | 'omnivore';

export interface IntegrationConfig {
  type: IntegrationType;
  name: string;
  description: string;
  icon: string;
  isConnected: boolean;
  lastSyncAt?: string;
  settings: IntegrationSettings;
  capabilities: IntegrationCapabilities;
}

export interface IntegrationSettings {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  workspaceId?: string;
  databaseId?: string;
  vaultPath?: string;
  syncEnabled: boolean;
  syncInterval: number; // in minutes
  importHighlights: boolean;
  exportHighlights: boolean;
  autoSync: boolean;
}

export interface IntegrationCapabilities {
  canImport: boolean;
  canExport: boolean;
  canSync: boolean;
  supportsHighlights: boolean;
  supportsTags: boolean;
  supportsFolders: boolean;
}

// Notion Specific Types
export interface NotionDatabase {
  id: string;
  title: string;
  icon?: string;
}

export interface NotionPage {
  id: string;
  title: string;
  url: string;
  content?: string;
  properties: Record<string, any>;
}

// Obsidian Specific Types
export interface ObsidianVault {
  name: string;
  path: string;
}

export interface ObsidianNote {
  title: string;
  content: string;
  path: string;
  tags: string[];
  frontmatter: Record<string, any>;
}

// Export/Import Types
export type ExportFormat = 'json' | 'markdown' | 'html' | 'csv' | 'epub';

export interface ExportOptions {
  format: ExportFormat;
  includeHighlights: boolean;
  includeTags: boolean;
  includeNotes: boolean;
  articleIds?: string[];
  folderId?: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: string[];
  articles: Article[];
}

// Share Types
export interface ShareData {
  url?: string;
  text?: string;
  title?: string;
  mimeType?: string;
}

// Settings Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margins: number;
  defaultHighlightColor: HighlightColor;
  autoArchiveOnComplete: boolean;
  showReadingProgress: boolean;
  enableSync: boolean;
  syncOnWifiOnly: boolean;
  defaultFolder?: string;
}

// Filter/Sort Types
export interface ArticleFilters {
  status?: ArticleStatus;
  folderId?: string;
  tagIds?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  searchQuery?: string;
}

export type SortOption = 'savedAt' | 'title' | 'author' | 'readingProgress' | 'estimatedReadTime';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  by: SortOption;
  direction: SortDirection;
}

// Navigation Types
export type RootStackParamList = {
  Main: undefined;
  Reader: { articleId: string };
  ArticleInfo: { articleId: string };
  FolderDetail: { folderId: string };
  TagDetail: { tagId: string };
  IntegrationSetup: { type: IntegrationType };
  ImportExport: undefined;
  Search: undefined;
};

export type MainTabParamList = {
  Library: undefined;
  Folders: undefined;
  Tags: undefined;
  Integrations: undefined;
  Settings: undefined;
};
