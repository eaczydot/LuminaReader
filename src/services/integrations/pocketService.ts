// Pocket Integration Service
// Handles import/sync with Pocket

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { Article } from '../../types';
import { generateId, countWords, calculateReadingTime, extractDomain } from '../../utils/helpers';

const POCKET_API_BASE = 'https://getpocket.com/v3';
const POCKET_AUTH_URL = 'https://getpocket.com/auth/authorize';
const POCKET_CONSUMER_KEY = process.env.POCKET_CONSUMER_KEY || 'YOUR_POCKET_CONSUMER_KEY';
const POCKET_REDIRECT_URI = Linking.createURL('pocket-callback');

interface PocketItem {
  item_id: string;
  resolved_id: string;
  given_url: string;
  resolved_url: string;
  given_title: string;
  resolved_title: string;
  excerpt: string;
  word_count: string;
  time_added: string;
  time_read: string;
  time_updated: string;
  time_favorited: string;
  favorite: string;
  status: string; // 0: normal, 1: archived, 2: deleted
  is_article: string;
  has_image: string;
  has_video: string;
  image?: {
    src: string;
    width: string;
    height: string;
  };
  images?: Record<string, { src: string }>;
  authors?: Record<string, { name: string }>;
  tags?: Record<string, { item_id: string; tag: string }>;
}

interface PocketRetrieveResponse {
  status: number;
  complete: number;
  list: Record<string, PocketItem>;
}

class PocketService {
  private accessToken: string | null = null;
  private requestToken: string | null = null;

  async loadCredentials(): Promise<void> {
    this.accessToken = await SecureStore.getItemAsync('pocket_access_token');
  }

  async saveAccessToken(token: string): Promise<void> {
    this.accessToken = token;
    await SecureStore.setItemAsync('pocket_access_token', token);
  }

