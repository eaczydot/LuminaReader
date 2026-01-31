// Article Store - Zustand state management for articles and highlights

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Article,
  Highlight,
  ArticleFilters,
  SortConfig,
  HighlightColor,
  ArticleStatus,
} from '../types';
import { generateId, filterArticles, sortArticles } from '../utils/helpers';

interface ArticleState {
  articles: Article[];
  currentArticleId: string | null;
  filters: ArticleFilters;
  sortConfig: SortConfig;
  isLoading: boolean;
  error: string | null;

  // Article actions
  addArticle: (article: Omit<Article, 'id' | 'savedAt' | 'updatedAt' | 'highlights' | 'syncStatus'>) => Article;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  archiveArticle: (id: string) => void;
  unarchiveArticle: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updateReadingProgress: (id: string, progress: number) => void;
  setArticleStatus: (id: string, status: ArticleStatus) => void;
  moveToFolder: (articleId: string, folderId: string | undefined) => void;
  addTagToArticle: (articleId: string, tagId: string) => void;
  removeTagFromArticle: (articleId: string, tagId: string) => void;

  // Highlight actions
  addHighlight: (articleId: string, highlight: Omit<Highlight, 'id' | 'articleId' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Highlight;
  updateHighlight: (articleId: string, highlightId: string, updates: Partial<Highlight>) => void;
  deleteHighlight: (articleId: string, highlightId: string) => void;
  updateHighlightNote: (articleId: string, highlightId: string, note: string) => void;
  updateHighlightColor: (articleId: string, highlightId: string, color: HighlightColor) => void;

  // Filter/Sort actions
  setFilters: (filters: Partial<ArticleFilters>) => void;
  clearFilters: () => void;
  setSortConfig: (config: SortConfig) => void;

  // Selection
  setCurrentArticle: (id: string | null) => void;
  getCurrentArticle: () => Article | undefined;

  // Computed
  getFilteredArticles: () => Article[];
  getArticlesByFolder: (folderId: string) => Article[];
  getArticlesByTag: (tagId: string) => Article[];
  getFavoriteArticles: () => Article[];
  getArchivedArticles: () => Article[];
  getUnreadArticles: () => Article[];
  getAllHighlights: () => { highlight: Highlight; article: Article }[];

  // Bulk operations
  bulkDelete: (ids: string[]) => void;
  bulkArchive: (ids: string[]) => void;
  bulkMoveToFolder: (ids: string[], folderId: string | undefined) => void;
  bulkAddTag: (ids: string[], tagId: string) => void;

  // Import
  importArticles: (articles: Article[]) => void;
}

export const useArticleStore = create<ArticleState>()(
  persist(
    (set, get) => ({
      articles: [],
      currentArticleId: null,
      filters: {},
      sortConfig: { by: 'savedAt', direction: 'desc' },
      isLoading: false,
      error: null,

      // Article actions
      addArticle: (articleData) => {
        const now = new Date().toISOString();
        const newArticle: Article = {
          ...articleData,
          id: generateId(),
          savedAt: now,
          updatedAt: now,
          highlights: [],
          syncStatus: 'local',
        };

        set((state) => ({
          articles: [newArticle, ...state.articles],
        }));

        return newArticle;
      },

      updateArticle: (id, updates) => {
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id
              ? { ...article, ...updates, updatedAt: new Date().toISOString(), syncStatus: 'pending' as const }
              : article
          ),
        }));
      },

      deleteArticle: (id) => {
        set((state) => ({
          articles: state.articles.filter((article) => article.id !== id),
          currentArticleId: state.currentArticleId === id ? null : state.currentArticleId,
        }));
      },

      archiveArticle: (id) => {
        get().updateArticle(id, { isArchived: true });
      },

      unarchiveArticle: (id) => {
        get().updateArticle(id, { isArchived: false });
      },

      toggleFavorite: (id) => {
        const article = get().articles.find((a) => a.id === id);
        if (article) {
          get().updateArticle(id, { isFavorite: !article.isFavorite });
        }
      },

      updateReadingProgress: (id, progress) => {
        const updates: Partial<Article> = { readingProgress: progress };
        if (progress >= 100) {
          updates.status = 'finished';
        } else if (progress > 0) {
          updates.status = 'reading';
        }
        get().updateArticle(id, updates);
      },

      setArticleStatus: (id, status) => {
        get().updateArticle(id, { status });
      },

      moveToFolder: (articleId, folderId) => {
        get().updateArticle(articleId, { folderId });
      },

