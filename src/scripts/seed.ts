import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false });

interface Feature {
  properties: {
    Trail_ID: string;
    Trail_name_En: string;
    Trail_name_Ch?: string;
    Difficult_En?: string;
    Shape_Length?: number;
    Region_En?: string;
    Region_Ch?: string;
    Type_En?: string;
    Startpt_En?: string;
    Finishpt_E?: string;
    Webpage_En?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface GeoJSON {
  features: Feature[];
}

async function seed() {
  const filePath = join(process.cwd(), "src", "data", "hikesmart_processed.json");
  const raw = readFileSync(filePath, "utf-8");
  const data: GeoJSON = JSON.parse(raw);

  console.log(`Found ${data.features.length} trails to seed`);

  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < data.features.length; i += BATCH_SIZE) {
    const batch = data.features.slice(i, i + BATCH_SIZE);

    for (const feature of batch) {
      const p = feature.properties;
      const difficulty = p.Difficult_En?.trim() || null;
      const lengthKm = p.Shape_Length
        ? Math.round((p.Shape_Length / 1000) * 10) / 10
        : null;
      const lat = p.latitude ?? null;
      const lng = p.longitude ?? null;

      const startPointExpr =
        lat != null && lng != null
          ? sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`
          : sql`NULL`;

      await sql`
        INSERT INTO trails (
          trail_id, name_en, name_ch, difficulty, length_km,
          region_en, region_ch, trail_type_en, start_point_en,
          finish_point_en, official_url, start_point, latitude, longitude
        ) VALUES (
          ${p.Trail_ID},
          ${p.Trail_name_En},
          ${p.Trail_name_Ch ?? null},
          ${difficulty},
          ${lengthKm},
          ${p.Region_En ?? null},
          ${p.Region_Ch ?? null},
          ${p.Type_En ?? null},
          ${p.Startpt_En ?? null},
          ${p.Finishpt_E ?? null},
          ${p.Webpage_En ?? null},
          ${startPointExpr},
          ${lat},
          ${lng}
        )
        ON CONFLICT (trail_id) DO UPDATE SET
          name_en = EXCLUDED.name_en,
          name_ch = EXCLUDED.name_ch,
          difficulty = EXCLUDED.difficulty,
          length_km = EXCLUDED.length_km,
          region_en = EXCLUDED.region_en,
          region_ch = EXCLUDED.region_ch,
          trail_type_en = EXCLUDED.trail_type_en,
          start_point_en = EXCLUDED.start_point_en,
          finish_point_en = EXCLUDED.finish_point_en,
          official_url = EXCLUDED.official_url,
          start_point = EXCLUDED.start_point,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude
      `;
      inserted++;
    }

    console.log(`Seeded ${inserted}/${data.features.length} trails`);
  }

  console.log("Seeding complete!");
  await sql.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
