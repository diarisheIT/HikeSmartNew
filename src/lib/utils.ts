import { createHash } from "crypto";

export function hashKey(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

export function normalizeLocation(loc: string): string {
  return loc.toLowerCase().trim();
}
