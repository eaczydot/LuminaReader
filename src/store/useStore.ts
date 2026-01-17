import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export interface Feed {
    id: string;
    url: string;
    title: string;
    icon?: string;
}

export interface Article {
    id: string;
    title: string;
    url: string;
    summary?: string;
    content?: string;
    feedId?: string;
    publishedAt: string;
    tags: string[];
    readTime?: number;
    isRead: boolean;
    isSaved: boolean;
    source?: string;
}

// Tab Preferences
export interface TabPreferences {
    order: string[];
    visible: Record<string, boolean>;
    quickActions: string[];
}

// Settings
export interface Settings {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    fontFamily: 'newsreader' | 'system';
}

// Entity System (Multi-parent hierarchy)
export type EntityType = 'person' | 'company' | 'topic';

export interface Entity {
    id: string;
    name: string;
    type: EntityType;
    parentIds: string[]; // Multi-parent support
    favicon?: string; // Company favicon URL
    metadata?: Record<string, any>;
    icon?: string;
}

export interface EntityEdge {
    fromId: string;
    toId: string;
    type: 'role' | 'org' | 'topic' | 'related';
    context?: string;
}

export interface ArticleEntityRef {
    articleId: string;
    entityId: string;
    contextEntityId?: string; // Enables contextual grouping (e.g., Sam Altman → Oklo)
    confidence?: number;
}

// Default tab configuration
const DEFAULT_TAB_ORDER = ['index', 'updates', 'library', 'search', 'settings'];
const DEFAULT_TAB_VISIBILITY: Record<string, boolean> = {
    index: true,
    updates: true,
    library: true,
    search: true,
    settings: false, // Hidden by default, accessed via More
};

// ============================================
// STORE INTERFACE
// ============================================

interface AppState {
    // Existing state
    feeds: Feed[];
    articles: Article[];
    savedArticles: Article[];
    webhookUrl: string;

    // Settings
    settings: Settings;

    // Tab preferences
    tabPreferences: TabPreferences;

    // Entity system
    entities: Record<string, Entity>;
    entityEdges: EntityEdge[];
    articleEntityRefs: ArticleEntityRef[];

    // Settings actions
    updateSettings: (settings: Partial<Settings>) => void;

    // Existing actions
    setWebhookUrl: (url: string) => void;
    addFeed: (feed: Feed) => Promise<void>;
    removeFeed: (id: string) => void;
    saveArticle: (article: Article) => void;
    unsaveArticle: (id: string) => void;
    markAsRead: (id: string) => void;
    refreshAllFeeds: () => Promise<void>;
    triggerSync: (article: Article) => Promise<void>;

    // Tab preference actions
    setTabOrder: (order: string[]) => void;
    toggleTabVisibility: (tabId: string) => void;
    setQuickActions: (actions: string[]) => void;
    hydrateTabPreferences: () => Promise<void>;

    // Entity actions
    addEntity: (entity: Entity) => void;
    updateEntity: (id: string, updates: Partial<Entity>) => void;
    removeEntity: (id: string) => void;
    addEntityEdge: (edge: EntityEdge) => void;
    removeEntityEdge: (fromId: string, toId: string) => void;
    addArticleEntityRef: (ref: ArticleEntityRef) => void;
    removeArticleEntityRef: (articleId: string, entityId: string) => void;

    // Selectors
    getEntity: (id: string) => Entity | undefined;
    getEntityPaths: (entityId: string) => string[][];
    getArticlesForEntity: (entityId: string) => Article[];
    getArticlesGroupedByContext: (entityId: string) => Record<string, Article[]>;
    getEntitiesForArticle: (articleId: string) => Entity[];
}

import { parseRSS } from '../utils/rss';
import { mockAIProcessArticle } from '../utils/ai';

// ============================================
// MOCK DATA (for demonstration)
// ============================================

