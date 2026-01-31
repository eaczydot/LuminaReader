// Obsidian Integration Service
// Handles export to Obsidian vaults via markdown files

import {
  cacheDirectory,
  writeAsStringAsync,
  readAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Article, Highlight, ObsidianNote } from '../../types';
import { articleToMarkdown, generateId } from '../../utils/helpers';

interface ObsidianExportOptions {
  includeHighlights: boolean;
  includeTags: boolean;
  includeMetadata: boolean;
  templateFormat: 'default' | 'readwise' | 'custom';
  customTemplate?: string;
  filenameFormat: 'title' | 'title-date' | 'date-title';
  folderPath?: string;
}

const DEFAULT_TEMPLATE = `---
title: "{{title}}"
author: "{{author}}"
url: {{url}}
saved_at: {{saved_at}}
status: {{status}}
tags: {{tags}}
---

# {{title}}

{{#author}}**Author:** {{author}}{{/author}}
{{#url}}**URL:** [{{url}}]({{url}}){{/url}}

## Highlights

{{#highlights}}
> {{text}}
{{#note}}
*Note: {{note}}*
{{/note}}

{{/highlights}}

## Content

{{content}}
`;

const READWISE_TEMPLATE = `---
title: {{title}}
author: {{author}}
full-title: "{{title}}"
category: articles
url: {{url}}
document_note:
---

# {{title}}

## Metadata
- Author: {{author}}
- Full Title: {{title}}
- URL: {{url}}

## Highlights
{{#highlights}}
- {{text}} ^highlight-{{id}}
{{#note}}
    - Note: {{note}}
{{/note}}
{{/highlights}}
`;

class ObsidianService {
  private vaultPath: string | null = null;

  setVaultPath(path: string) {
    this.vaultPath = path;
  }

  // Generate markdown from article
  generateMarkdown(
    article: Article,
    options: ObsidianExportOptions = {
      includeHighlights: true,
      includeTags: true,
      includeMetadata: true,
      templateFormat: 'default',
      filenameFormat: 'title',
    }
  ): string {
    const template = this.getTemplate(options);
    return this.applyTemplate(template, article, options);
  }

  private getTemplate(options: ObsidianExportOptions): string {
    switch (options.templateFormat) {
      case 'readwise':
        return READWISE_TEMPLATE;
      case 'custom':
        return options.customTemplate || DEFAULT_TEMPLATE;
      default:
        return DEFAULT_TEMPLATE;
    }
  }

