import { GoogleGenAI } from "@google/genai";
import type { Intent } from "./types";
import { getCache, setCache } from "./cache";
import crypto from "crypto";

const SYSTEM_PROMPT = `You are a hiking query parser for Hong Kong trails. Extract structured information from the user's natural language query.

Return a JSON object with these fields:
- location: string or null -- the place name or area mentioned (e.g., "Sai Kung", "Lantau", "The Peak")
- difficulty: string or null -- must be one of: "Easy", "Moderate", "Difficult", "Demanding", "Very difficult"
- max_length: number or null -- maximum trail length in km if mentioned
- terrain_type: string or null -- type of terrain if mentioned (e.g., "coastal", "mountain", "forest")

Only return the JSON object, nothing else. Example:
{"location": "Sai Kung", "difficulty": "Easy", "max_length": null, "terrain_type": "coastal"}`;

const INTENT_CACHE_TTL = 86400; // 24h

// Common patterns that don't require Gemini
const COMMON_PATTERNS: Array<{ keywords: string[]; intent: Partial<Intent> }> = [
  { keywords: ["easy"], intent: { difficulty: "Easy" } },
  { keywords: ["moderate"], intent: { difficulty: "Moderate" } },
  { keywords: ["difficult", "hard"], intent: { difficulty: "Difficult" } },
  { keywords: ["demanding"], intent: { difficulty: "Demanding" } },
  { keywords: ["very difficult", "expert"], intent: { difficulty: "Very difficult" } },
  { keywords: ["short", "under 3"], intent: { max_length: 3 } },
  { keywords: ["under 5"], intent: { max_length: 5 } },
  { keywords: ["under 10"], intent: { max_length: 10 } },
];

function hashKey(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function matchCommonPattern(query: string): Intent | null {
  const lower = query.toLowerCase();
  const merged: Partial<Intent> = {};
  let matched = false;

  for (const { keywords, intent } of COMMON_PATTERNS) {
    if (keywords.some((k) => lower.includes(k))) {
      Object.assign(merged, intent);
      matched = true;
    }
  }

  if (!matched) return null;

  return {
    location: null,
    difficulty: null,
    max_length: null,
    terrain_type: null,
    ...merged,
  };
}

async function callGemini(query: string): Promise<Intent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set, returning default intent");
    return {
      location: null,
      difficulty: null,
      max_length: null,
      terrain_type: null,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: query,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
      },
    });

    const text = response.text?.trim() ?? "";
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned);

    return {
      location: parsed.location ?? null,
      difficulty: parsed.difficulty ?? null,
      max_length: parsed.max_length ?? null,
      terrain_type: parsed.terrain_type ?? null,
    };
  } catch (error) {
    console.error("Intent extraction failed:", error);
    return {
      location: null,
      difficulty: null,
      max_length: null,
      terrain_type: null,
    };
  }
}

export async function extractIntent(query: string): Promise<Intent> {
  // 1. Common pattern shortcut (0 API calls)
  const pattern = matchCommonPattern(query);
  if (pattern) {
    console.log("Intent extracted from common pattern");
    return pattern;
  }

  // 2. Cache lookup
  const normalized = query.toLowerCase().trim().replace(/\s+/g, " ");
  const cacheKey = `intent:${hashKey(normalized)}`;
  const cached = await getCache<Intent>(cacheKey);
  if (cached) {
    console.log("Intent retrieved from cache");
    return cached;
  }

  // 3. Call Gemini
  const intent = await callGemini(query);

  // 4. Store result
  await setCache(cacheKey, intent, INTENT_CACHE_TTL);
  return intent;
}
