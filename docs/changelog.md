# Changelog

## v0.1.0 - MVP (2026-03-16)

### Added
- Full-stack Next.js 16 application with TypeScript and Tailwind CSS v4
- Supabase PostgreSQL database with PostGIS extension for spatial queries
- 163 Hong Kong hiking trails seeded with coordinates, difficulty, length, and metadata
- Natural language search powered by Google Gemini 2.0 Flash intent extraction
- HK Observatory weather integration (current conditions, 9-day forecast, warnings)
- Local gazetteer with ~85 Hong Kong locations for fast geocoding
- Nominatim fallback geocoder for locations not in gazetteer
- In-memory cache layer with TTL support (search: 1h, geo: 24h, weather: 6h)
- PostGIS spatial queries with ST_DWithin radius search and distance calculation
- Responsive frontend with search bar, date picker, weather banner, trail cards
- Difficulty-coded badges (Easy/green, Moderate/amber, Difficult/red)
- Intent extraction badges showing parsed search parameters
- "View Location" links to Google Maps, "Official Website" links to hiking.gov.hk
- Health check endpoint at /api/health
- Netlify deployment configuration
- Sage green pastel color theme
