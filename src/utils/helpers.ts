// Utility functions for LuminaReader

import { Article, Highlight } from '../types';

// Generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format dates
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
};

// Format reading time
export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

// Calculate reading time from word count
export const calculateReadingTime = (wordCount: number, wordsPerMinute = 200): number => {
  return Math.ceil(wordCount / wordsPerMinute);
};

// Count words in text
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Extract domain from URL
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Strip HTML tags
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

// Create excerpt from content
export const createExcerpt = (content: string, maxLength = 200): string => {
  const stripped = stripHtml(content);
  return truncateText(stripped, maxLength);
};

// Validate URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Group articles by date
export const groupArticlesByDate = (articles: Article[]): Record<string, Article[]> => {
  const groups: Record<string, Article[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  articles.forEach(article => {
    const date = new Date(article.savedAt);
    let key: string;

    if (date >= today) {
      key = 'Today';
    } else if (date >= yesterday) {
      key = 'Yesterday';
    } else if (date >= lastWeek) {
      key = 'This Week';
    } else if (date >= lastMonth) {
      key = 'This Month';
    } else {
      key = 'Older';
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(article);
  });

  return groups;
};

// Sort articles
export const sortArticles = (
  articles: Article[],
  sortBy: string,
  direction: 'asc' | 'desc' = 'desc'
): Article[] => {
  return [...articles].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'savedAt':
        comparison = new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'author':
        comparison = (a.author || '').localeCompare(b.author || '');
        break;
      case 'readingProgress':
        comparison = a.readingProgress - b.readingProgress;
        break;
      case 'estimatedReadTime':
        comparison = a.estimatedReadTime - b.estimatedReadTime;
        break;
      default:
        comparison = 0;
    }

    return direction === 'desc' ? -comparison : comparison;
  });
};

// Filter articles
export const filterArticles = (
  articles: Article[],
  filters: {
    status?: string;
    folderId?: string;
    tagIds?: string[];
    isFavorite?: boolean;
    isArchived?: boolean;
    searchQuery?: string;
  }
): Article[] => {
  return articles.filter(article => {
    if (filters.status && article.status !== filters.status) return false;
    if (filters.folderId && article.folderId !== filters.folderId) return false;
    if (filters.isFavorite !== undefined && article.isFavorite !== filters.isFavorite) return false;
    if (filters.isArchived !== undefined && article.isArchived !== filters.isArchived) return false;

    if (filters.tagIds && filters.tagIds.length > 0) {
      const hasMatchingTag = filters.tagIds.some(tagId => article.tagIds.includes(tagId));
      if (!hasMatchingTag) return false;
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = article.title.toLowerCase().includes(query);
      const matchesAuthor = article.author?.toLowerCase().includes(query);
      const matchesExcerpt = article.excerpt?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesAuthor && !matchesExcerpt) return false;
    }

    return true;
  });
};

// Get highlight statistics
export const getHighlightStats = (highlights: Highlight[]): {
  total: number;
  withNotes: number;
  byColor: Record<string, number>;
} => {
  const byColor: Record<string, number> = {};
  let withNotes = 0;

  highlights.forEach(highlight => {
    byColor[highlight.color] = (byColor[highlight.color] || 0) + 1;
    if (highlight.note) withNotes++;
  });

  return {
    total: highlights.length,
    withNotes,
    byColor,
  };
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Convert article to Markdown
export const articleToMarkdown = (article: Article): string => {
  let markdown = `# ${article.title}\n\n`;

  if (article.author) {
    markdown += `**Author:** ${article.author}\n`;
  }
  if (article.url) {
    markdown += `**URL:** ${article.url}\n`;
  }
  if (article.publishedDate) {
    markdown += `**Published:** ${article.publishedDate}\n`;
  }
  markdown += `**Saved:** ${new Date(article.savedAt).toLocaleDateString()}\n\n`;

  if (article.highlights.length > 0) {
    markdown += `## Highlights\n\n`;
    article.highlights.forEach((highlight, index) => {
      markdown += `> ${highlight.text}\n\n`;
      if (highlight.note) {
        markdown += `*Note: ${highlight.note}*\n\n`;
      }
    });
  }

  markdown += `## Content\n\n${article.content}`;

  return markdown;
};

// Convert article to HTML
export const articleToHtml = (article: Article): string => {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${article.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; }
    .meta { color: #666; margin-bottom: 20px; }
    .highlight { background-color: #fef08a; padding: 10px; margin: 10px 0; border-left: 3px solid #eab308; }
    .note { font-style: italic; color: #666; }
  </style>
</head>
<body>
  <h1>${article.title}</h1>
  <div class="meta">`;

  if (article.author) {
    html += `<p><strong>Author:</strong> ${article.author}</p>`;
  }
  if (article.url) {
    html += `<p><strong>URL:</strong> <a href="${article.url}">${article.url}</a></p>`;
  }

  html += `</div>`;

  if (article.highlights.length > 0) {
    html += `<h2>Highlights</h2>`;
    article.highlights.forEach(highlight => {
      html += `<div class="highlight">${highlight.text}`;
      if (highlight.note) {
        html += `<p class="note">Note: ${highlight.note}</p>`;
      }
      html += `</div>`;
    });
  }

  html += `<h2>Content</h2>${article.htmlContent || `<p>${article.content}</p>`}</body></html>`;

  return html;
};
