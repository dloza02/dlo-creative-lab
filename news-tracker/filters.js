// Categorization and filtering logic for AI News Tracker

// Category definitions with keywords for auto-categorization
const CATEGORIES = {
    'all': {
        name: 'All News',
        keywords: []
    },
    'ai-design-tools': {
        name: 'AI Design Tools',
        keywords: [
            'midjourney', 'dall-e', 'dall e', 'dalle', 'stable diffusion',
            'generative ai', 'ai tool', 'text to image', 'image generation',
            'ai software', 'design tool', 'firefly', 'leonardo ai'
        ]
    },
    'visualization': {
        name: 'Visualization',
        keywords: [
            'rendering', 'visualization', 'visualisation', 'vray', 'v-ray',
            '3d render', 'cgi', '3d visualization', 'lumion', 'enscape',
            'twinmotion', 'unreal engine', 'photorealistic', '3d model'
        ]
    },
    'automation': {
        name: 'Automation',
        keywords: [
            'automation', 'workflow', 'productivity', 'ai agent', 'automate',
            'efficiency', 'process automation', 'task automation', 'machine learning',
            'artificial intelligence workflow'
        ]
    },
    'architecture-ai': {
        name: 'Architecture AI',
        keywords: [
            'architecture', 'architectural design', 'building design', 'bim',
            'parametric design', 'generative design', 'computational design',
            'architect', 'building', 'construction', 'revit ai', 'grasshopper'
        ]
    },
    'interior-design-ai': {
        name: 'Interior Design AI',
        keywords: [
            'interior design', 'interior', 'furniture', 'space planning',
            'room design', 'interior ai', 'home design', 'decor',
            'interior visualization'
        ]
    },
    'industry-news': {
        name: 'Industry News',
        keywords: [
            'industry', 'market', 'business', 'technology', 'innovation',
            'news', 'announcement', 'launch', 'company', 'startup'
        ]
    },
    'favorites': {
        name: '⭐ Favorites',
        keywords: []
    }
};

// AI-related keywords that must be present for article to be relevant
const AI_KEYWORDS = [
    'ai', 'artificial intelligence', 'machine learning', 'ml',
    'generative', 'neural', 'deep learning', 'algorithm',
    'automated', 'automation', 'computational', 'intelligent',
    'midjourney', 'dall-e', 'dalle', 'stable diffusion',
    'chatgpt', 'gpt', 'llm', 'large language model'
];

// Check if article is AI-related
function isAIRelated(article) {
    const content = `${article.title} ${article.description}`.toLowerCase();
    return AI_KEYWORDS.some(keyword => content.includes(keyword.toLowerCase()));
}

// Categorize an article based on its content
function categorizeArticle(article) {
    // First check if article is AI-related
    if (!isAIRelated(article)) {
        console.log(`⚠️ Filtered out non-AI article: ${article.title}`);
        return null; // Will be filtered out
    }

    const content = `${article.title} ${article.description}`.toLowerCase();

    // Check each category's keywords (except 'all' and 'favorites')
    for (const [categoryId, categoryData] of Object.entries(CATEGORIES)) {
        if (categoryId === 'all' || categoryId === 'favorites') continue;

        // Check if any keyword matches
        const hasMatch = categoryData.keywords.some(keyword =>
            content.includes(keyword.toLowerCase())
        );

        if (hasMatch) {
            return {
                ...article,
                category: categoryId
            };
        }
    }

    // Default fallback category for AI-related articles
    return {
        ...article,
        category: 'industry-news'
    };
}

// Filter articles by category
function filterArticles(articles, categoryId) {
    if (categoryId === 'all') {
        return articles;
    }

    if (categoryId === 'favorites') {
        const favoriteIds = getFavorites().map(f => f.id);
        return articles.filter(article => favoriteIds.includes(article.id));
    }

    return articles.filter(article => article.category === categoryId);
}

// Get category display name
function getCategoryName(categoryId) {
    return CATEGORIES[categoryId]?.name || 'Unknown';
}

// Get all category IDs
function getAllCategoryIds() {
    return Object.keys(CATEGORIES);
}

// Get article count by category
function getArticleCountByCategory(articles) {
    const counts = {};

    for (const categoryId of Object.keys(CATEGORIES)) {
        if (categoryId === 'all') {
            counts[categoryId] = articles.length;
        } else if (categoryId === 'favorites') {
            const favoriteIds = getFavorites().map(f => f.id);
            counts[categoryId] = articles.filter(a => favoriteIds.includes(a.id)).length;
        } else {
            counts[categoryId] = articles.filter(a => a.category === categoryId).length;
        }
    }

    return counts;
}

// Search articles by query
function searchArticles(articles, query) {
    if (!query || query.trim() === '') {
        return articles;
    }

    const lowerQuery = query.toLowerCase().trim();

    return articles.filter(article =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.description.toLowerCase().includes(lowerQuery) ||
        article.source.toLowerCase().includes(lowerQuery)
    );
}

console.log('🔍 Filters module loaded');
