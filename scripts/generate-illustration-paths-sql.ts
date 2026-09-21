import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { exerciseIdFromSlug } from "../lib/admin/exercise-id";
import { illustrationStoragePath } from "../lib/admin/exercise-illustration";
import { EXERCISE_SEED_CATALOG_FULL } from "../lib/admin/exercise-seed-catalog";

const lines: string[] = [];
lines.push(
  "-- purpose: attach drawing-style illustration paths to seeded exercises.",
);
lines.push("-- affected: exercises_library.image_paths");
lines.push(
  "-- notes: PNGs live in public/exercise-illustrations/{slug}.png",
);
lines.push("--   path convention: exercises/illustrations/{slug}.png");
lines.push("");

for (const exercise of EXERCISE_SEED_CATALOG_FULL) {
  const id = exerciseIdFromSlug(exercise.slug);
  const imagePath = illustrationStoragePath(exercise.slug);
  lines.push("update public.exercises_library");
  lines.push(
    `set image_paths = array['${imagePath}'], updated_at = now()`,
  );
  lines.push(`where id = '${id}';`);
  lines.push("");
}

const outPath = resolve(
  "supabase/migrations/20260921140000_attach_exercise_illustrations.sql",
);
writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
console.log(
  `Wrote ${EXERCISE_SEED_CATALOG_FULL.length} updates to ${outPath}`,
);
