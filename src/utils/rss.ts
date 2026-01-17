import { XMLParser } from 'fast-xml-parser';
import { Article, Feed } from '../store/useStore';

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
});

// Helper to safely extract text from XML nodes
const getText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'object' && node !== null) {
        return node['#text'] || node['text'] || '';
    }
    return '';
};

export const parseRSS = async (url: string): Promise<{ feed: Feed, articles: Article[] }> => {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const xml = parser.parse(text);

        let channel = xml.rss?.channel || xml.feed; // RSS or Atom

        if (!channel) throw new Error("Invalid RSS/Atom feed");

        const feed: Feed = {
            id: url,
            url,
            title: getText(channel.title) || 'Untitled Feed',
            icon: channel.image?.url || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`
        };

        const items = channel.item || channel.entry || [];
        const articles: Article[] = (Array.isArray(items) ? items : [items]).map((item: any) => {
            // Handle various RSS/Atom formats
            const link = item.link?.['@_href'] || item.link;
            const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString();

            let contentRaw = item['content:encoded'] || item.content || item.description || '';
            const content = getText(contentRaw);

            // Basic summary extraction (strip HTML)
            const summary = content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

            return {
                id: item.guid || item.id || link,
                title: getText(item.title),
                url: link,
                summary,
                content,
                feedId: feed.id,
                publishedAt: pubDate,
                tags: [], // Populated by AI later
                readTime: Math.ceil(content.split(' ').length / 200), // Basic read time
                isRead: false,
                isSaved: false,
            };
        });

        return { feed, articles };

    } catch (error) {
        console.error(`Error parsing RSS feed ${url}:`, error);
        throw error;
    }
};
