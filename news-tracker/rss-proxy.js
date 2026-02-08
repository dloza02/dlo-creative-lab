// RSS feed fetching and parsing for AI News Tracker
// Uses RSS2JSON API to bypass CORS restrictions

const RSS_FEEDS = [
    'https://www.archdaily.com/feed',
    'https://www.dezeen.com/feed/',
    'https://architizer.com/blog/feed/',
    'https://blog.testfit.io/feed'
];

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

// Fetch all RSS feeds
async function loadFeeds() {
    // Check cache first
    const cachedArticles = getCachedArticles();
    if (cachedArticles && cachedArticles.length > 0) {
        console.log(`📰 Using ${cachedArticles.length} cached articles`);
        return cachedArticles;
    }

    console.log('🌐 Fetching RSS feeds...');

    try {
        // Fetch all feeds in parallel
        const feedPromises = RSS_FEEDS.map(url => fetchFeed(url));
        const results = await Promise.allSettled(feedPromises);

        // Process results
        const articles = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                articles.push(...result.value);
                console.log(`✅ Feed ${index + 1} loaded: ${result.value.length} articles`);
            } else {
                console.warn(`❌ Feed ${index + 1} failed:`, RSS_FEEDS[index]);
            }
        });

        if (articles.length === 0) {
            console.warn('⚠️ No articles loaded from RSS feeds, using mock data...');
            return getMockArticles();
        }

        // Normalize, deduplicate, categorize, and filter AI-related only
        const processedArticles = articles
            .map(normalizeArticle)
            .filter((article, index, self) =>
                // Deduplicate by URL
                index === self.findIndex(a => a.link === article.link)
            )
            .map(categorizeArticle)
            .filter(article => article !== null) // Remove non-AI articles
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)); // Sort by date, newest first

        console.log(`🤖 AI-related articles: ${processedArticles.length}`);

        console.log(`📦 Total unique articles: ${processedArticles.length}`);

        // Cache the results
        cacheArticles(processedArticles);

        return processedArticles;

    } catch (error) {
        console.error('Error loading feeds:', error);
        throw error;
    }
}

