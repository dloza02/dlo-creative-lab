// Main application logic for AI News Tracker

// Global state
let allArticles = [];
let displayedArticles = [];
let currentFilter = 'all';

// DOM elements
const newsGrid = document.getElementById('news-grid');
const loadingSection = document.getElementById('loading-section');
const errorSection = document.getElementById('error-section');
const emptySection = document.getElementById('empty-section');
const emptyMessageText = document.getElementById('empty-message-text');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize app on page load
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log('🚀 Initializing AI News Tracker...');

    // Update last visit
    updateLastVisit();

    // Show loading state
    showLoadingState();

    try {
        // Load RSS feeds
        allArticles = await loadFeeds();

        // Mark favorites
        const favorites = getFavorites();
        allArticles.forEach(article => {
            article.isFavorite = favorites.some(f => f.id === article.id);
        });

        // Set initial display
        displayedArticles = allArticles;

        // Set up filter buttons
        initializeFilters();

        // Render news grid
        renderNewsGrid();

        // Hide loading state
        hideLoadingState();

        console.log(`✅ App initialized with ${allArticles.length} articles`);

    } catch (error) {
        console.error('Error initializing app:', error);
        showErrorState();
    }
}

// Initialize filter buttons
function initializeFilters() {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            applyFilter(category);
        });
    });
}

// Apply filter and update display
function applyFilter(categoryId) {
    currentFilter = categoryId;

    // Update displayed articles
    displayedArticles = filterArticles(allArticles, categoryId);

    // Update active button
    filterButtons.forEach(btn => {
        if (btn.dataset.category === categoryId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Render updated grid
    renderNewsGrid();

    console.log(`Filter applied: ${categoryId} (${displayedArticles.length} articles)`);
}

// Render news grid
function renderNewsGrid() {
    newsGrid.innerHTML = '';

    if (displayedArticles.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    displayedArticles.forEach((article, index) => {
        const card = createNewsCard(article, index);
        newsGrid.appendChild(card);
    });
}

// Create a news card element
function createNewsCard(article, index) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.setAttribute('data-category', article.category);
    card.style.animationDelay = `${index * 0.05}s`;

    const categoryName = getCategoryName(article.category);
    const formattedDate = formatDate(article.pubDate);
    const favoriteClass = article.isFavorite ? 'active' : '';

    card.innerHTML = `
        <div class="news-header">
            <span class="news-category">${categoryName}</span>
            <button class="favorite-btn ${favoriteClass}"
                    data-article-id="${article.id}"
                    aria-label="${article.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                ${article.isFavorite ? '⭐' : '☆'}
            </button>
        </div>
        <h3 class="news-title">${escapeHtml(article.title)}</h3>
        <div class="news-meta">
            <span class="news-source">${escapeHtml(article.source)}</span>
            <span class="news-date">${formattedDate}</span>
        </div>
        <p class="news-excerpt">${escapeHtml(article.description)}</p>
        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="news-link">
            Read Full Article →
        </a>
    `;

    // Add favorite button click handler
    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', () => toggleFavorite(article.id, favoriteBtn));

    return card;
}

// Toggle favorite status
function toggleFavorite(articleId, button) {
    const article = allArticles.find(a => a.id === articleId);
    if (!article) return;

    if (article.isFavorite) {
        // Remove from favorites
        if (removeFavorite(articleId)) {
            article.isFavorite = false;
            button.classList.remove('active');
            button.textContent = '☆';
            button.setAttribute('aria-label', 'Add to favorites');

            // If we're on favorites view, re-render
            if (currentFilter === 'favorites') {
                applyFilter('favorites');
            }
        }
    } else {
        // Add to favorites
        if (saveFavorite(articleId)) {
            article.isFavorite = true;
            button.classList.add('active');
            button.textContent = '⭐';
            button.setAttribute('aria-label', 'Remove from favorites');
        }
    }
}

// Show loading state
function showLoadingState() {
    loadingSection.classList.remove('hidden');
    errorSection.classList.add('hidden');
    emptySection.classList.add('hidden');
    newsGrid.parentElement.style.display = 'none';
}

// Hide loading state
function hideLoadingState() {
    loadingSection.classList.add('hidden');
    newsGrid.parentElement.style.display = 'block';
}

// Show error state
function showErrorState() {
    loadingSection.classList.add('hidden');
    errorSection.classList.remove('hidden');
    emptySection.classList.add('hidden');
    newsGrid.parentElement.style.display = 'none';
}

// Show empty state
function showEmptyState() {
    emptySection.classList.remove('hidden');
    newsGrid.parentElement.style.display = 'none';

    // Customize message based on filter
    if (currentFilter === 'favorites') {
        emptyMessageText.textContent = 'You haven\'t saved any favorites yet. Click the star icon on articles to save them here.';
    } else {
        emptyMessageText.textContent = 'No articles found for this category. Try selecting a different filter or check back later for new content.';
    }
}

// Hide empty state
function hideEmptyState() {
    emptySection.classList.add('hidden');
    newsGrid.parentElement.style.display = 'block';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Smooth scroll to top when filter changes
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

console.log('✨ Main app script loaded');
