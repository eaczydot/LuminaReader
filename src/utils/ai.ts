import { Article } from '../store/useStore';

const CATEGORIES = ['Technology', 'Design', 'Science', 'Culture', 'Business', 'AI'];

export const mockAIProcessArticle = async (article: Article): Promise<Partial<Article>> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Determine categories based on title/content keywords
    const text = (article.title + ' ' + (article.summary || '')).toLowerCase();
    const foundTags = CATEGORIES.filter(cat => text.includes(cat.toLowerCase()));

    if (foundTags.length === 0) {
        foundTags.push('Uncategorized');
    }

    // Generate a mock summary if not present or improve it
    const summary = article.summary || "This article explores key developments in " + (foundTags[0] || "this field") + ".";

    return {
        tags: foundTags,
        summary: summary,
    };
};

export const getSmartLinks = (article: Article) => {
    // Return mock "Related" links/context
    return [
        { title: 'Related: The Evolution of Design Systems', url: 'https://example.com/1' },
        { title: 'Context: Why RSVP Reading Works', url: 'https://example.com/2' },
    ];
};
