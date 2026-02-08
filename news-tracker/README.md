# AI News Tracker

A web application that tracks and displays the latest AI news specifically related to architecture and interior design. Built with vanilla JavaScript, featuring RSS feed integration, category filtering, and favorites functionality.

## Features

- **RSS Feed Integration**: Automatically fetches news from multiple architecture and design publications
- **Smart Categorization**: AI-powered auto-categorization of articles into relevant topics
- **Category Filters**: Filter news by AI Design Tools, Visualization, Automation, Architecture AI, Interior Design, and more
- **Favorites System**: Save articles for later reading with localStorage persistence
- **Responsive Design**: Mobile-friendly layout that works on all devices
- **Dark Theme**: Professional dark mode interface matching DLO Creative Lab branding
- **Caching**: 1-hour cache to improve performance and reduce API calls

## News Sources

The app aggregates news from the following sources:
- **ArchDaily** - Architecture news and projects
- **Dezeen** - Architecture and design magazine
- **Architizer** - Architecture industry insights
- **TestFit Blog** - AI and technology for architects

## Categories

Articles are automatically categorized into:
- **AI Design Tools** - Midjourney, DALL-E, Stable Diffusion, and other generative AI tools
- **Visualization** - 3D rendering, CGI, and architectural visualization
- **Automation** - Workflow automation and productivity tools
- **Architecture AI** - BIM, parametric design, computational design
- **Interior Design AI** - Space planning, furniture design, interior visualization
- **Industry News** - General technology and business news

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **RSS Proxy**: RSS2JSON API (https://rss2json.com)
- **Storage**: localStorage for caching and favorites
- **Design**: Dark theme with red accents (#ef233c)

## File Structure

```
news-tracker/
├── index.html       # Main HTML structure
├── styles.css       # Dark theme styling
├── script.js        # Main application logic
├── rss-proxy.js     # RSS feed fetching and parsing
├── storage.js       # localStorage management
├── filters.js       # Categorization and filtering logic
└── README.md        # This file
```

## How It Works

### 1. RSS Feed Fetching
- Uses RSS2JSON API to bypass CORS restrictions
- Fetches multiple RSS feeds in parallel
- Normalizes article data to consistent format
- Deduplicates articles by URL

### 2. Auto-Categorization
- Analyzes article titles and descriptions
- Matches keywords to predefined categories
- Assigns most relevant category to each article
- Falls back to "Industry News" for uncategorized content

### 3. Favorites System
- Uses localStorage with `newsTracker_` prefix
- Stores only article IDs (not full content)
- Persists across browser sessions
- Syncs with article display in real-time

### 4. Caching
- Articles cached for 1 hour in localStorage
- Reduces API calls and improves performance
- Automatically expires and refetches when needed
- Falls back to live fetch if cache is unavailable

## Usage

1. **View All News**: Default view shows all articles from all categories
2. **Filter by Category**: Click category buttons to filter articles
3. **Save Favorites**: Click the star icon (☆) to save an article
4. **View Favorites**: Click "⭐ Favorites" filter to see saved articles
5. **Read Article**: Click "Read Full Article →" to open the original source

## localStorage Keys

The app uses the following localStorage keys:
- `newsTracker_favorites` - Array of saved article IDs
- `newsTracker_cache` - Cached articles with expiration timestamp
- `newsTracker_preferences` - User preferences and last visit date

## Performance

- **Initial Load**: ~2-3 seconds (fetching RSS feeds)
- **Cached Load**: ~100-200ms (using localStorage cache)
- **Category Filter**: Instant (client-side filtering)
- **Favorites Toggle**: Instant (localStorage write)

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires modern browser with support for:
- ES6 JavaScript (arrow functions, async/await, etc.)
- CSS Grid and Flexbox
- localStorage API
- Fetch API

## API Limits

RSS2JSON free tier limits:
- **10,000 requests/day** across all users
- **Count**: 20 articles per feed
- **No API key required** for basic usage

Caching helps minimize API usage by storing results for 1 hour.

## Troubleshooting

### No articles loading
- Check browser console for errors
- Verify internet connection
- Try refreshing the page (may be temporary RSS2JSON issue)
- Clear cache: Open DevTools → Application → localStorage → Delete `newsTracker_cache`

### Favorites not saving
- Check if localStorage is enabled in browser
- Verify browser isn't in Private/Incognito mode
- Check available localStorage quota

### Articles not categorizing correctly
- Categories are based on keyword matching
- Some articles may be mis-categorized if keywords overlap
- "Industry News" is the default fallback category

## Future Enhancements

Planned features for future versions:
- Search functionality across titles and descriptions
- Article thumbnails with lazy loading
- Date range filters (Last 24h, Week, Month)
- Custom RSS feed management
- Export favorites to CSV
- PWA features for offline access
- AI-powered article summarization
- Email digest notifications

## License

Built for DLO Creative Lab © 2026

## Links

- [Main Landing Page](../index.html)
- [DLO Creative Lab Website](https://www.dlocreativelab.com/)
- [LinkedIn](https://www.linkedin.com/in/danny-loza/)

---

Built with ❤️ using Claude Code