// Fetch a single RSS feed through RSS2JSON proxy with AllOrigins fallback
async function fetchFeed(rssUrl) {
    // Try RSS2JSON first
    try {
        const proxyUrl = `${RSS2JSON_API}?rss_url=${encodeURIComponent(rssUrl)}&count=20`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(`RSS2JSON error: ${data.message || 'Unknown error'}`);
        }

        return data.items || [];

    } catch (error) {
        console.warn(`RSS2JSON failed for ${rssUrl}, trying AllOrigins...`);

        // Fallback to AllOrigins proxy
        try {
            const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
            const response = await fetch(allOriginsUrl);

            if (!response.ok) {
                throw new Error(`AllOrigins HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const xmlText = data.contents;

            // Parse XML to extract articles
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            return parseXMLFeed(xmlDoc);

        } catch (allOriginsError) {
            console.error(`Both proxies failed for ${rssUrl}:`, allOriginsError);
            return null;
        }
    }
}

// Parse XML feed (RSS 2.0 or Atom)
function parseXMLFeed(xmlDoc) {
    const items = [];

    // Try RSS 2.0 format first
    const rssItems = xmlDoc.querySelectorAll('item');
    if (rssItems.length > 0) {
        rssItems.forEach(item => {
            items.push({
                title: item.querySelector('title')?.textContent || 'Untitled',
                description: item.querySelector('description')?.textContent || '',
                link: item.querySelector('link')?.textContent || '',
                pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
                guid: item.querySelector('guid')?.textContent || ''
            });
        });
        return items;
    }

    // Try Atom format
    const atomEntries = xmlDoc.querySelectorAll('entry');
    if (atomEntries.length > 0) {
        atomEntries.forEach(entry => {
            items.push({
                title: entry.querySelector('title')?.textContent || 'Untitled',
                description: entry.querySelector('summary')?.textContent || entry.querySelector('content')?.textContent || '',
                link: entry.querySelector('link')?.getAttribute('href') || '',
                pubDate: entry.querySelector('published')?.textContent || entry.querySelector('updated')?.textContent || new Date().toISOString(),
                guid: entry.querySelector('id')?.textContent || ''
            });
        });
        return items;
    }

    return [];
}

// Normalize article data to consistent format
function normalizeArticle(rawArticle) {
    // Generate unique ID from URL
    const id = generateArticleId(rawArticle.link || rawArticle.guid || '');

    return {
        id: id,
        title: rawArticle.title || 'Untitled',
        description: cleanDescription(rawArticle.description || rawArticle.content || ''),
        link: rawArticle.link || rawArticle.guid || '#',
        pubDate: rawArticle.pubDate || new Date().toISOString(),
        source: extractSource(rawArticle.link || ''),
        category: 'industry-news', // Will be updated by categorizeArticle()
        isFavorite: false
    };
}

// Generate a unique ID from URL
function generateArticleId(url) {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return 'article-' + Math.abs(hash).toString(36);
}

// Clean HTML from description and truncate
function cleanDescription(html) {
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    const decoded = textarea.value;

    // Truncate to reasonable length
    const maxLength = 200;
    if (decoded.length > maxLength) {
        return decoded.substring(0, maxLength) + '...';
    }

    return decoded || 'No description available.';
}

// Extract source name from URL
function extractSource(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');

        // Capitalize first letter of each word
        return hostname.split('.')[0]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    } catch (error) {
        return 'Unknown Source';
    }
}

// Format date to readable string
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    } catch (error) {
        return 'Unknown date';
    }
}

// Mock data for testing/fallback when RSS feeds fail
function getMockArticles() {
    return [
        {
            id: 'mock-1',
            title: 'AI-Powered Parametric Design: The Future of Architecture',
            description: 'Explore how artificial intelligence is revolutionizing parametric design workflows, enabling architects to generate complex, optimized structures in seconds.',
            link: 'https://www.archdaily.com',
            pubDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            source: 'ArchDaily',
            category: 'architecture-ai',
            isFavorite: false
        },
        {
            id: 'mock-2',
            title: 'Midjourney 7 Released: Game-Changing Features for Architects',
            description: 'The latest version of Midjourney introduces architectural accuracy improvements and better control over spatial relationships, making it an essential tool for concept visualization.',
            link: 'https://www.dezeen.com',
            pubDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            source: 'Dezeen',
            category: 'ai-design-tools',
            isFavorite: false
        },
        {
            id: 'mock-3',
            title: 'Real-Time Rendering with AI: Enscape vs Lumion AI',
            description: 'A comprehensive comparison of AI-enhanced real-time rendering tools that are transforming architectural visualization workflows.',
            link: 'https://architizer.com',
            pubDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            source: 'Architizer',
            category: 'visualization',
            isFavorite: false
        },
        {
            id: 'mock-4',
            title: 'Automating BIM Workflows: AI Agents for Revit',
            description: 'Learn how custom AI agents are streamlining repetitive tasks in Revit, saving architectural firms thousands of hours annually.',
            link: 'https://blog.testfit.io',
            pubDate: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
            source: 'TestFit',
            category: 'automation',
            isFavorite: false
        },
        {
            id: 'mock-5',
            title: 'Interior Design AI: Transform Spaces with Machine Learning',
            description: 'AI-powered interior design tools are enabling designers to generate photorealistic room layouts and furniture arrangements in minutes.',
            link: 'https://www.dezeen.com',
            pubDate: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
            source: 'Dezeen',
            category: 'interior-design-ai',
            isFavorite: false
        },
        {
            id: 'mock-6',
            title: 'Stable Diffusion for Architecture: Complete Guide',
            description: 'Master Stable Diffusion for architectural visualization with this comprehensive guide covering prompts, models, and best practices.',
            link: 'https://www.archdaily.com',
            pubDate: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
            source: 'ArchDaily',
            category: 'ai-design-tools',
            isFavorite: false
        },
        {
            id: 'mock-7',
            title: 'AI in Construction: From Design to Built Reality',
            description: 'How artificial intelligence is bridging the gap between architectural design and construction, improving accuracy and reducing costs.',
            link: 'https://architizer.com',
            pubDate: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
            source: 'Architizer',
            category: 'industry-news',
            isFavorite: false
        },
        {
            id: 'mock-8',
            title: 'Generative AI Reshaping Architectural Visualization',
            description: 'Generative AI is not replacing architects—it\'s empowering them to explore more design iterations and create stunning visualizations faster than ever.',
            link: 'https://www.techtimes.com',
            pubDate: new Date(Date.now() - 691200000).toISOString(), // 8 days ago
            source: 'Tech Times',
            category: 'visualization',
            isFavorite: false
        }
    ];
}

console.log('📡 RSS Proxy module loaded');
