// Folder Store - Zustand state management for folders

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Folder } from '../types';
import { generateId } from '../utils/helpers';

interface FolderState {
  folders: Folder[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'articleCount' | 'sortOrder'>) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  reorderFolders: (orderedIds: string[]) => void;
  incrementArticleCount: (id: string) => void;
  decrementArticleCount: (id: string) => void;
  setArticleCount: (id: string, count: number) => void;

  // Computed
  getFolderById: (id: string) => Folder | undefined;
  getRootFolders: () => Folder[];
  getSubFolders: (parentId: string) => Folder[];
  getFolderPath: (id: string) => Folder[];
}

export const useFolderStore = create<FolderState>()(
  persist(
    (set, get) => ({
      folders: [],
      isLoading: false,
      error: null,

      addFolder: (folderData) => {
        const now = new Date().toISOString();
        const newFolder: Folder = {
          ...folderData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          articleCount: 0,
          sortOrder: get().folders.length,
        };

        set((state) => ({
          folders: [...state.folders, newFolder],
        }));

        return newFolder;
      },

      updateFolder: (id, updates) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id
              ? { ...folder, ...updates, updatedAt: new Date().toISOString() }
              : folder
          ),
        }));
      },

      deleteFolder: (id) => {
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
        }));
      },

      reorderFolders: (orderedIds) => {
        set((state) => ({
          folders: state.folders.map((folder) => ({
            ...folder,
            sortOrder: orderedIds.indexOf(folder.id),
          })),
        }));
      },

      incrementArticleCount: (id) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id
              ? { ...folder, articleCount: folder.articleCount + 1 }
              : folder
          ),
        }));
      },

      decrementArticleCount: (id) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id
              ? { ...folder, articleCount: Math.max(0, folder.articleCount - 1) }
              : folder
          ),
        }));
      },

      setArticleCount: (id, count) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, articleCount: count } : folder
          ),
        }));
      },

      getFolderById: (id) => {
        return get().folders.find((f) => f.id === id);
      },

      getRootFolders: () => {
        return get()
          .folders.filter((f) => !f.parentId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getSubFolders: (parentId) => {
        return get()
          .folders.filter((f) => f.parentId === parentId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getFolderPath: (id) => {
        const folders = get().folders;
        const path: Folder[] = [];
        let currentId: string | undefined = id;

        while (currentId) {
          const folder = folders.find((f) => f.id === currentId);
          if (folder) {
            path.unshift(folder);
            currentId = folder.parentId;
          } else {
            break;
          }
        }

        return path;
      },
    }),
    {
      name: 'lumina-folders',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
