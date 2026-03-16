import { NextRequest, NextResponse } from "next/server";
import { extractIntent } from "@/lib/extractIntent";
import { geocode } from "@/lib/geocode";
import { findTrails } from "@/lib/findTrails";
import { getWeather } from "@/lib/weather";
import { getCache, setCache } from "@/lib/cache";
import { hashKey } from "@/lib/utils";
import type { SearchResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, date } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const dateStr = date || new Date().toISOString().split("T")[0];
    const cacheKey = `search:${hashKey(`${query}:${dateStr}`)}`;

    // Check cache
    const cached = await getCache<SearchResult>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Extract intent from natural language
    const intent = await extractIntent(query);

    // Geocode location if present
    const coords = intent.location ? await geocode(intent.location) : null;

    // Find trails and get weather in parallel
    const [trails, weather] = await Promise.all([
      findTrails(intent, coords),
      getWeather(dateStr),
    ]);

    const result: SearchResult = {
      trails,
      weather,
      query_intent: intent,
    };

    // Cache for 1 hour
    await setCache(cacheKey, result, 3600);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recommend API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
