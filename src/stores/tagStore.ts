// Tag Store - Zustand state management for tags

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tag } from '../types';
import { generateId } from '../utils/helpers';

// Predefined tag colors
export const TAG_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
];

interface TagState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addTag: (name: string, color?: string) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  renameTag: (id: string, newName: string) => void;
  changeTagColor: (id: string, color: string) => void;
  incrementArticleCount: (id: string) => void;
  decrementArticleCount: (id: string) => void;
  setArticleCount: (id: string, count: number) => void;

  // Computed
  getTagById: (id: string) => Tag | undefined;
  getTagByName: (name: string) => Tag | undefined;
  getTagsByIds: (ids: string[]) => Tag[];
  searchTags: (query: string) => Tag[];
  getPopularTags: (limit?: number) => Tag[];
  getRandomColor: () => string;
}

export const useTagStore = create<TagState>()(
  persist(
    (set, get) => ({
      tags: [],
      isLoading: false,
      error: null,

      addTag: (name, color) => {
        const existingTag = get().tags.find(
          (t) => t.name.toLowerCase() === name.toLowerCase()
        );
        if (existingTag) {
          return existingTag;
        }

        const newTag: Tag = {
          id: generateId(),
          name: name.trim(),
          color: color || get().getRandomColor(),
          createdAt: new Date().toISOString(),
          articleCount: 0,
        };

        set((state) => ({
          tags: [...state.tags, newTag],
        }));

        return newTag;
      },

      updateTag: (id, updates) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, ...updates } : tag
          ),
        }));
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== id),
        }));
      },

      renameTag: (id, newName) => {
        get().updateTag(id, { name: newName.trim() });
      },

      changeTagColor: (id, color) => {
        get().updateTag(id, { color });
      },

      incrementArticleCount: (id) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, articleCount: tag.articleCount + 1 } : tag
          ),
        }));
      },

      decrementArticleCount: (id) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id
              ? { ...tag, articleCount: Math.max(0, tag.articleCount - 1) }
              : tag
          ),
        }));
      },

      setArticleCount: (id, count) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, articleCount: count } : tag
          ),
        }));
      },

      getTagById: (id) => {
        return get().tags.find((t) => t.id === id);
      },

      getTagByName: (name) => {
        return get().tags.find(
          (t) => t.name.toLowerCase() === name.toLowerCase()
        );
      },

      getTagsByIds: (ids) => {
        return get().tags.filter((t) => ids.includes(t.id));
      },

      searchTags: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().tags.filter((t) =>
          t.name.toLowerCase().includes(lowerQuery)
        );
      },

      getPopularTags: (limit = 10) => {
        return [...get().tags]
          .sort((a, b) => b.articleCount - a.articleCount)
          .slice(0, limit);
      },

      getRandomColor: () => {
        const usedColors = get().tags.map((t) => t.color);
        const availableColors = TAG_COLORS.filter(
          (c) => !usedColors.includes(c)
        );
        if (availableColors.length > 0) {
          return availableColors[Math.floor(Math.random() * availableColors.length)];
        }
        return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
      },
    }),
    {
      name: 'lumina-tags',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