      addTagToArticle: (articleId, tagId) => {
        const article = get().articles.find((a) => a.id === articleId);
        if (article && !article.tagIds.includes(tagId)) {
          get().updateArticle(articleId, { tagIds: [...article.tagIds, tagId] });
        }
      },

      removeTagFromArticle: (articleId, tagId) => {
        const article = get().articles.find((a) => a.id === articleId);
        if (article) {
          get().updateArticle(articleId, {
            tagIds: article.tagIds.filter((id) => id !== tagId),
          });
        }
      },

      // Highlight actions
      addHighlight: (articleId, highlightData) => {
        const now = new Date().toISOString();
        const newHighlight: Highlight = {
          ...highlightData,
          id: generateId(),
          articleId,
          createdAt: now,
          updatedAt: now,
          syncStatus: 'local',
        };

        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === articleId
              ? {
                  ...article,
                  highlights: [...article.highlights, newHighlight],
                  updatedAt: now,
                  syncStatus: 'pending' as const,
                }
              : article
          ),
        }));

        return newHighlight;
      },

      updateHighlight: (articleId, highlightId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === articleId
              ? {
                  ...article,
                  highlights: article.highlights.map((h) =>
                    h.id === highlightId
                      ? { ...h, ...updates, updatedAt: now, syncStatus: 'pending' as const }
                      : h
                  ),
                  updatedAt: now,
                  syncStatus: 'pending' as const,
                }
              : article
          ),
        }));
      },

      deleteHighlight: (articleId, highlightId) => {
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === articleId
              ? {
                  ...article,
                  highlights: article.highlights.filter((h) => h.id !== highlightId),
                  updatedAt: new Date().toISOString(),
                  syncStatus: 'pending' as const,
                }
              : article
          ),
        }));
      },

      updateHighlightNote: (articleId, highlightId, note) => {
        get().updateHighlight(articleId, highlightId, { note });
      },

      updateHighlightColor: (articleId, highlightId, color) => {
        get().updateHighlight(articleId, highlightId, { color });
      },

      // Filter/Sort actions
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      setSortConfig: (config) => {
        set({ sortConfig: config });
      },

      // Selection
      setCurrentArticle: (id) => {
        set({ currentArticleId: id });
      },

      getCurrentArticle: () => {
        const { articles, currentArticleId } = get();
        return articles.find((a) => a.id === currentArticleId);
      },

      // Computed
      getFilteredArticles: () => {
        const { articles, filters, sortConfig } = get();
        const filtered = filterArticles(articles.filter((a) => !a.isArchived), filters);
        return sortArticles(filtered, sortConfig.by, sortConfig.direction);
      },

      getArticlesByFolder: (folderId) => {
        return get().articles.filter((a) => a.folderId === folderId && !a.isArchived);
      },

      getArticlesByTag: (tagId) => {
        return get().articles.filter((a) => a.tagIds.includes(tagId) && !a.isArchived);
      },

      getFavoriteArticles: () => {
        return get().articles.filter((a) => a.isFavorite && !a.isArchived);
      },

      getArchivedArticles: () => {
        return get().articles.filter((a) => a.isArchived);
      },

      getUnreadArticles: () => {
        return get().articles.filter((a) => a.status === 'unread' && !a.isArchived);
      },

      getAllHighlights: () => {
        return get().articles.flatMap((article) =>
          article.highlights.map((highlight) => ({ highlight, article }))
        );
      },

      // Bulk operations
      bulkDelete: (ids) => {
        set((state) => ({
          articles: state.articles.filter((a) => !ids.includes(a.id)),
        }));
      },

      bulkArchive: (ids) => {
        set((state) => ({
          articles: state.articles.map((a) =>
            ids.includes(a.id) ? { ...a, isArchived: true, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },

      bulkMoveToFolder: (ids, folderId) => {
        set((state) => ({
          articles: state.articles.map((a) =>
            ids.includes(a.id) ? { ...a, folderId, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },

      bulkAddTag: (ids, tagId) => {
        set((state) => ({
          articles: state.articles.map((a) =>
            ids.includes(a.id) && !a.tagIds.includes(tagId)
              ? { ...a, tagIds: [...a.tagIds, tagId], updatedAt: new Date().toISOString() }
              : a
          ),
        }));
      },

      // Import
      importArticles: (articles) => {
        set((state) => ({
          articles: [...articles, ...state.articles],
        }));
      },
    }),
    {
      name: 'lumina-articles',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
