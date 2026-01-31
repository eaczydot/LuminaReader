// Instapaper Integration Service
// Handles import/sync with Instapaper

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { Article } from '../../types';
import { generateId, countWords, calculateReadingTime } from '../../utils/helpers';

const INSTAPAPER_API_BASE = 'https://www.instapaper.com/api';
const INSTAPAPER_OAUTH_BASE = 'https://www.instapaper.com/api/1';
const CONSUMER_KEY = process.env.INSTAPAPER_CONSUMER_KEY || 'YOUR_CONSUMER_KEY';
const CONSUMER_SECRET = process.env.INSTAPAPER_CONSUMER_SECRET || 'YOUR_CONSUMER_SECRET';

interface InstapaperBookmark {
  bookmark_id: number;
  title: string;
  url: string;
  description: string;
  progress: number;
  progress_timestamp: number;
  time: number;
  starred: string;
  type: string;
  hash: string;
}

interface InstapaperHighlight {
  highlight_id: number;
  bookmark_id: number;
  text: string;
  note: string;
  time: number;
  position: number;
}

interface InstapaperFolder {
  folder_id: number;
  title: string;
  slug: string;
  display_title: string;
  sync_to_mobile: number;
  position: number;
}

class InstapaperService {
  private oauthToken: string | null = null;
  private oauthTokenSecret: string | null = null;

  async loadCredentials(): Promise<void> {
    this.oauthToken = await SecureStore.getItemAsync('instapaper_oauth_token');
    this.oauthTokenSecret = await SecureStore.getItemAsync('instapaper_oauth_token_secret');
  }

  async saveCredentials(token: string, tokenSecret: string): Promise<void> {
    this.oauthToken = token;
    this.oauthTokenSecret = tokenSecret;
    await SecureStore.setItemAsync('instapaper_oauth_token', token);
    await SecureStore.setItemAsync('instapaper_oauth_token_secret', tokenSecret);
  }

  async clearCredentials(): Promise<void> {
    this.oauthToken = null;
    this.oauthTokenSecret = null;
    await SecureStore.deleteItemAsync('instapaper_oauth_token');
    await SecureStore.deleteItemAsync('instapaper_oauth_token_secret');
  }

  isAuthenticated(): boolean {
    return !!this.oauthToken && !!this.oauthTokenSecret;
  }

  // xAuth authentication (Instapaper uses xAuth instead of standard OAuth)
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${INSTAPAPER_OAUTH_BASE}/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          x_auth_username: username,
          x_auth_password: password,
          x_auth_mode: 'client_auth',
          oauth_consumer_key: CONSUMER_KEY,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const text = await response.text();
      const params = new URLSearchParams(text);
      const token = params.get('oauth_token');
      const tokenSecret = params.get('oauth_token_secret');

