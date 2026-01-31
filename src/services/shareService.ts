// Share Service - Handles share sheet integration and sharing functionality

import * as Sharing from 'expo-sharing';
import {
  cacheDirectory,
  writeAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { Article, Highlight, ExportFormat, ShareData } from '../types';
import { articleToMarkdown, articleToHtml, generateId } from '../utils/helpers';

// Share extension URL scheme
const SHARE_SCHEME = 'luminareader';

interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
  mimeType?: string;
}

class ShareService {
  // Check if sharing is available
  async isAvailable(): Promise<boolean> {
    return Sharing.isAvailableAsync();
  }

  // Share article
  async shareArticle(article: Article, format: ExportFormat = 'markdown'): Promise<void> {
    const content = this.formatArticleForShare(article, format);
    const filename = this.getFilename(article, format);
    const mimeType = this.getMimeType(format);

    const filePath = `${cacheDirectory}${filename}`;
    await writeAsStringAsync(filePath, content, {
      encoding: EncodingType.UTF8,
    });

    if (await this.isAvailable()) {
      await Sharing.shareAsync(filePath, {
        mimeType,
        dialogTitle: `Share: ${article.title}`,
        UTI: this.getUTI(format),
      });
    }
  }

  // Share highlight
  async shareHighlight(highlight: Highlight, article: Article): Promise<void> {
    const text = this.formatHighlightForShare(highlight, article);

    if (await this.isAvailable()) {
      const filePath = `${cacheDirectory}highlight-${highlight.id}.txt`;
      await writeAsStringAsync(filePath, text);

      await Sharing.shareAsync(filePath, {
        mimeType: 'text/plain',
        dialogTitle: 'Share Highlight',
      });
    }
  }

  // Share multiple highlights
  async shareHighlights(
    highlights: { highlight: Highlight; article: Article }[],
    format: 'text' | 'markdown' = 'markdown'
  ): Promise<void> {
    let content = '';

    if (format === 'markdown') {
      content = '# Highlights\n\n';
      for (const { highlight, article } of highlights) {
        content += `> ${highlight.text}\n`;
        if (highlight.note) {
          content += `*Note: ${highlight.note}*\n`;
        }
        content += `— [${article.title}](${article.url})\n\n`;
      }
    } else {
      for (const { highlight, article } of highlights) {
        content += `"${highlight.text}"\n`;
        if (highlight.note) {
          content += `Note: ${highlight.note}\n`;
        }
        content += `— ${article.title}\n\n`;
      }
    }

    const extension = format === 'markdown' ? 'md' : 'txt';
    const filename = `highlights-${new Date().toISOString().split('T')[0]}.${extension}`;
    const filePath = `${cacheDirectory}${filename}`;

    await writeAsStringAsync(filePath, content);

    if (await this.isAvailable()) {
      await Sharing.shareAsync(filePath, {
        mimeType: format === 'markdown' ? 'text/markdown' : 'text/plain',
        dialogTitle: 'Share Highlights',
      });
    }
  }

  // Share URL
  async shareUrl(url: string, title?: string): Promise<void> {
    const content = title ? `${title}\n${url}` : url;
    const filePath = `${cacheDirectory}share-url.txt`;

    await writeAsStringAsync(filePath, content);

    if (await this.isAvailable()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/plain',
        dialogTitle: title || 'Share URL',
      });
    }
  }

  // Copy to clipboard
  async copyToClipboard(text: string): Promise<void> {
    await Clipboard.setStringAsync(text);
  }

  // Copy article URL
  async copyArticleUrl(article: Article): Promise<void> {
    if (article.url) {
      await this.copyToClipboard(article.url);
    }
  }

  // Copy highlight text
  async copyHighlight(highlight: Highlight, includeNote = false): Promise<void> {
    let text = highlight.text;
    if (includeNote && highlight.note) {
      text += `\n\nNote: ${highlight.note}`;
    }
    await this.copyToClipboard(text);
  }

  // Format article for sharing
  private formatArticleForShare(article: Article, format: ExportFormat): string {
    switch (format) {
      case 'markdown':
        return articleToMarkdown(article);
      case 'html':
        return articleToHtml(article);
      case 'json':
        return JSON.stringify(article, null, 2);
      default:
        return `${article.title}\n\n${article.content}`;
    }
  }

  // Format highlight for sharing
  private formatHighlightForShare(highlight: Highlight, article: Article): string {
    let text = `"${highlight.text}"`;
    if (highlight.note) {
      text += `\n\nNote: ${highlight.note}`;
    }
    text += `\n\n— ${article.title}`;
    if (article.author) {
      text += ` by ${article.author}`;
    }
    if (article.url) {
      text += `\n${article.url}`;
    }
    return text;
  }

  // Get filename for export
  private getFilename(article: Article, format: ExportFormat): string {
    const sanitizedTitle = article.title
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '_')
      .slice(0, 50);
    const extension = this.getExtension(format);
    return `${sanitizedTitle}.${extension}`;
  }

  // Get file extension
  private getExtension(format: ExportFormat): string {
    switch (format) {
      case 'markdown':
        return 'md';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      case 'csv':
        return 'csv';
      case 'epub':
        return 'epub';
      default:
        return 'txt';
    }
  }

  // Get MIME type
  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case 'markdown':
        return 'text/markdown';
      case 'html':
        return 'text/html';
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'epub':
        return 'application/epub+zip';
      default:
        return 'text/plain';
    }
  }

  // Get UTI (Uniform Type Identifier) for iOS
  private getUTI(format: ExportFormat): string {
    switch (format) {
      case 'markdown':
        return 'net.daringfireball.markdown';
      case 'html':
        return 'public.html';
      case 'json':
        return 'public.json';
      case 'csv':
        return 'public.comma-separated-values-text';
      case 'epub':
        return 'org.idpf.epub-container';
      default:
        return 'public.plain-text';
    }
  }

  // Handle incoming share data
  parseShareData(data: any): ShareData | null {
    if (!data) return null;

    // iOS share extension data
    if (Platform.OS === 'ios') {
      return {
        url: data.url,
        text: data.text,
        title: data.title,
      };
    }

    // Android intent data
    if (Platform.OS === 'android') {
      return {
        url: data.url || data.text,
        text: data.text,
        title: data.title || data.subject,
      };
    }

    return null;
  }

  // Create deep link URL for the app
  createDeepLink(path: string, params?: Record<string, string>): string {
    let url = `${SHARE_SCHEME}://${path}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    return url;
  }

  // Parse deep link URL
  parseDeepLink(url: string): { path: string; params: Record<string, string> } | null {
    try {
      const parsed = Linking.parse(url);
      return {
        path: parsed.path || '',
        params: (parsed.queryParams as Record<string, string>) || {},
      };
    } catch {
      return null;
    }
  }

  // Handle deep link for adding article
  createAddArticleLink(url: string): string {
    return this.createDeepLink('add', { url: encodeURIComponent(url) });
  }

  // Generate shareable link for article
  generateShareableLink(article: Article): string {
    // In a real app, this would generate a link to a web version
    return article.url || this.createDeepLink('article', { id: article.id });
  }
}

export const shareService = new ShareService();
