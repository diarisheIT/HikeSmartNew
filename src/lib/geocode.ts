import { gazetteer } from "./gazetteer";
import { getCache, setCache } from "./cache";
import { normalizeLocation } from "./utils";

interface GeoResult {
  lat: number;
  lng: number;
}

export async function geocode(location: string): Promise<GeoResult | null> {
  const normalized = normalizeLocation(location);
  const cacheKey = `geo:${normalized}`;

  const cached = await getCache<GeoResult>(cacheKey);
  if (cached) return cached;

  // Check gazetteer (exact match)
  if (gazetteer[normalized]) {
    const result = gazetteer[normalized];
    await setCache(cacheKey, result, 86400);
    return result;
  }

  // Fuzzy match against gazetteer (substring)
  for (const [key, value] of Object.entries(gazetteer)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      await setCache(cacheKey, value, 86400);
      return value;
    }
  }

  // Fallback: Nominatim
  try {
    const query = encodeURIComponent(`${location} Hong Kong`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: { "User-Agent": "HikeSmart/1.0" },
      }
    );
    const data = await res.json();
    if (data.length > 0) {
      const result: GeoResult = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      await setCache(cacheKey, result, 86400);
      return result;
    }
  } catch {
    // Nominatim failed, return null
  }

  return null;
}
