export interface Intent {
  location: string | null;
  difficulty: string | null;
  max_length: number | null;
  terrain_type: string | null;
}

export interface TrailResult {
  id: number;
  trail_id: string;
  name_en: string;
  name_ch: string | null;
  difficulty: string | null;
  length_km: number | null;
  region_en: string | null;
  region_ch: string | null;
  trail_type_en: string | null;
  start_point_en: string | null;
  finish_point_en: string | null;
  official_url: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_km: number | null;
}

export interface Weather {
  temperature: number | null;
  condition: string | null;
  humidity: number | null;
  forecast: string | null;
  warnings: string[];
}

export interface SearchResult {
  trails: TrailResult[];
  weather: Weather;
  query_intent: Intent;
}