      if (token && tokenSecret) {
        await this.saveCredentials(token, tokenSecret);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Instapaper authentication error:', error);
      throw error;
    }
  }

  // Generate OAuth signature for API calls
  private generateOAuthParams(method: string, url: string, params: Record<string, string> = {}): URLSearchParams {
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: CONSUMER_KEY,
      oauth_token: this.oauthToken || '',
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: generateId(),
      oauth_version: '1.0',
      ...params,
    };

    // In production, you'd generate a proper HMAC-SHA1 signature here
    // For simplicity, we're including placeholders
    oauthParams.oauth_signature = 'signature_placeholder';

    return new URLSearchParams(oauthParams);
  }

  // Fetch bookmarks (articles)
  async fetchBookmarks(options?: {
    folderId?: string;
    limit?: number;
    have?: string[];
  }): Promise<InstapaperBookmark[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Instapaper');
    }

    const params: Record<string, string> = {
      limit: (options?.limit || 500).toString(),
    };

    if (options?.folderId) {
      params.folder_id = options.folderId;
    }

    if (options?.have) {
      params.have = options.have.join(',');
    }

    const urlParams = this.generateOAuthParams('POST', `${INSTAPAPER_OAUTH_BASE}/bookmarks/list`, params);

    const response = await fetch(`${INSTAPAPER_OAUTH_BASE}/bookmarks/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlParams.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookmarks');
    }

    const data = await response.json();
    return data.filter((item: any) => item.type === 'bookmark');
  }

  // Fetch highlights for a bookmark
  async fetchHighlights(bookmarkId: number): Promise<InstapaperHighlight[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Instapaper');
    }

    const urlParams = this.generateOAuthParams('POST', `${INSTAPAPER_OAUTH_BASE}/bookmarks/${bookmarkId}/highlights`);

    const response = await fetch(`${INSTAPAPER_OAUTH_BASE}/bookmarks/${bookmarkId}/highlights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlParams.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch highlights');
    }

    return response.json();
  }

  // Fetch folders
  async fetchFolders(): Promise<InstapaperFolder[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Instapaper');
    }

    const urlParams = this.generateOAuthParams('POST', `${INSTAPAPER_OAUTH_BASE}/folders/list`);

    const response = await fetch(`${INSTAPAPER_OAUTH_BASE}/folders/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlParams.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch folders');
    }

    return response.json();
  }

  // Get article text content
  async fetchBookmarkText(bookmarkId: number): Promise<string> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Instapaper');
    }

    const urlParams = this.generateOAuthParams('POST', `${INSTAPAPER_OAUTH_BASE}/bookmarks/get_text`, {
      bookmark_id: bookmarkId.toString(),
    });

    const response = await fetch(`${INSTAPAPER_OAUTH_BASE}/bookmarks/get_text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlParams.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookmark text');
    }

    return response.text();
  }

  // Import all bookmarks as articles
  async importBookmarks(options?: {
    includeHighlights?: boolean;
    folderId?: string;
  }): Promise<Article[]> {
    const bookmarks = await this.fetchBookmarks({ folderId: options?.folderId });
    const articles: Article[] = [];

    for (const bookmark of bookmarks) {
      try {
        const article = await this.bookmarkToArticle(bookmark, options?.includeHighlights);
        articles.push(article);
      } catch (error) {
        console.error(`Error importing bookmark ${bookmark.bookmark_id}:`, error);
      }
    }

    return articles;
  }

  // Convert Instapaper bookmark to Article
  private async bookmarkToArticle(
    bookmark: InstapaperBookmark,
    includeHighlights = true
  ): Promise<Article> {
    let content = bookmark.description || '';
    let htmlContent: string | undefined;

    try {
      htmlContent = await this.fetchBookmarkText(bookmark.bookmark_id);
      // Extract plain text from HTML
      content = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.log('Could not fetch full text, using description');
    }

    const wordCount = countWords(content);
    const now = new Date().toISOString();

    const article: Article = {
      id: generateId(),
      url: bookmark.url,
      title: bookmark.title || 'Untitled',
      excerpt: bookmark.description,
      content,
      htmlContent,
      savedAt: new Date(bookmark.time * 1000).toISOString(),
      updatedAt: now,
      readingProgress: Math.round(bookmark.progress * 100),
      estimatedReadTime: calculateReadingTime(wordCount),
      wordCount,
      isArchived: false,
      isFavorite: bookmark.starred === '1',
      tagIds: [],
      highlights: [],
      status: bookmark.progress >= 1 ? 'finished' : bookmark.progress > 0 ? 'reading' : 'unread',
      source: 'instapaper',
      syncStatus: 'synced',
    };

    // Import highlights if requested
    if (includeHighlights) {
      try {
        const instaHighlights = await this.fetchHighlights(bookmark.bookmark_id);
        article.highlights = instaHighlights.map((h) => ({
          id: generateId(),
          articleId: article.id,
          text: h.text,
          note: h.note || undefined,
          color: 'yellow' as const,
          startOffset: h.position,
          endOffset: h.position + h.text.length,
          createdAt: new Date(h.time * 1000).toISOString(),
          updatedAt: now,
          syncStatus: 'synced' as const,
        }));
      } catch (error) {
        console.log('Could not fetch highlights for bookmark');
      }
    }

    return article;
  }

  // Add bookmark to Instapaper
  async addBookmark(url: string, title?: string, description?: string): Promise<InstapaperBookmark> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Instapaper');
    }

    const params: Record<string, string> = { url };
    if (title) params.title = title;
    if (description) params.description = description;

    const urlParams = this.generateOAuthParams('POST', `${INSTAPAPER_OAUTH_BASE}/bookmarks/add`, params);

    const response = await fetch(`${INSTAPAPER_OAUTH_BASE}/bookmarks/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlParams.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to add bookmark');
    }

    const data = await response.json();
    return data[0];
  }

  // Archive bookmark
  async archiveBookmark(bookmarkId: number): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Instapaper');
    }

    const urlParams = this.generateOAuthParams('POST', `${INSTAPAPER_OAUTH_BASE}/bookmarks/archive`, {
      bookmark_id: bookmarkId.toString(),
    });

    const response = await fetch(`${INSTAPAPER_OAUTH_BASE}/bookmarks/archive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlParams.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to archive bookmark');
    }
  }

  // Delete bookmark
  async deleteBookmark(bookmarkId: number): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Instapaper');
    }

    const urlParams = this.generateOAuthParams('POST', `${INSTAPAPER_OAUTH_BASE}/bookmarks/delete`, {
      bookmark_id: bookmarkId.toString(),
    });

    const response = await fetch(`${INSTAPAPER_OAUTH_BASE}/bookmarks/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlParams.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete bookmark');
    }
  }
}

export const instapaperService = new InstapaperService();
