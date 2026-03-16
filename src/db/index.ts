import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

let _client: Sql | null = null;
let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getClient(): Sql {
  if (!_client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    _client = postgres(connectionString, { prepare: false });
  }
  return _client;
}

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}
