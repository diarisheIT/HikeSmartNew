# Project Context: HikeSmart

## 1. Project Overview

**HikeSmart** is a natural language search engine for hiking trails in Hong Kong.
Users type conversational queries (e.g., "short hikes near HKU") into a search bar and select a date. The application extracts their intent, calculates geospatial distances, and returns the top 10 most suitable hikes with weather, trail details, and location links.

### User-Facing Workflow

1. User types a natural language query (e.g., "easy hikes under 5km near Sai Kung") and selects a date.
2. AI processes the query and finds the most suitable trails from the database.
3. Results page shows:
   - **Weather** at the top of the page (real-time from HK Observatory, tied to selected date)
   - **Top 10 trail cards** each showing: name (EN + ZH), length, difficulty, region, distance from searched location
   - **"View Location" button** per card → opens Google Maps link for that trail
   - **"Official Website" button** per card → links to the government hiking portal URL (from JSON)

---

## 2. The Core Challenge & Architecture

The raw hiking data from the Hong Kong government uses the local Hong Kong 1980 Grid System (HK80 / EPSG:2326) which stores coordinates as Eastings and Northings. Standard web APIs require WGS84 (Latitude/Longitude / EPSG:4326). Furthermore, LLMs cannot accurately perform geospatial math on the fly.

The architecture is split into an offline data pipeline and an active application layer.

### Phase 1: Offline Data Pipeline — ✅ Complete

- **Input:** Raw JSON with HK80 coordinates + "Explanatory Notes Geodetic Datums Hong Kong 1995.pdf"
- **Process:** Python script (`convert_hk80_to_wgs84.py`) using `pyproj` converts all coordinates
- **Output:** `hikesmart_processed.json` — 163 trails with WGS84 lat/lng + centroids, ready for DB seeding

### Phase 2: Application Request Lifecycle

```
User Query + Date
description: User writes a query like "hike, near HKU, long" and selects a date as a separate button
      ↓
[Cache Check] ← Redis/Vercel KV (1h TTL)
      ↓ (cache miss)
Gemini API → Extract structured intent:
  {location, difficulty, max_length, terrain_type}
      ↓
[Geocoding Cache] ← Redis (24h TTL)
      ↓ (cache miss)
Local HK Gazetteer → fuzzy match location
  → fallback: Nominatim (OpenStreetMap, free)
      ↓
PostGIS Query: ST_DWithin(radius: 10km)
  + filter by difficulty, max_length
  → top 10 trails ordered by distance
      ↓
HK Observatory Weather API [Cache 6h TTL]
      ↓
Combine: {trails[10], weather} → cache 1h
      ↓
Return to frontend
```

---

## 3. Tech Stack

| Component            | Technology                                | Rationale                                    |
| -------------------- | ----------------------------------------- | -------------------------------------------- |
| **Framework**        | Next.js 15 (App Router, React 19)         | Full-stack, SSR, API routes                  |
| **Language**         | TypeScript (strict mode)                  | Type safety for spatial + AI data            |
| **Styling**          | Tailwind CSS                              | Rapid UI development                         |
| **Database**         | Supabase (PostgreSQL + PostGIS)           | PostGIS pre-enabled, free tier sufficient    |
| **ORM**              | Drizzle ORM (raw `sql` for PostGIS)       | `ST_DWithin`, `ST_Distance` support          |
| **Geocoding**        | Local HK gazetteer + Nominatim fallback   | $0 cost, handles colloquial HK place names   |
| **Location Display** | Google Maps link (free, no API calls)     | "View Location" opens maps.google.com search |
| **AI Intent**        | Google Gemini 2.0 Flash (`@google/genai`) | Fast, cheap, structured JSON extraction      |
| **Weather**          | HK Observatory API (free, real-time)      | Official source, no cost                     |
| **Caching**          | Vercel KV (Redis)                         | Native Next.js integration, free tier        |
| **Hosting**          | Netlify                                   | Native Next.js, free tier                    |
| **Offline Script**   | Python + `pyproj`                         | ✅ Already complete                          |

### What was replaced and why

- ~~Mapbox GL JS~~ → No embedded map needed; Google Maps link on click is sufficient and free
- ~~Mapbox Geocoding API~~ → Replaced by local HK gazetteer + Nominatim ($0 vs $5/1k requests)
- ~~Google Maps Platform~~ → Only Google Maps links used (no API key required for standard map links)

---

## 4. Caching Strategy (3-Layer)

### Layer 1: Search Result Cache — 1 hour TTL

```
Key:   hash(query_string + date)
Value: {trails: [...], weather: {...}, timestamp}
```

Same query within 1 hour returns instantly without hitting any external API.

### Layer 2: Geocoding Cache — 24 hour TTL

```
Key:   "geo:{normalized_location}"  e.g. "geo:sai kung"
Value: {lat, lng, source: "gazetteer" | "nominatim"}
```

Most searches repeat the same locations. Local gazetteer hits are sub-millisecond.

### Layer 3: Weather Cache — 6 hour TTL

```
Key:   "hk_weather:{date}"
Value: {temp, condition, humidity, alert, forecast}
```

HK Observatory updates every few hours; no benefit in fetching more frequently.

---

## 5. Implementation Blueprint

### Database Schema (Drizzle + Supabase/PostGIS)

```typescript
// db/schema.ts
export const trails = pgTable("trails", {
  id: serial("id").primaryKey(),
  trail_id: varchar("trail_id").unique().notNull(), // e.g. "hk_1"
  name_en: varchar("name_en").notNull(),
  name_ch: varchar("name_ch"),
  difficulty: varchar("difficulty"), // Easy | Moderate | Difficult
  length_km: numeric("length_km"),
  region_en: varchar("region_en"),
  region_ch: varchar("region_ch"),
  official_url: varchar("official_url"),
  start_point: geometry("start_point", { mode: "2d", srid: 4326 }), // PostGIS
  geometry: geometry("geometry", { type: "LineString", srid: 4326 }), // PostGIS
  latitude: numeric("latitude"), // centroid
  longitude: numeric("longitude"), // centroid
});
// Spatial index: CREATE INDEX idx_trails_start_point ON trails USING GIST(start_point);
```

