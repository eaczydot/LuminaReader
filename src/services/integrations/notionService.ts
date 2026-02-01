// Notion Integration Service
// Handles import/export/sync with Notion databases

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Article, Highlight, NotionDatabase, NotionPage } from '../../types';
import { useIntegrationStore } from '../../stores/integrationStore';
import { generateId, countWords, calculateReadingTime } from '../../utils/helpers';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_OAUTH_URL = 'https://api.notion.com/v1/oauth/authorize';
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID || 'YOUR_NOTION_CLIENT_ID';
const NOTION_REDIRECT_URI = Linking.createURL('notion-callback');

interface NotionAuthResponse {
  access_token: string;
  workspace_id: string;
  workspace_name: string;
  bot_id: string;
}

interface NotionSearchResponse {
  results: any[];
  next_cursor: string | null;
  has_more: boolean;
}

class NotionService {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };
  }

  // OAuth Flow
  async initiateOAuth(): Promise<string> {
    const state = generateId();
    const params = new URLSearchParams({
      client_id: NOTION_CLIENT_ID,
      redirect_uri: NOTION_REDIRECT_URI,
      response_type: 'code',
      owner: 'user',
      state,
    });

    const authUrl = `${NOTION_OAUTH_URL}?${params.toString()}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, NOTION_REDIRECT_URI);

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      if (code) {
        return code;
      }
    }

    throw new Error('OAuth flow was cancelled or failed');
  }

  async exchangeCodeForToken(code: string): Promise<NotionAuthResponse> {
    // Note: In a real app, this should be done server-side to protect the client secret
    const response = await fetch(`${NOTION_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: NOTION_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  // Database Operations
  async listDatabases(): Promise<NotionDatabase[]> {
    const response = await fetch(`${NOTION_API_BASE}/search`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        filter: {
          property: 'object',
          value: 'database',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch databases');
    }

    const data: NotionSearchResponse = await response.json();

    return data.results.map((db: any) => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || 'Untitled',
      icon: db.icon?.emoji || '📄',
    }));
  }

  async getDatabase(databaseId: string): Promise<any> {
    const response = await fetch(`${NOTION_API_BASE}/databases/${databaseId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch database');
    }

    return response.json();
  }

  // Import from Notion
  async importFromDatabase(databaseId: string): Promise<Article[]> {
    const articles: Article[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const response = await fetch(`${NOTION_API_BASE}/databases/${databaseId}/query`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          start_cursor: startCursor,
          page_size: 100,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to query database');
      }

      const data = await response.json();

      for (const page of data.results) {
        const article = await this.pageToArticle(page);
        if (article) {
          articles.push(article);
        }
      }

      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    return articles;
  }

  private async pageToArticle(page: any): Promise<Article | null> {
    try {
      const properties = page.properties;

      // Try to extract common properties
      const title = this.extractTitle(properties);
      const url = this.extractUrl(properties);
      const content = await this.getPageContent(page.id);

      const wordCount = countWords(content);
      const now = new Date().toISOString();

      return {
        id: generateId(),
        url: url || page.url,
        title: title || 'Untitled',
        content,
        wordCount,
        estimatedReadTime: calculateReadingTime(wordCount),
        savedAt: now,
        updatedAt: now,
        readingProgress: 0,
        isArchived: false,
        isFavorite: false,
        tagIds: [],
        highlights: [],
        status: 'unread',
        source: 'notion',
        syncStatus: 'synced',
      };
    } catch (error) {
      console.error('Error converting Notion page to article:', error);
      return null;
    }
  }

  private extractTitle(properties: any): string {
    for (const key of ['Title', 'Name', 'title', 'name']) {
      if (properties[key]?.title?.[0]?.plain_text) {
        return properties[key].title[0].plain_text;
      }
    }
    return 'Untitled';
  }

  private extractUrl(properties: any): string | undefined {
    for (const key of ['URL', 'Link', 'url', 'link', 'Source']) {
      if (properties[key]?.url) {
        return properties[key].url;
      }
    }
    return undefined;
  }

  async getPageContent(pageId: string): Promise<string> {
    const response = await fetch(`${NOTION_API_BASE}/blocks/${pageId}/children`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch page content');
    }

    const data = await response.json();
    return this.blocksToText(data.results);
  }

  private blocksToText(blocks: any[]): string {
    return blocks
      .map((block: any) => {
        const type = block.type;
        const content = block[type];

        if (content?.rich_text) {
          return content.rich_text.map((t: any) => t.plain_text).join('');
        }

        return '';
      })
      .filter(Boolean)
      .join('\n\n');
  }

  // Export to Notion
  async exportToDatabase(databaseId: string, article: Article): Promise<string> {
    const response = await fetch(`${NOTION_API_BASE}/pages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          Title: {
            title: [{ text: { content: article.title } }],
          },
          URL: {
            url: article.url,
          },
          Author: article.author ? {
            rich_text: [{ text: { content: article.author } }],
          } : undefined,
          'Reading Progress': {
            number: article.readingProgress,
          },
          Status: {
            select: { name: article.status },
          },
        },
        children: this.articleToBlocks(article),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create page: ${error}`);
    }

    const data = await response.json();
    return data.id;
  }

  private articleToBlocks(article: Article): any[] {
    const blocks: any[] = [];

    // Add content
    if (article.content) {
      const paragraphs = article.content.split('\n\n');
      for (const para of paragraphs.slice(0, 100)) { // Notion has a limit
        if (para.trim()) {
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: para.slice(0, 2000) } }],
            },
          });
        }
      }
    }

    // Add highlights section
    if (article.highlights.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Highlights' } }],
        },
      });

      for (const highlight of article.highlights) {
        blocks.push({
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [{ type: 'text', text: { content: highlight.text } }],
          },
        });

        if (highlight.note) {
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                { type: 'text', text: { content: 'Note: ' }, annotations: { italic: true } },
                { type: 'text', text: { content: highlight.note } },
              ],
            },
          });
        }
      }
    }

    return blocks;
  }

  // Export highlights only
  async exportHighlights(databaseId: string, highlights: { highlight: Highlight; article: Article }[]): Promise<void> {
    for (const { highlight, article } of highlights) {
      await fetch(`${NOTION_API_BASE}/pages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties: {
            Title: {
              title: [{ text: { content: highlight.text.slice(0, 100) } }],
            },
            Source: {
              rich_text: [{ text: { content: article.title } }],
            },
            URL: article.url ? { url: article.url } : undefined,
            Note: highlight.note ? {
              rich_text: [{ text: { content: highlight.note } }],
            } : undefined,
          },
        }),
      });
    }
  }
}

export const notionService = new NotionService();
