import {
  pgTable,
  serial,
  varchar,
  numeric,
  index,
} from "drizzle-orm/pg-core";

export const trails = pgTable(
  "trails",
  {
    id: serial("id").primaryKey(),
    trail_id: varchar("trail_id").unique().notNull(),
    name_en: varchar("name_en").notNull(),
    name_ch: varchar("name_ch"),
    difficulty: varchar("difficulty"),
    length_km: numeric("length_km"),
    region_en: varchar("region_en"),
    region_ch: varchar("region_ch"),
    trail_type_en: varchar("trail_type_en"),
    start_point_en: varchar("start_point_en"),
    finish_point_en: varchar("finish_point_en"),
    official_url: varchar("official_url"),
    latitude: numeric("latitude"),
    longitude: numeric("longitude"),
  },
  (table) => [index("idx_trails_difficulty").on(table.difficulty)]
);
