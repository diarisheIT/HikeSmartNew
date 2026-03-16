import { getClient } from "@/db";
import type { Intent, TrailResult } from "./types";

const HK_CENTER = { lat: 22.3368, lng: 114.1745 };

export async function findTrails(
  intent: Intent,
  coords: { lat: number; lng: number } | null
): Promise<TrailResult[]> {
  const location = coords ?? HK_CENTER;
  const radiusKm = coords ? 15 : 30;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIdx = 1;

  // Spatial filter using start_point geometry
  conditions.push(
    `ST_DWithin(start_point, ST_SetSRID(ST_MakePoint($${paramIdx}, $${paramIdx + 1}), 4326)::geography, $${paramIdx + 2})`
  );
  params.push(location.lng, location.lat, radiusKm * 1000); // ST_DWithin uses meters for geography
  paramIdx += 3;

  if (intent.difficulty) {
    conditions.push(`difficulty = $${paramIdx}`);
    params.push(intent.difficulty);
    paramIdx += 1;
  }

  if (intent.max_length) {
    conditions.push(`length_km <= $${paramIdx}`);
    params.push(intent.max_length);
    paramIdx += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT
      id, trail_id, name_en, name_ch, difficulty, length_km,
      region_en, region_ch, trail_type_en, start_point_en,
      finish_point_en, official_url, latitude, longitude,
      ROUND((ST_Distance(
        start_point,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) / 1000.0)::numeric, 1) AS distance_km
    FROM trails
    ${whereClause}
    ORDER BY ST_Distance(
      start_point,
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
    )
    LIMIT 10
  `;

  const rows = await getClient().unsafe(query, params);

  return rows.map((row) => ({
    id: row.id,
    trail_id: row.trail_id,
    name_en: row.name_en,
    name_ch: row.name_ch,
    difficulty: row.difficulty,
    length_km: row.length_km ? parseFloat(row.length_km) : null,
    region_en: row.region_en,
    region_ch: row.region_ch,
    trail_type_en: row.trail_type_en,
    start_point_en: row.start_point_en,
    finish_point_en: row.finish_point_en,
    official_url: row.official_url,
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    distance_km: row.distance_km ? parseFloat(row.distance_km) : null,
  }));
}
