// Readwise Integration Service
// Handles import/export/sync with Readwise for spaced repetition

import * as SecureStore from 'expo-secure-store';
import { Article, Highlight } from '../../types';
import { generateId, countWords, calculateReadingTime } from '../../utils/helpers';

const READWISE_API_BASE = 'https://readwise.io/api/v2';
const READWISE_READER_API = 'https://readwise.io/api/v3';

interface ReadwiseBook {
  id: number;
  title: string;
  author: string;
  category: string;
  source: string;
  num_highlights: number;
  last_highlight_at: string;
  updated: string;
  cover_image_url: string;
  highlights_url: string;
  source_url: string;
  asin: string;
  tags: Array<{ id: number; name: string }>;
}

interface ReadwiseHighlight {
  id: number;
  text: string;
  note: string;
  location: number;
  location_type: string;
  highlighted_at: string;
  url: string;
  color: string;
  updated: string;
  book_id: number;
  tags: Array<{ id: number; name: string }>;
}

interface ReadwiseExportResult {
  count: number;
  nextPageCursor: string | null;
  results: ReadwiseBook[];
}

interface ReaderDocument {
  id: string;
  url: string;
  title: string;
  author: string;
  source: string;
  category: string;
  location: string;
  tags: Record<string, string>;
  site_name: string;
  word_count: number;
  created_at: string;
  updated_at: string;
  published_date: string;
  summary: string;
  image_url: string;
  content: string;
  source_url: string;
  notes: string;
  parent_id: string;
  reading_progress: number;
}

class ReadwiseService {
  private accessToken: string | null = null;

  async loadCredentials(): Promise<void> {
    this.accessToken = await SecureStore.getItemAsync('readwise_access_token');
  }

  async saveAccessToken(token: string): Promise<void> {
    this.accessToken = token;
    await SecureStore.setItemAsync('readwise_access_token', token);
  }

  async clearCredentials(): Promise<void> {
    this.accessToken = null;
    await SecureStore.deleteItemAsync('readwise_access_token');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private getHeaders() {
    return {
      'Authorization': `Token ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  // Verify API token
  async verifyToken(token: string): Promise<boolean> {
    const response = await fetch(`${READWISE_API_BASE}/auth/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    return response.ok;
  }

  // Authenticate with API token
  async authenticate(token: string): Promise<boolean> {
    const isValid = await this.verifyToken(token);
    if (isValid) {
      await this.saveAccessToken(token);
      return true;
    }
    return false;
  }

  // Fetch all books (sources)
  async fetchBooks(options?: {
    category?: string;
    source?: string;
    numHighlightsGte?: number;
    updatedAfter?: string;
    pageCursor?: string;
  }): Promise<{ books: ReadwiseBook[]; nextCursor: string | null }> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Readwise');
    }

    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.source) params.append('source', options.source);
    if (options?.numHighlightsGte) params.append('num_highlights__gte', options.numHighlightsGte.toString());
    if (options?.updatedAfter) params.append('updated__gt', options.updatedAfter);
    if (options?.pageCursor) params.append('pageCursor', options.pageCursor);

    const response = await fetch(`${READWISE_API_BASE}/books/?${params.toString()}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data = await response.json();
    return {
      books: data.results,
      nextCursor: data.nextPageCursor,
    };
  }

  // Fetch all books with pagination
  async fetchAllBooks(options?: {
    category?: string;
    source?: string;
  }): Promise<ReadwiseBook[]> {
    const allBooks: ReadwiseBook[] = [];
    let cursor: string | null = null;

    do {
      const { books, nextCursor } = await this.fetchBooks({
        ...options,
        pageCursor: cursor || undefined,
      });
      allBooks.push(...books);
      cursor = nextCursor;
    } while (cursor);

    return allBooks;
  }

  // Fetch highlights for a book
  async fetchHighlights(bookId?: number, options?: {
    updatedAfter?: string;
    pageCursor?: string;
  }): Promise<{ highlights: ReadwiseHighlight[]; nextCursor: string | null }> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Readwise');
    }

    const params = new URLSearchParams();
    if (bookId) params.append('book_id', bookId.toString());
    if (options?.updatedAfter) params.append('updated__gt', options.updatedAfter);
    if (options?.pageCursor) params.append('pageCursor', options.pageCursor);

    const response = await fetch(`${READWISE_API_BASE}/highlights/?${params.toString()}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch highlights');
    }