### AI Intent Extraction (Gemini)

```typescript
// lib/extractIntent.ts
const SYSTEM_PROMPT = `
  Extract hiking search intent from a user query.
  Return ONLY valid JSON with these fields:
  - location: string (place name in Hong Kong, null if not mentioned)
  - difficulty: "Easy" | "Moderate" | "Difficult" | null
  - max_length: number (km) | null
  - terrain_type: string | null

  Example: "easy hikes under 5km near Sai Kung"
  → {"location": "Sai Kung", "difficulty": "Easy", "max_length": 5, "terrain_type": null}
`;

async function extractIntent(query: string): Promise<Intent> {
  const response = await gemini.generateContent({ ... });
  return JSON.parse(response.text());
}
```

### Geocoding (Local Gazetteer → Nominatim Fallback)

```typescript
// lib/geocode.ts
// ~100 major HK districts/landmarks with pre-set WGS84 coordinates
const gazetteer: Record<string, { lat: number; lng: number }> = {
  "sai kung": { lat: 22.3872, lng: 114.3047 },
  hku: { lat: 22.2835, lng: 114.138 },
  "the peak": { lat: 22.3128, lng: 114.1427 },
  "tsim sha tsui": { lat: 22.2983, lng: 114.1722 },
  // ... expand as needed
};

async function geocode(location: string, redis: Redis) {
  const key = `geo:${location.toLowerCase()}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // Try local gazetteer first (fuzzy match)
  const match = fuzzyMatch(location, Object.keys(gazetteer));
  if (match) {
    const result = gazetteer[match];
    await redis.setex(key, 86400, JSON.stringify(result));
    return result;
  }

  // Fallback to Nominatim
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${location}+Hong+Kong&format=json&limit=1`,
  );
  const data = await res.json();
  const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  await redis.setex(key, 86400, JSON.stringify(result));
  return result;
}
```

### Spatial Query (PostGIS via Drizzle)

```typescript
// lib/findTrails.ts
async function findTrails(lat: number, lng: number, filters: Intent) {
  return db.execute(sql`
    SELECT
      trail_id, name_en, name_ch, difficulty, length_km,
      region_en, official_url, latitude, longitude,
      ROUND((ST_Distance(
        start_point::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
      ) / 1000)::numeric, 1) AS distance_km
    FROM trails
    WHERE
      ST_DWithin(
        start_point::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        10000  -- 10km in meters
      )
      ${filters.difficulty ? sql`AND difficulty = ${filters.difficulty}` : sql``}
      ${filters.max_length ? sql`AND length_km <= ${filters.max_length}` : sql``}
    ORDER BY distance_km ASC
    LIMIT 10;
  `);
}
```

### API Route (Next.js App Router)

```typescript
// app/api/recommend/route.ts
export async function POST(req: Request) {
  const { query, date } = await req.json();
  const cacheKey = `search:${hash(query + date)}`;

  const cached = await redis.get(cacheKey);
  if (cached) return Response.json(JSON.parse(cached));

  const intent = await extractIntent(query);
  const coords = await geocode(intent.location, redis);
  const trails = await findTrails(coords.lat, coords.lng, intent);
  const weather = await getWeather(date, redis);

  const result = { trails, weather, query_intent: intent };
  await redis.setex(cacheKey, 3600, JSON.stringify(result));

  return Response.json(result);
}
```

### Frontend (Result Card)

```typescript
// Each trail card renders:
// - name_en + name_ch
// - difficulty badge + length_km + region
// - distance from searched location
// - "View Location" → href: `https://www.google.com/maps/search/${name_en}+Hong+Kong`
// - "Official Website" → href: official_url (from DB/JSON)
```

---

## 6. Monthly Cost Estimate

| Service            | Usage                  | Cost         |
| ------------------ | ---------------------- | ------------ |
| Gemini 2.0 Flash   | ~1000 queries/mo       | ~$0.10       |
| Supabase           | 500MB DB (free tier)   | $0           |
| Vercel KV          | Free tier (10GB reads) | $0           |
| HK Observatory API | Free                   | $0           |
| Nominatim          | Free (public instance) | $0           |
| Google Maps links  | No API key needed      | $0           |
| Vercel Hosting     | Free tier              | $0           |
| **Total**          |                        | **~$0–5/mo** |

---

## 7. Execution Plan

**Step 1: Data Conversion** ✅ Done

- Script: `convert_hk80_to_wgs84.py`
- Output: `hikesmart_processed.json` (163 trails, WGS84 coordinates + centroids)

**Step 2: Database Setup & Seeding**

- Initialize Drizzle ORM schema with PostGIS geometry types in Supabase
- Write seeding script to load `hikesmart_processed.json` → PostgreSQL
- Add GIST spatial index on `start_point`

**Step 3: Core Backend Logic**

- Gemini intent extraction utility with typed output
- Local HK gazetteer + Nominatim fallback geocoder
- HK Observatory weather fetcher
- Vercel KV caching layer (3-layer strategy above)

**Step 4: Spatial Query**

- Drizzle + PostGIS `ST_DWithin` / `ST_Distance` query
- `/api/recommend` Next.js route combining all above

**Step 5: Frontend Interface**

- Search bar + date picker
- Weather banner at top of results
- Trail result cards with View Location + Official Website buttons
- Loading and error states
- Use Pastel green colors and build with future animations in mind
