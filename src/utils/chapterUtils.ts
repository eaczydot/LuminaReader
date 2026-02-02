// Chapter detection and Karpathy reading principles utilities

import { Chapter, ReadingPassProgress, Article } from '../types';
import { generateId } from './helpers';

/**
 * Detect chapters from article content based on various heading patterns
 * Supports:
 * - Markdown headers (# Header, ## Header, etc.)
 * - Common chapter patterns (Chapter 1, CHAPTER I, Chapter One, etc.)
 * - Numbered sections (1. Introduction, 1.1 Overview, etc.)
 */
export const detectChapters = (content: string): Chapter[] => {
  const chapters: Chapter[] = [];
  const lines = content.split('\n');

  let currentOffset = 0;
  const chapterPatterns = [
    // Markdown headers (# Header, ## Header, etc.)
    /^(#{1,6})\s+(.+)$/,
    // Chapter patterns: Chapter 1, CHAPTER I, Chapter One, etc.
    /^(Chapter|CHAPTER|Ch\.|ch\.)\s+([IVXLCDM0-9]+|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)[\s:.-](.*)$/i,
    // Numbered sections: 1. Title, 1.1 Title, etc.
    /^(\d+\.(?:\d+\.)*)\s+(.+)$/,
    // ALL CAPS titles (minimum 3 words)
    /^([A-Z][A-Z\s]{10,})$/,
  ];

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    for (const pattern of chapterPatterns) {
      const match = trimmedLine.match(pattern);

      if (match) {
        let title = '';
        let level = 1;

        if (pattern === chapterPatterns[0]) {
          // Markdown header
          level = match[1].length;
          title = match[2].trim();
        } else if (pattern === chapterPatterns[1]) {
          // Chapter pattern
          title = match[3] ? match[3].trim() : `${match[1]} ${match[2]}`;
          if (!title) {
            title = `${match[1]} ${match[2]}`;
          }
          level = 1;
        } else if (pattern === chapterPatterns[2]) {
          // Numbered section
          level = match[1].split('.').length;
          title = match[2].trim();
        } else if (pattern === chapterPatterns[3]) {
          // ALL CAPS title
          title = match[1].trim();
          level = 1;
        }

        if (title) {
          // Close previous chapter if exists
          if (chapters.length > 0) {
            chapters[chapters.length - 1].endOffset = currentOffset;
          }

          chapters.push({
            id: generateId(),
            title,
            startOffset: currentOffset,
            endOffset: content.length, // Will be updated when next chapter is found
            level,
          });
        }

        break; // Found a match, no need to check other patterns
      }
    }

    currentOffset += line.length + 1; // +1 for newline
  });

  // If no chapters found, create a single chapter for the entire content
  if (chapters.length === 0) {
    chapters.push({
      id: generateId(),
      title: 'Full Content',
      startOffset: 0,
      endOffset: content.length,
      level: 1,
    });
  }

  return chapters;
};

/**
 * Extract chapter content from article based on chapter boundaries
 */
export const extractChapterContent = (content: string, chapter: Chapter): string => {
  return content.substring(chapter.startOffset, chapter.endOffset).trim();
};

/**
 * Get the current chapter based on reading progress or scroll position
 */
export const getCurrentChapter = (
  chapters: Chapter[],
  currentPosition: number,
  totalContentLength: number
): number => {
  if (!chapters || chapters.length === 0) return 0;

  for (let i = 0; i < chapters.length; i++) {
    if (currentPosition >= chapters[i].startOffset && currentPosition < chapters[i].endOffset) {
      return i;
    }
  }

  return chapters.length - 1; // Default to last chapter
};

/**
 * Initialize reading pass progress for a new article
 */
export const initializeReadingPassProgress = (): ReadingPassProgress => {
  return {
    manual: false,
    explain: false,
    qa: false,
  };
};

/**
 * Get the next reading pass to complete
 */
export const getNextReadingPass = (progress: ReadingPassProgress): 'manual' | 'explain' | 'qa' | null => {
  if (!progress.manual) return 'manual';
  if (!progress.explain) return 'explain';
  if (!progress.qa) return 'qa';
  return null; // All passes completed
};

/**
 * Calculate overall reading pass completion percentage
 */
export const getReadingPassCompletionPercentage = (progress: ReadingPassProgress): number => {
  const completed = [progress.manual, progress.explain, progress.qa].filter(Boolean).length;
  return Math.round((completed / 3) * 100);
};

/**
 * Generate copy templates for different reading passes
 */
export const generateCopyTemplate = (
  article: Article,
  chapter: Chapter | null,
  passType: 'manual' | 'explain' | 'qa'
): string => {
  const chapterContent = chapter
    ? extractChapterContent(article.content, chapter)
    : article.content;

  const chapterTitle = chapter ? chapter.title : article.title;

  switch (passType) {
    case 'manual':
      // Simple copy for manual reading
      return `# ${chapterTitle}\n\n${chapterContent}`;

    case 'explain':
      // Template for explain/summarize pass
      return `I'm reading "${article.title}"${chapter ? ` - ${chapterTitle}` : ''}. Please help me understand this better by:\n\n1. Explaining the main concepts\n2. Summarizing the key points\n3. Clarifying any complex ideas\n\n---\n\n${chapterContent}\n\n---\n\nPlease provide a clear explanation and summary.`;

    case 'qa':
      // Template for Q&A pass
      return `I've read "${article.title}"${chapter ? ` - ${chapterTitle}` : ''} and would like to deepen my understanding through questions and answers.\n\nContent:\n\n---\n\n${chapterContent}\n\n---\n\nPlease:\n1. Generate thoughtful questions about this content\n2. Help me explore the implications and connections\n3. Test my understanding of key concepts\n\nWhat questions should I be asking about this material?`;

    default:
      return chapterContent;
  }
};

/**
 * Get reading pass display name
 */
export const getReadingPassDisplayName = (pass: 'manual' | 'explain' | 'qa'): string => {
  switch (pass) {
    case 'manual':
      return 'Pass 1: Manual Reading';
    case 'explain':
      return 'Pass 2: Explain & Summarize';
    case 'qa':
      return 'Pass 3: Q&A';
  }
};

/**
 * Get reading pass description
 */
export const getReadingPassDescription = (pass: 'manual' | 'explain' | 'qa'): string => {
  switch (pass) {
    case 'manual':
      return 'Read through the content at your own pace';
    case 'explain':
      return 'Use an LLM to explain and summarize key concepts';
    case 'qa':
      return 'Deepen understanding through questions and answers';
  }
};

/**
 * Get reading pass emoji
 */
export const getReadingPassEmoji = (pass: 'manual' | 'explain' | 'qa'): string => {
  switch (pass) {
    case 'manual':
      return '📖';
    case 'explain':
      return '💡';
    case 'qa':
      return '🎯';
  }
};

/**
 * Format chapter title for display
 */
export const formatChapterTitle = (chapter: Chapter, index: number): string => {
  // If the title already includes "Chapter", just return it
  if (/^(chapter|ch\.)/i.test(chapter.title)) {
    return chapter.title;
  }

  // Otherwise, prefix with chapter number
  return `Chapter ${index + 1}: ${chapter.title}`;
};

/**
 * Get estimated reading time for a chapter
 */
export const getChapterReadingTime = (content: string, wordsPerMinute = 200): number => {
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  return Math.ceil(wordCount / wordsPerMinute);
};