    const data = await response.json();
    return {
      highlights: data.results,
      nextCursor: data.nextPageCursor,
    };
  }

  // Fetch all highlights with pagination
  async fetchAllHighlights(bookId?: number): Promise<ReadwiseHighlight[]> {
    const allHighlights: ReadwiseHighlight[] = [];
    let cursor: string | null = null;

    do {
      const { highlights, nextCursor } = await this.fetchHighlights(bookId, {
        pageCursor: cursor || undefined,
      });
      allHighlights.push(...highlights);
      cursor = nextCursor;
    } while (cursor);

    return allHighlights;
  }

  // Import books as articles
  async importBooks(options?: {
    category?: 'articles' | 'books' | 'tweets' | 'podcasts';
  }): Promise<Article[]> {
    const books = await this.fetchAllBooks({
      category: options?.category,
    });

    const articles: Article[] = [];

    for (const book of books) {
      const highlights = await this.fetchAllHighlights(book.id);
      const article = this.bookToArticle(book, highlights);
      articles.push(article);
    }

    return articles;
  }

  // Convert Readwise book to Article
  private bookToArticle(book: ReadwiseBook, highlights: ReadwiseHighlight[]): Article {
    const now = new Date().toISOString();

    return {
      id: generateId(),
      url: book.source_url || '',
      title: book.title,
      author: book.author,
      coverImage: book.cover_image_url,
      content: '', // Readwise doesn't provide full content
      savedAt: book.updated,
      updatedAt: now,
      readingProgress: 0,
      estimatedReadTime: 0,
      wordCount: 0,
      isArchived: false,
      isFavorite: false,
      tagIds: [], // Tags need to be mapped
      highlights: highlights.map(h => this.readwiseHighlightToHighlight(h)),
      status: 'unread',
      source: 'readwise',
      syncStatus: 'synced',
    };
  }

  // Convert Readwise highlight to our Highlight type
  private readwiseHighlightToHighlight(h: ReadwiseHighlight): Highlight {
    const colorMap: Record<string, string> = {
      yellow: 'yellow',
      blue: 'blue',
      pink: 'pink',
      orange: 'orange',
      green: 'green',
      purple: 'purple',
    };

    return {
      id: generateId(),
      articleId: '', // Will be set when adding to article
      text: h.text,
      note: h.note || undefined,
      color: (colorMap[h.color] || 'yellow') as any,
      startOffset: h.location,
      endOffset: h.location + h.text.length,
      createdAt: h.highlighted_at,
      updatedAt: h.updated,
      syncStatus: 'synced',
    };
  }

  // Export highlights to Readwise
  async exportHighlights(highlights: Array<{
    text: string;
    title: string;
    author?: string;
    source_url?: string;
    source_type?: string;
    category?: string;
    note?: string;
    location?: number;
    location_type?: string;
    highlighted_at?: string;
    highlight_url?: string;
  }>): Promise<{ modified_highlights: number[] }> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Readwise');
    }

    const response = await fetch(`${READWISE_API_BASE}/highlights/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ highlights }),
    });

    if (!response.ok) {
      throw new Error('Failed to export highlights');
    }

    return response.json();
  }

  // Export article highlights to Readwise
  async exportArticleHighlights(article: Article): Promise<{ modified_highlights: number[] }> {
    const highlights = article.highlights.map(h => ({
      text: h.text,
      title: article.title,
      author: article.author,
      source_url: article.url,
      source_type: 'article',
      category: 'articles',
      note: h.note,
      highlighted_at: h.createdAt,
    }));

    return this.exportHighlights(highlights);
  }

  // ===== Readwise Reader API (v3) =====

  // Fetch documents from Reader
  async fetchReaderDocuments(options?: {
    updatedAfter?: string;
    location?: 'new' | 'later' | 'shortlist' | 'archive' | 'feed';
    category?: 'article' | 'email' | 'rss' | 'highlight' | 'note' | 'pdf' | 'epub' | 'tweet' | 'video';
    pageCursor?: string;
  }): Promise<{ documents: ReaderDocument[]; nextCursor: string | null }> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Readwise');
    }

    const params = new URLSearchParams();
    if (options?.updatedAfter) params.append('updatedAfter', options.updatedAfter);
    if (options?.location) params.append('location', options.location);
    if (options?.category) params.append('category', options.category);
    if (options?.pageCursor) params.append('pageCursor', options.pageCursor);

    const response = await fetch(`${READWISE_READER_API}/list/?${params.toString()}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Reader documents');
    }

    const data = await response.json();
    return {
      documents: data.results,
      nextCursor: data.nextPageCursor,
    };
  }

  // Import from Reader
  async importFromReader(options?: {
    location?: 'new' | 'later' | 'shortlist' | 'archive';
  }): Promise<Article[]> {
    const allDocs: ReaderDocument[] = [];
    let cursor: string | null = null;

    do {
      const { documents, nextCursor } = await this.fetchReaderDocuments({
        ...options,
        pageCursor: cursor || undefined,
      });
      allDocs.push(...documents);
      cursor = nextCursor;
    } while (cursor);

    return allDocs.map(doc => this.readerDocToArticle(doc));
  }

  // Convert Reader document to Article
  private readerDocToArticle(doc: ReaderDocument): Article {
    const now = new Date().toISOString();

    return {
      id: generateId(),
      url: doc.url || doc.source_url,
      title: doc.title,
      author: doc.author,
      excerpt: doc.summary,
      content: doc.content || doc.summary || '',
      coverImage: doc.image_url,
      siteName: doc.site_name,
      publishedDate: doc.published_date,
      savedAt: doc.created_at,
      updatedAt: now,
      readingProgress: Math.round((doc.reading_progress || 0) * 100),
      estimatedReadTime: calculateReadingTime(doc.word_count || 0),
      wordCount: doc.word_count || 0,
      isArchived: doc.location === 'archive',
      isFavorite: doc.location === 'shortlist',
      tagIds: [],
      highlights: [],
      status: doc.reading_progress >= 1 ? 'finished' : doc.reading_progress > 0 ? 'reading' : 'unread',
      source: 'readwise',
      syncStatus: 'synced',
    };
  }

  // Save URL to Reader
  async saveToReader(url: string, options?: {
    html?: string;
    should_clean_html?: boolean;
    title?: string;
    author?: string;
    summary?: string;
    published_date?: string;
    image_url?: string;
    location?: 'new' | 'later' | 'shortlist' | 'archive';
    category?: 'article' | 'email' | 'rss' | 'highlight' | 'note' | 'pdf' | 'epub' | 'tweet' | 'video';
    saved_using?: string;
    tags?: string[];
    notes?: string;
  }): Promise<{ id: string; url: string }> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Readwise');
    }

    const response = await fetch(`${READWISE_READER_API}/save/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        url,
        ...options,
        saved_using: options?.saved_using || 'LuminaReader',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save to Reader');
    }

    return response.json();
  }
}

export const readwiseService = new ReadwiseService();