  async clearCredentials(): Promise<void> {
    this.accessToken = null;
    this.requestToken = null;
    await SecureStore.deleteItemAsync('pocket_access_token');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Step 1: Obtain a request token
  async obtainRequestToken(): Promise<string> {
    const response = await fetch(`${POCKET_API_BASE}/oauth/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: POCKET_CONSUMER_KEY,
        redirect_uri: POCKET_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to obtain request token');
    }

    const data = await response.json();
    this.requestToken = data.code;
    return data.code;
  }

  // Step 2: Redirect user to Pocket to authorize
  async authorize(): Promise<void> {
    if (!this.requestToken) {
      await this.obtainRequestToken();
    }

    const authUrl = `${POCKET_AUTH_URL}?request_token=${this.requestToken}&redirect_uri=${encodeURIComponent(POCKET_REDIRECT_URI)}`;

    await WebBrowser.openAuthSessionAsync(authUrl, POCKET_REDIRECT_URI);
  }

  // Step 3: Exchange request token for access token
  async exchangeToken(): Promise<{ accessToken: string; username: string }> {
    if (!this.requestToken) {
      throw new Error('No request token available');
    }

    const response = await fetch(`${POCKET_API_BASE}/oauth/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: POCKET_CONSUMER_KEY,
        code: this.requestToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange token');
    }

    const data = await response.json();
    await this.saveAccessToken(data.access_token);

    return {
      accessToken: data.access_token,
      username: data.username,
    };
  }

  // Full OAuth flow
  async authenticate(): Promise<boolean> {
    try {
      await this.obtainRequestToken();
      await this.authorize();
      const result = await this.exchangeToken();
      return !!result.accessToken;
    } catch (error) {
      console.error('Pocket authentication error:', error);
      throw error;
    }
  }

  // Retrieve items from Pocket
  async retrieveItems(options?: {
    state?: 'unread' | 'archive' | 'all';
    favorite?: boolean;
    tag?: string;
    contentType?: 'article' | 'video' | 'image';
    sort?: 'newest' | 'oldest' | 'title' | 'site';
    detailType?: 'simple' | 'complete';
    count?: number;
    offset?: number;
    since?: number;
  }): Promise<PocketItem[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Pocket');
    }

    const body: Record<string, any> = {
      consumer_key: POCKET_CONSUMER_KEY,
      access_token: this.accessToken,
      detailType: options?.detailType || 'complete',
    };

    if (options?.state) body.state = options.state;
    if (options?.favorite !== undefined) body.favorite = options.favorite ? 1 : 0;
    if (options?.tag) body.tag = options.tag;
    if (options?.contentType) body.contentType = options.contentType;
    if (options?.sort) body.sort = options.sort;
    if (options?.count) body.count = options.count;
    if (options?.offset) body.offset = options.offset;
    if (options?.since) body.since = options.since;

    const response = await fetch(`${POCKET_API_BASE}/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve items');
    }

    const data: PocketRetrieveResponse = await response.json();
    return Object.values(data.list || {});
  }

  // Import items as articles
  async importItems(options?: {
    state?: 'unread' | 'archive' | 'all';
    includeArchived?: boolean;
    limit?: number;
  }): Promise<Article[]> {
    const items = await this.retrieveItems({
      state: options?.state || 'all',
      detailType: 'complete',
      count: options?.limit,
    });

    return items
      .filter(item => options?.includeArchived || item.status !== '1')
      .map(item => this.itemToArticle(item));
  }

  // Convert Pocket item to Article
  private itemToArticle(item: PocketItem): Article {
    const wordCount = parseInt(item.word_count) || 0;
    const now = new Date().toISOString();

    // Extract author
    let author: string | undefined;
    if (item.authors) {
      const authorList = Object.values(item.authors);
      if (authorList.length > 0) {
        author = authorList.map(a => a.name).join(', ');
      }
    }

    // Extract tags
    const tagNames: string[] = [];
    if (item.tags) {
      tagNames.push(...Object.values(item.tags).map(t => t.tag));
    }

    // Get cover image
    let coverImage: string | undefined;
    if (item.image?.src) {
      coverImage = item.image.src;
    } else if (item.images) {
      const firstImage = Object.values(item.images)[0];
      if (firstImage) {
        coverImage = firstImage.src;
      }
    }

    return {
      id: generateId(),
      url: item.resolved_url || item.given_url,
      title: item.resolved_title || item.given_title || 'Untitled',
      author,
      excerpt: item.excerpt,
      content: item.excerpt || '', // Pocket API doesn't provide full content
      coverImage,
      siteName: extractDomain(item.resolved_url || item.given_url),
      savedAt: new Date(parseInt(item.time_added) * 1000).toISOString(),
      updatedAt: now,
      readingProgress: item.status === '1' ? 100 : 0, // Archived = read
      estimatedReadTime: calculateReadingTime(wordCount),
      wordCount,
      isArchived: item.status === '1',
      isFavorite: item.favorite === '1',
      tagIds: [], // Tags need to be created separately
      highlights: [], // Pocket doesn't have highlights
      status: item.status === '1' ? 'finished' : 'unread',
      source: 'pocket',
      syncStatus: 'synced',
    };
  }

  // Add item to Pocket
  async addItem(url: string, options?: {
    title?: string;
    tags?: string[];
  }): Promise<PocketItem> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Pocket');
    }

    const body: Record<string, any> = {
      consumer_key: POCKET_CONSUMER_KEY,
      access_token: this.accessToken,
      url,
    };

    if (options?.title) body.title = options.title;
    if (options?.tags) body.tags = options.tags.join(',');

    const response = await fetch(`${POCKET_API_BASE}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to add item');
    }

    const data = await response.json();
    return data.item;
  }

  // Modify items (archive, delete, favorite, etc.)
  async modifyItems(actions: Array<{
    action: 'archive' | 'readd' | 'favorite' | 'unfavorite' | 'delete' | 'tags_add' | 'tags_remove' | 'tags_replace';
    item_id: string;
    tags?: string;
    time?: number;
  }>): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Pocket');
    }

    const response = await fetch(`${POCKET_API_BASE}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: POCKET_CONSUMER_KEY,
        access_token: this.accessToken,
        actions,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to modify items');
    }

    const data = await response.json();
    return data.status === 1;
  }

  // Archive an item
  async archiveItem(itemId: string): Promise<boolean> {
    return this.modifyItems([{
      action: 'archive',
      item_id: itemId,
    }]);
  }

  // Favorite an item
  async favoriteItem(itemId: string): Promise<boolean> {
    return this.modifyItems([{
      action: 'favorite',
      item_id: itemId,
    }]);
  }

  // Delete an item
  async deleteItem(itemId: string): Promise<boolean> {
    return this.modifyItems([{
      action: 'delete',
      item_id: itemId,
    }]);
  }

  // Get all tags
  async getTags(): Promise<string[]> {
    const items = await this.retrieveItems({
      state: 'all',
      detailType: 'complete',
    });

    const tags = new Set<string>();
    for (const item of items) {
      if (item.tags) {
        Object.values(item.tags).forEach(t => tags.add(t.tag));
      }
    }

    return Array.from(tags);
  }
}

export const pocketService = new PocketService();
