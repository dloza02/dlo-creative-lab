// localStorage management for AI News Tracker
// All keys are prefixed with 'newsTracker_' to avoid conflicts

const STORAGE_PREFIX = 'newsTracker_';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Favorites Management
function saveFavorite(articleId) {
    try {
        const favorites = getFavorites();
        if (!favorites.find(f => f.id === articleId)) {
            favorites.push({
                id: articleId,
                savedAt: new Date().toISOString()
            });
            localStorage.setItem(
                `${STORAGE_PREFIX}favorites`,
                JSON.stringify(favorites)
            );
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error saving favorite:', error);
        return false;
    }
}

function removeFavorite(articleId) {
    try {
        let favorites = getFavorites();
        favorites = favorites.filter(f => f.id !== articleId);
        localStorage.setItem(
            `${STORAGE_PREFIX}favorites`,
            JSON.stringify(favorites)
        );
        return true;
    } catch (error) {
        console.error('Error removing favorite:', error);
        return false;
    }
}

function getFavorites() {
    try {
        const data = localStorage.getItem(`${STORAGE_PREFIX}favorites`);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading favorites:', error);
        return [];
    }
}

function isFavorite(articleId) {
    const favorites = getFavorites();
    return favorites.some(f => f.id === articleId);
}

function clearFavorites() {
    try {
        localStorage.removeItem(`${STORAGE_PREFIX}favorites`);
        return true;
    } catch (error) {
        console.error('Error clearing favorites:', error);
        return false;
    }
}

// Article Cache Management
function cacheArticles(articles) {
    try {
        const cacheData = {
            timestamp: new Date().getTime(),
            articles: articles,
            expiresAt: new Date().getTime() + CACHE_DURATION
        };
        localStorage.setItem(
            `${STORAGE_PREFIX}cache`,
            JSON.stringify(cacheData)
        );
        return true;
    } catch (error) {
        console.error('Error caching articles:', error);
        // If quota exceeded, clear cache and try again
        if (error.name === 'QuotaExceededError') {
            clearCache();
        }
        return false;
    }
}

function getCachedArticles() {
    try {
        const data = localStorage.getItem(`${STORAGE_PREFIX}cache`);
        if (!data) return null;

        const cacheData = JSON.parse(data);
        const now = new Date().getTime();

        // Check if cache is still valid
        if (now < cacheData.expiresAt) {
            console.log('Using cached articles');
            return cacheData.articles;
        } else {
            console.log('Cache expired');
            clearCache();
            return null;
        }
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

function clearCache() {
    try {
        localStorage.removeItem(`${STORAGE_PREFIX}cache`);
        return true;
    } catch (error) {
        console.error('Error clearing cache:', error);
        return false;
    }
}

// Preferences Management
function savePreferences(preferences) {
    try {
        localStorage.setItem(
            `${STORAGE_PREFIX}preferences`,
            JSON.stringify(preferences)
        );
        return true;
    } catch (error) {
        console.error('Error saving preferences:', error);
        return false;
    }
}

function getPreferences() {
    try {
        const data = localStorage.getItem(`${STORAGE_PREFIX}preferences`);
        return data ? JSON.parse(data) : {
            lastVisit: null,
            selectedCategory: 'all'
        };
    } catch (error) {
        console.error('Error reading preferences:', error);
        return {
            lastVisit: null,
            selectedCategory: 'all'
        };
    }
}

// Update last visit timestamp
function updateLastVisit() {
    const preferences = getPreferences();
    preferences.lastVisit = new Date().toISOString();
    savePreferences(preferences);
}

// Clear all app data
function clearAllData() {
    try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        console.log('All app data cleared');
        return true;
    } catch (error) {
        console.error('Error clearing all data:', error);
        return false;
    }
}

console.log('📦 Storage module loaded');
