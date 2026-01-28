import { createClient } from "@supabase/supabase-js";
import exercises from "./exercises.json";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function toSlug(id: string): string {
  return id.toLowerCase().replace(/_/g, "-");
}

interface RawExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

async function seed() {
  const BATCH_SIZE = 100;
  const rows = (exercises as RawExercise[]).map((e) => ({
    slug: toSlug(e.id),
    name: e.name,
    force: e.force,
    level: e.level,
    mechanic: e.mechanic,
    equipment: e.equipment,
    primary_muscles: e.primaryMuscles,
    secondary_muscles: e.secondaryMuscles,
    instructions: e.instructions,
    category: e.category,
    images: e.images,
  }));

  console.log(`Seeding ${rows.length} exercises...`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("exercises")
      .upsert(batch, { onConflict: "slug" });

    if (error) {
      console.error(`Error at batch ${i / BATCH_SIZE + 1}:`, error.message);
      process.exit(1);
    }

    console.log(`Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} rows)`);
  }

  console.log("Done.");
}

seed();
