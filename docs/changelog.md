# Changelog

## v0.2.0 - Dark Botanical Redesign (2026-03-17)

### Changed
- Complete UI redesign with dark botanical theme (forest-900 background, gold accents, cream text)
- Full-viewport hero section with Sai Kung East Country Park background photo
- Animated search bar: starts centered in hero, transitions to top on search via Framer Motion layoutId
- Typewriter animated placeholder cycling through example hiking queries
- Glass-morphism search inputs with backdrop blur on dark backgrounds
- Skeleton loading cards with staggered entrance animations (replaces LoadingSpinner)
- Staggered trail card reveal animations on search results
- Sticky navbar with transparent/solid modes, logo click resets to hero
- Fonts: DM Serif Display for headings, Plus Jakarta Sans for body (replaces Geist)
- All components restyled for dark theme: TrailCard, WeatherBanner, IntentBadges, ErrorMessage
- Shimmer border animation on search form during loading

### Added
- `framer-motion` dependency for layout animations and staggered reveals
- `src/components/Navbar.tsx` - sticky navbar with transparent/solid modes
- `src/components/HeroSection.tsx` - full-viewport hero with background image
- `src/components/SkeletonCard.tsx` - pulse loading placeholder card
- `src/components/SkeletonCardList.tsx` - staggered skeleton card list
- `src/hooks/useTypewriter.ts` - typewriter animation hook for search placeholder

### Removed
- `src/components/LoadingSpinner.tsx` - replaced by SkeletonCardList
- Static header from layout.tsx - replaced by animated Navbar component
- Geist font imports

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