const MOCK_ENTITIES: Record<string, Entity> = {
    'sam-altman': {
        id: 'sam-altman',
        name: 'Sam Altman',
        type: 'person',
        parentIds: ['ceos', 'tech-leaders'],
        metadata: { role: 'CEO of OpenAI' },
    },
    'oklo': {
        id: 'oklo',
        name: 'Oklo',
        type: 'company',
        parentIds: ['nuclear-energy', 'clean-tech'],
        metadata: { industry: 'Nuclear Energy' },
    },
    'openai': {
        id: 'openai',
        name: 'OpenAI',
        type: 'company',
        parentIds: ['ai-companies'],
        metadata: { industry: 'AI' },
    },
    'ceos': {
        id: 'ceos',
        name: 'CEOs',
        type: 'topic',
        parentIds: ['people'],
    },
    'tech-leaders': {
        id: 'tech-leaders',
        name: 'Tech Leaders',
        type: 'topic',
        parentIds: ['people'],
    },
    'nuclear-energy': {
        id: 'nuclear-energy',
        name: 'Nuclear Energy',
        type: 'topic',
        parentIds: ['energy', 'clean-tech'],
    },
    'ai-companies': {
        id: 'ai-companies',
        name: 'AI Companies',
        type: 'topic',
        parentIds: ['companies'],
    },
    'smr': {
        id: 'smr',
        name: 'Small Modular Reactors',
        type: 'topic',
        parentIds: ['nuclear-energy'],
    },
    'people': {
        id: 'people',
        name: 'People',
        type: 'topic',
        parentIds: [],
    },
    'companies': {
        id: 'companies',
        name: 'Companies',
        type: 'topic',
        parentIds: [],
    },
    'energy': {
        id: 'energy',
        name: 'Energy',
        type: 'topic',
        parentIds: [],
    },
    'clean-tech': {
        id: 'clean-tech',
        name: 'Clean Tech',
        type: 'topic',
        parentIds: [],
    },
};