  private applyTemplate(
    template: string,
    article: Article,
    options: ObsidianExportOptions
  ): string {
    let result = template;

    // Basic replacements
    result = result.replace(/\{\{title\}\}/g, article.title || 'Untitled');
    result = result.replace(/\{\{author\}\}/g, article.author || '');
    result = result.replace(/\{\{url\}\}/g, article.url || '');
    result = result.replace(/\{\{saved_at\}\}/g, article.savedAt);
    result = result.replace(/\{\{status\}\}/g, article.status);
    result = result.replace(/\{\{content\}\}/g, article.content || '');

    // Tags
    if (options.includeTags && article.tagIds.length > 0) {
      result = result.replace(
        /\{\{tags\}\}/g,
        article.tagIds.map((t) => `#${t}`).join(' ')
      );
    } else {
      result = result.replace(/\{\{tags\}\}/g, '');
    }

    // Highlights section
    if (options.includeHighlights && article.highlights.length > 0) {
      const highlightsSection = article.highlights
        .map((h) => {
          let highlightText = `> ${h.text}`;
          if (h.note) {
            highlightText += `\n*Note: ${h.note}*`;
          }
          return highlightText;
        })
        .join('\n\n');

      // Handle mustache-style sections
      result = result.replace(
        /\{\{#highlights\}\}[\s\S]*?\{\{\/highlights\}\}/g,
        highlightsSection
      );
    } else {
      result = result.replace(
        /\{\{#highlights\}\}[\s\S]*?\{\{\/highlights\}\}/g,
        ''
      );
    }

    // Handle conditional sections
    result = result.replace(/\{\{#author\}\}([\s\S]*?)\{\{\/author\}\}/g,
      article.author ? '$1' : '');
    result = result.replace(/\{\{#url\}\}([\s\S]*?)\{\{\/url\}\}/g,
      article.url ? '$1' : '');

    // Clean up empty lines
    result = result.replace(/\n{3,}/g, '\n\n');

    return result;
  }

  // Generate filename
  generateFilename(article: Article, format: 'title' | 'title-date' | 'date-title'): string {
    const sanitizedTitle = this.sanitizeFilename(article.title || 'Untitled');
    const date = new Date(article.savedAt).toISOString().split('T')[0];

    switch (format) {
      case 'title-date':
        return `${sanitizedTitle} - ${date}.md`;
      case 'date-title':
        return `${date} - ${sanitizedTitle}.md`;
      default:
        return `${sanitizedTitle}.md`;
    }
  }

  private sanitizeFilename(name: string): string {
    return name
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
  }

  // Export single article
  async exportArticle(
    article: Article,
    options?: ObsidianExportOptions
  ): Promise<string> {
    const markdown = this.generateMarkdown(article, options);
    const filename = this.generateFilename(
      article,
      options?.filenameFormat || 'title'
    );

    const filePath = `${cacheDirectory}${filename}`;
    await writeAsStringAsync(filePath, markdown, {
      encoding: EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/markdown',
        dialogTitle: `Export to Obsidian: ${article.title}`,
        UTI: 'net.daringfireball.markdown',
      });
    }

    return filePath;
  }

  // Export multiple articles as a zip or individually
  async exportArticles(
    articles: Article[],
    options?: ObsidianExportOptions
  ): Promise<string[]> {
    const filePaths: string[] = [];

    for (const article of articles) {
      const filePath = await this.exportArticle(article, options);
      filePaths.push(filePath);
    }

    return filePaths;
  }

  // Export highlights only
  async exportHighlights(
    highlights: { highlight: Highlight; article: Article }[],
    options?: { groupByArticle: boolean }
  ): Promise<string> {
    let markdown = '# Highlights\n\n';

    if (options?.groupByArticle) {
      const groupedHighlights = this.groupHighlightsByArticle(highlights);

      for (const [articleTitle, articleHighlights] of Object.entries(groupedHighlights)) {
        markdown += `## ${articleTitle}\n\n`;

        for (const { highlight, article } of articleHighlights) {
          markdown += `> ${highlight.text}\n`;
          if (highlight.note) {
            markdown += `*Note: ${highlight.note}*\n`;
          }
          markdown += `— [${article.title}](${article.url || ''})\n\n`;
        }
      }
    } else {
      for (const { highlight, article } of highlights) {
        markdown += `> ${highlight.text}\n`;
        if (highlight.note) {
          markdown += `*Note: ${highlight.note}*\n`;
        }
        markdown += `— [${article.title}](${article.url || ''})\n\n`;
      }
    }

    const filename = `highlights-${new Date().toISOString().split('T')[0]}.md`;
    const filePath = `${cacheDirectory}${filename}`;

    await writeAsStringAsync(filePath, markdown, {
      encoding: EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/markdown',
        dialogTitle: 'Export Highlights to Obsidian',
        UTI: 'net.daringfireball.markdown',
      });
    }

    return filePath;
  }

  private groupHighlightsByArticle(
    highlights: { highlight: Highlight; article: Article }[]
  ): Record<string, { highlight: Highlight; article: Article }[]> {
    return highlights.reduce((acc, item) => {
      const key = item.article.title;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, { highlight: Highlight; article: Article }[]>);
  }

  // Import from markdown files
  async importFromMarkdown(): Promise<ObsidianNote[]> {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/markdown', 'text/plain'],
      multiple: true,
    });

    if (result.canceled) {
      return [];
    }

    const notes: ObsidianNote[] = [];

    for (const file of result.assets) {
      try {
        const content = await readAsStringAsync(file.uri);
        const note = this.parseMarkdownNote(content, file.name);
        notes.push(note);
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
      }
    }

    return notes;
  }

  private parseMarkdownNote(content: string, filename: string): ObsidianNote {
    const frontmatter = this.extractFrontmatter(content);
    const body = this.extractBody(content);
    const tags = this.extractTags(content);

    return {
      title: frontmatter.title || filename.replace('.md', ''),
      content: body,
      path: filename,
      tags,
      frontmatter,
    };
  }

  private extractFrontmatter(content: string): Record<string, any> {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const frontmatter: Record<string, any> = {};
    const lines = match[1].split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        frontmatter[key] = value;
      }
    }

    return frontmatter;
  }

  private extractBody(content: string): string {
    return content.replace(/^---\n[\s\S]*?\n---\n*/, '').trim();
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];

    // Extract inline tags (#tag)
    const inlineTags = content.match(/#[\w-]+/g);
    if (inlineTags) {
      tags.push(...inlineTags.map((t) => t.slice(1)));
    }

    return [...new Set(tags)];
  }

  // Convert ObsidianNote to Article
  noteToArticle(note: ObsidianNote): Partial<Article> {
    const wordCount = note.content.split(/\s+/).length;

    return {
      title: note.title,
      url: note.frontmatter.url || '',
      author: note.frontmatter.author || '',
      content: note.content,
      wordCount,
      estimatedReadTime: Math.ceil(wordCount / 200),
      source: 'obsidian',
    };
  }
}

export const obsidianService = new ObsidianService();
