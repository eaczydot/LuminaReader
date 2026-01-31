// Export Service - Handles data export functionality

import {
  cacheDirectory,
  writeAsStringAsync,
  readAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {
  Article,
  Highlight,
  Tag,
  Folder,
  ExportFormat,
  ExportOptions,
  ImportResult,
} from '../../types';
import { articleToMarkdown, articleToHtml, generateId, countWords, calculateReadingTime } from '../../utils/helpers';

interface ExportData {
  version: string;
  exportedAt: string;
  articles: Article[];
  tags: Tag[];
  folders: Folder[];
}

class ExportService {
  private readonly EXPORT_VERSION = '1.0.0';

  // Export all data to JSON
  async exportToJson(
    articles: Article[],
    tags: Tag[],
    folders: Folder[]
  ): Promise<string> {
    const data: ExportData = {
      version: this.EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      articles,
      tags,
      folders,
    };

    const filename = `lumina-reader-export-${new Date().toISOString().split('T')[0]}.json`;
    const filePath = `${cacheDirectory}${filename}`;

    await writeAsStringAsync(filePath, JSON.stringify(data, null, 2), {
      encoding: EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export LuminaReader Data',
        UTI: 'public.json',
      });
    }

    return filePath;
  }

  // Export articles based on options
  async exportArticles(
    articles: Article[],
    options: ExportOptions
  ): Promise<string[]> {
    const filePaths: string[] = [];

    // Filter articles if specific IDs provided
    let articlesToExport = articles;
    if (options.articleIds) {
      articlesToExport = articles.filter(a => options.articleIds!.includes(a.id));
    }
    if (options.folderId) {
      articlesToExport = articlesToExport.filter(a => a.folderId === options.folderId);
    }

    switch (options.format) {
      case 'json':
        const jsonPath = await this.exportArticlesToJson(articlesToExport);
        filePaths.push(jsonPath);
        break;

      case 'markdown':
        for (const article of articlesToExport) {
          const mdPath = await this.exportArticleToMarkdown(article, options);
          filePaths.push(mdPath);
        }
        break;

      case 'html':
        for (const article of articlesToExport) {
          const htmlPath = await this.exportArticleToHtml(article, options);
          filePaths.push(htmlPath);
        }
        break;

      case 'csv':
        const csvPath = await this.exportArticlesToCsv(articlesToExport, options);
        filePaths.push(csvPath);
        break;
    }

    return filePaths;
  }

  // Export articles to JSON file
  private async exportArticlesToJson(articles: Article[]): Promise<string> {
    const filename = `articles-${new Date().toISOString().split('T')[0]}.json`;
    const filePath = `${cacheDirectory}${filename}`;

    await writeAsStringAsync(filePath, JSON.stringify(articles, null, 2));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export Articles',
      });
    }

    return filePath;
  }

  // Export single article to Markdown
  private async exportArticleToMarkdown(
    article: Article,
    options: ExportOptions
  ): Promise<string> {
    let markdown = articleToMarkdown(article);

    if (!options.includeHighlights) {
      // Remove highlights section
      markdown = markdown.replace(/## Highlights[\s\S]*?(?=## Content|$)/, '');
    }

    const sanitizedTitle = article.title.replace(/[/\\?%*:|"<>]/g, '-').slice(0, 50);
    const filename = `${sanitizedTitle}.md`;
    const filePath = `${cacheDirectory}${filename}`;

    await writeAsStringAsync(filePath, markdown);

    return filePath;
  }

  // Export single article to HTML
  private async exportArticleToHtml(
    article: Article,
    options: ExportOptions
  ): Promise<string> {
    const html = articleToHtml(article);

    const sanitizedTitle = article.title.replace(/[/\\?%*:|"<>]/g, '-').slice(0, 50);
    const filename = `${sanitizedTitle}.html`;
    const filePath = `${cacheDirectory}${filename}`;

    await writeAsStringAsync(filePath, html);

    return filePath;
  }

  // Export articles to CSV
  private async exportArticlesToCsv(
    articles: Article[],
    options: ExportOptions
  ): Promise<string> {
    const headers = [
      'Title',
      'Author',
      'URL',
      'Saved At',
      'Status',
      'Reading Progress',
      'Word Count',
      'Favorite',
      'Archived',
      options.includeHighlights ? 'Highlights Count' : null,
    ].filter(Boolean);

    const rows = articles.map(article => [
      `"${article.title.replace(/"/g, '""')}"`,
      `"${(article.author || '').replace(/"/g, '""')}"`,
      article.url,
      article.savedAt,
      article.status,
      article.readingProgress,
      article.wordCount,
      article.isFavorite ? 'Yes' : 'No',
      article.isArchived ? 'Yes' : 'No',
      options.includeHighlights ? article.highlights.length : null,
    ].filter(v => v !== null));

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const filename = `articles-${new Date().toISOString().split('T')[0]}.csv`;
    const filePath = `${cacheDirectory}${filename}`;

    await writeAsStringAsync(filePath, csv);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Articles',
      });
    }

    return filePath;
  }

  // Export highlights only
  async exportHighlights(
    highlights: { highlight: Highlight; article: Article }[],
    format: 'json' | 'markdown' | 'csv' = 'markdown'
  ): Promise<string> {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(highlights, null, 2);
        filename = `highlights-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;

      case 'csv':
        const headers = ['Text', 'Note', 'Article Title', 'Article URL', 'Color', 'Created At'];
        const rows = highlights.map(({ highlight, article }) => [
          `"${highlight.text.replace(/"/g, '""')}"`,
          `"${(highlight.note || '').replace(/"/g, '""')}"`,
          `"${article.title.replace(/"/g, '""')}"`,
          article.url || '',
          highlight.color,
          highlight.createdAt,
        ]);
        content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        filename = `highlights-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;

      default:
        content = '# Highlights\n\n';
        for (const { highlight, article } of highlights) {
          content += `> ${highlight.text}\n`;
          if (highlight.note) {
            content += `*Note: ${highlight.note}*\n`;
          }
          content += `— [${article.title}](${article.url || ''})\n\n`;
        }
        filename = `highlights-${new Date().toISOString().split('T')[0]}.md`;
        mimeType = 'text/markdown';
    }

    const filePath = `${cacheDirectory}${filename}`;
    await writeAsStringAsync(filePath, content);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType,
        dialogTitle: 'Export Highlights',
      });
    }

    return filePath;
  }

  // Import data from JSON file
  async importFromJson(): Promise<ImportResult> {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    });

    if (result.canceled || !result.assets?.[0]) {
      return {
        success: false,
        importedCount: 0,
        failedCount: 0,
        errors: ['Import cancelled'],
        articles: [],
      };
    }

    try {
      const content = await readAsStringAsync(result.assets[0].uri);
      const data = JSON.parse(content);

      // Handle different import formats
      if (data.version && data.articles) {
        // Full LuminaReader export
        return {
          success: true,
          importedCount: data.articles.length,
          failedCount: 0,
          errors: [],
          articles: data.articles,
        };
      } else if (Array.isArray(data)) {
        // Array of articles
        return {
          success: true,
          importedCount: data.length,
          failedCount: 0,
          errors: [],
          articles: this.normalizeArticles(data),
        };
      } else {
        return {
          success: false,
          importedCount: 0,
          failedCount: 0,
          errors: ['Unrecognized file format'],
          articles: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        failedCount: 0,
        errors: [`Error reading file: ${error}`],
        articles: [],
      };
    }
  }

  // Import from Instapaper CSV export
  async importInstapaperCsv(): Promise<ImportResult> {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/csv',
    });

    if (result.canceled || !result.assets?.[0]) {
      return {
        success: false,
        importedCount: 0,
        failedCount: 0,
        errors: ['Import cancelled'],
        articles: [],
      };
    }

    try {
      const content = await readAsStringAsync(result.assets[0].uri);
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const urlIndex = headers.findIndex(h => h === 'url');
      const titleIndex = headers.findIndex(h => h === 'title');
      const folderIndex = headers.findIndex(h => h === 'folder');

      if (urlIndex === -1) {
        return {
          success: false,
          importedCount: 0,
          failedCount: 0,
          errors: ['CSV must have a URL column'],
          articles: [],
        };
      }

      const articles: Article[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const values = this.parseCsvLine(line);
          const url = values[urlIndex];
          const title = titleIndex >= 0 ? values[titleIndex] : url;

          if (url) {
            const now = new Date().toISOString();
            articles.push({
              id: generateId(),
              url,
              title: title || 'Untitled',
              content: '',
              savedAt: now,
              updatedAt: now,
              readingProgress: 0,
              estimatedReadTime: 0,
              wordCount: 0,
              isArchived: false,
              isFavorite: false,
              tagIds: [],
              highlights: [],
              status: 'unread',
              source: 'instapaper',
              syncStatus: 'local',
            });
          }
        } catch (error) {
          errors.push(`Error on line ${i + 1}: ${error}`);
        }
      }

      return {
        success: true,
        importedCount: articles.length,
        failedCount: errors.length,
        errors,
        articles,
      };
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        failedCount: 0,
        errors: [`Error reading file: ${error}`],
        articles: [],
      };
    }
  }

  // Import from Pocket HTML export
  async importPocketHtml(): Promise<ImportResult> {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/html',
    });

    if (result.canceled || !result.assets?.[0]) {
      return {
        success: false,
        importedCount: 0,
        failedCount: 0,
        errors: ['Import cancelled'],
        articles: [],
      };
    }

    try {
      const content = await readAsStringAsync(result.assets[0].uri);
      const articles: Article[] = [];

      // Parse HTML bookmarks (Pocket export format)
      const linkRegex = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
      let match;

      while ((match = linkRegex.exec(content)) !== null) {
        const url = match[1];
        const title = match[2];
        const now = new Date().toISOString();

        articles.push({
          id: generateId(),
          url,
          title: title || 'Untitled',
          content: '',
          savedAt: now,
          updatedAt: now,
          readingProgress: 0,
          estimatedReadTime: 0,
          wordCount: 0,
          isArchived: false,
          isFavorite: false,
          tagIds: [],
          highlights: [],
          status: 'unread',
          source: 'pocket',
          syncStatus: 'local',
        });
      }

      return {
        success: true,
        importedCount: articles.length,
        failedCount: 0,
        errors: [],
        articles,
      };
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        failedCount: 0,
        errors: [`Error reading file: ${error}`],
        articles: [],
      };
    }
  }

  // Helper: Parse CSV line handling quoted values
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  // Helper: Normalize imported articles
  private normalizeArticles(data: any[]): Article[] {
    const now = new Date().toISOString();

    return data.map(item => ({
      id: item.id || generateId(),
      url: item.url || item.link || '',
      title: item.title || item.name || 'Untitled',
      author: item.author,
      excerpt: item.excerpt || item.description || item.summary,
      content: item.content || item.body || item.text || '',
      htmlContent: item.htmlContent || item.html,
      coverImage: item.coverImage || item.image || item.thumbnail,
      siteName: item.siteName || item.site,
      publishedDate: item.publishedDate || item.published,
      savedAt: item.savedAt || item.createdAt || item.created || now,
      updatedAt: item.updatedAt || now,
      readingProgress: item.readingProgress || item.progress || 0,
      estimatedReadTime: item.estimatedReadTime || calculateReadingTime(countWords(item.content || '')),
      wordCount: item.wordCount || countWords(item.content || ''),
      isArchived: item.isArchived || item.archived || false,
      isFavorite: item.isFavorite || item.favorite || item.starred || false,
      folderId: item.folderId,
      tagIds: item.tagIds || item.tags || [],
      highlights: item.highlights || [],
      status: item.status || 'unread',
      source: item.source || 'manual',
      syncStatus: 'local',
    }));
  }
}

export const exportService = new ExportService();