const MOCK_ENTITY_EDGES: EntityEdge[] = [
    { fromId: 'sam-altman', toId: 'openai', type: 'role', context: 'CEO' },
    { fromId: 'sam-altman', toId: 'oklo', type: 'role', context: 'Chairman' },
];

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            feeds: [],
            articles: [],
            savedArticles: [],
            webhookUrl: '',

            // Settings with defaults
            settings: {
                theme: 'system',
                fontSize: 'medium',
                fontFamily: 'newsreader',
            },

            // Tab preferences with defaults
            tabPreferences: {
                order: DEFAULT_TAB_ORDER,
                visible: DEFAULT_TAB_VISIBILITY,
                quickActions: [],
            },

            // Entity system with mock data
            entities: MOCK_ENTITIES,
            entityEdges: MOCK_ENTITY_EDGES,
            articleEntityRefs: [],

            // ==========================================
            // SETTINGS ACTIONS
            // ==========================================

            updateSettings: (updates) =>
                set((state) => ({
                    settings: { ...state.settings, ...updates },
                })),

            // ==========================================
            // EXISTING ACTIONS
            // ==========================================

            setWebhookUrl: (url) => set({ webhookUrl: url }),

            addFeed: async (feed) => {
                set((state) => ({ feeds: [...state.feeds, feed] }));
                await get().refreshAllFeeds();
            },

            removeFeed: (id) =>
                set((state) => ({ feeds: state.feeds.filter((f) => f.id !== id) })),

            saveArticle: (article) => {
                set((state) => ({
                    savedArticles: [...state.savedArticles, { ...article, isSaved: true }],
                }));
                get().triggerSync(article);
            },

            unsaveArticle: (id) =>
                set((state) => ({
                    savedArticles: state.savedArticles.filter((a) => a.id !== id),
                })),

            markAsRead: (id) =>
                set((state) => ({
                    articles: state.articles.map((a) =>
                        a.id === id ? { ...a, isRead: true } : a
                    ),
                })),

            refreshAllFeeds: async () => {
                const { feeds } = get();
                const allArticles: Article[] = [];

                await Promise.all(
                    feeds.map(async (feed) => {
                        try {
                            const { articles } = await parseRSS(feed.url);
                            allArticles.push(...articles);
                        } catch (e) {
                            console.error(e);
                        }
                    })
                );

                // Sort by date desc
                allArticles.sort(
                    (a, b) =>
                        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
                );

                // Mock AI enrichment for new articles
                const enrichedArticles = await Promise.all(
                    allArticles.slice(0, 10).map(async (a) => {
                        const aiData = await mockAIProcessArticle(a);
                        return { ...a, ...aiData };
                    })
                );

                // Add mock entity refs for demo
                const mockRefs: ArticleEntityRef[] = enrichedArticles.slice(0, 3).flatMap((article) => [
                    { articleId: article.id, entityId: 'sam-altman', contextEntityId: 'oklo', confidence: 0.9 },
                    { articleId: article.id, entityId: 'oklo', confidence: 0.85 },
                ]);

                set({ articles: enrichedArticles, articleEntityRefs: mockRefs });
            },

            triggerSync: async (article) => {
                const { webhookUrl } = get();
                if (!webhookUrl) return;

                try {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'article.saved',
                            timestamp: new Date().toISOString(),
                            data: article,
                        }),
                    });
                } catch (e) {
                    console.error('Webhook sync failed:', e);
                }
            },

            // ==========================================
            // TAB PREFERENCE ACTIONS
            // ==========================================

            setTabOrder: (order) =>
                set((state) => ({
                    tabPreferences: { ...state.tabPreferences, order },
                })),

            toggleTabVisibility: (tabId) =>
                set((state) => ({
                    tabPreferences: {
                        ...state.tabPreferences,
                        visible: {
                            ...state.tabPreferences.visible,
                            [tabId]: !state.tabPreferences.visible[tabId],
                        },
                    },
                })),

            setQuickActions: (actions) =>
                set((state) => ({
                    tabPreferences: { ...state.tabPreferences, quickActions: actions },
                })),

            hydrateTabPreferences: async () => {
                // Preferences are auto-hydrated by Zustand persist
                // This function can be used for additional initialization if needed
                const { tabPreferences } = get();

                // Ensure all expected tabs are in the order array
                const missingTabs = DEFAULT_TAB_ORDER.filter(
                    (tab) => !tabPreferences.order.includes(tab)
                );
                if (missingTabs.length > 0) {
                    set((state) => ({
                        tabPreferences: {
                            ...state.tabPreferences,
                            order: [...state.tabPreferences.order, ...missingTabs],
                        },
                    }));
                }
            },

            // ==========================================
            // ENTITY ACTIONS
            // ==========================================

            addEntity: (entity) =>
                set((state) => ({
                    entities: { ...state.entities, [entity.id]: entity },
                })),

            updateEntity: (id, updates) =>
                set((state) => ({
                    entities: {
                        ...state.entities,
                        [id]: { ...state.entities[id], ...updates },
                    },
                })),

            removeEntity: (id) =>
                set((state) => {
                    const { [id]: removed, ...rest } = state.entities;
                    return { entities: rest };
                }),

            addEntityEdge: (edge) =>
                set((state) => ({
                    entityEdges: [...state.entityEdges, edge],
                })),

            removeEntityEdge: (fromId, toId) =>
                set((state) => ({
                    entityEdges: state.entityEdges.filter(
                        (e) => !(e.fromId === fromId && e.toId === toId)
                    ),
                })),

            addArticleEntityRef: (ref) =>
                set((state) => ({
                    articleEntityRefs: [...state.articleEntityRefs, ref],
                })),

            removeArticleEntityRef: (articleId, entityId) =>
                set((state) => ({
                    articleEntityRefs: state.articleEntityRefs.filter(
                        (r) => !(r.articleId === articleId && r.entityId === entityId)
                    ),
                })),

            // ==========================================
            // SELECTORS
            // ==========================================

            getEntity: (id) => get().entities[id],

            getEntityPaths: (entityId) => {
                const { entities } = get();
                const entity = entities[entityId];
                if (!entity) return [];

                const paths: string[][] = [];

                const buildPaths = (currentId: string, currentPath: string[]) => {
                    const current = entities[currentId];
                    if (!current) return;

                    const newPath = [current.name, ...currentPath];

                    if (current.parentIds.length === 0) {
                        paths.push(newPath);
                    } else {
                        current.parentIds.forEach((parentId) => {
                            buildPaths(parentId, newPath);
                        });
                    }
                };

                buildPaths(entityId, []);
                return paths;
            },

            getArticlesForEntity: (entityId) => {
                const { articles, articleEntityRefs } = get();
                const articleIds = articleEntityRefs
                    .filter((ref) => ref.entityId === entityId)
                    .map((ref) => ref.articleId);

                return articles.filter((a) => articleIds.includes(a.id));
            },

            getArticlesGroupedByContext: (entityId) => {
                const { articles, articleEntityRefs } = get();
                const relevantRefs = articleEntityRefs.filter(
                    (ref) => ref.entityId === entityId
                );

                const grouped: Record<string, Article[]> = {};

                relevantRefs.forEach((ref) => {
                    const article = articles.find((a) => a.id === ref.articleId);
                    if (!article) return;

                    const contextKey = ref.contextEntityId || '_general';
                    if (!grouped[contextKey]) {
                        grouped[contextKey] = [];
                    }
                    grouped[contextKey].push(article);
                });

                return grouped;
            },

            getEntitiesForArticle: (articleId) => {
                const { entities, articleEntityRefs } = get();
                const entityIds = articleEntityRefs
                    .filter((ref) => ref.articleId === articleId)
                    .map((ref) => ref.entityId);

                return entityIds
                    .map((id) => entities[id])
                    .filter((e): e is Entity => !!e);
            },
        }),
        {
            name: 'lumina-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                feeds: state.feeds,
                articles: state.articles,
                savedArticles: state.savedArticles,
                webhookUrl: state.webhookUrl,
                tabPreferences: state.tabPreferences,
                entities: state.entities,
                entityEdges: state.entityEdges,
                articleEntityRefs: state.articleEntityRefs,
            }),
        }
    )
);
