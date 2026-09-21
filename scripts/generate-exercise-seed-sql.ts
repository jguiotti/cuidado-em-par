import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { exerciseIdFromSlug } from "../lib/admin/exercise-id";
import { illustrationStoragePath } from "../lib/admin/exercise-illustration";
import { EXERCISE_SEED_CATALOG_FULL } from "../lib/admin/exercise-seed-catalog";

function sqlArray(values: string[]): string {
  if (values.length === 0) {
    return "'{}'";
  }
  const body = values.map((value) => `'${value.replace(/'/g, "''")}'`).join(", ");
  return `array[${body}]`;
}

function sqlText(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

const equipmentTags = [
  ["resistance-band", "Elástico"],
  ["broomstick", "Cabo de vassoura"],
  ["backpack", "Mochila"],
  ["cushion", "Almofada"],
] as const;

const lines: string[] = [];
lines.push(`-- purpose: full low-cost exercise library seed (Educador Físico review).`);
lines.push(`-- affected: tags, exercises_library`);
lines.push(`-- notes: generated from lib/admin/exercise-seed-catalog*.ts`);
lines.push(`--   upsert by fixed uuid from slug. titles/descriptions pt-BR.`);
lines.push("");
lines.push("insert into public.tags (slug, domain, kind, label)");
lines.push("values");
lines.push(
  equipmentTags
    .map(
      ([slug, label]) =>
        `  ('${slug}', 'movement', 'equipment', '${label}')`,
    )
    .join(",\n"),
);
lines.push(`on conflict (slug) do update`);
lines.push(`set domain = excluded.domain, kind = excluded.kind, label = excluded.label;`);
lines.push("");

// Remove previous sprint3 fixed seeds to avoid duplicates by title
lines.push(`delete from public.exercises_library`);
lines.push(`where id in (`);
lines.push(`  'a1000000-0000-4000-8000-000000000001',`);
lines.push(`  'a1000000-0000-4000-8000-000000000002',`);
lines.push(`  'a1000000-0000-4000-8000-000000000003',`);
lines.push(`  'a1000000-0000-4000-8000-000000000004',`);
lines.push(`  'a1000000-0000-4000-8000-000000000005',`);
lines.push(`  'a1000000-0000-4000-8000-000000000006',`);
lines.push(`  'a1000000-0000-4000-8000-000000000007',`);
lines.push(`  'a1000000-0000-4000-8000-000000000008'`);
lines.push(`);`);
lines.push("");

lines.push("insert into public.exercises_library (");
lines.push("  id, title, description, image_paths, video_url, target_muscles,");
lines.push("  equipment_tags, contraindication_tags, required_capability_tags,");
lines.push("  intensity_tags, is_published, created_by");
lines.push(")");
lines.push("values");

const values = EXERCISE_SEED_CATALOG_FULL.map((exercise) => {
  const id = exerciseIdFromSlug(exercise.slug);
  const imagePath = illustrationStoragePath(exercise.slug);
  return `  (
    '${id}',
    ${sqlText(exercise.title)},
    ${sqlText(exercise.description)},
    ${sqlArray([imagePath])},
    null,
    ${sqlArray(exercise.targetMuscles)},
    ${sqlArray(exercise.equipmentTags)},
    ${sqlArray(exercise.contraindicationTags)},
    ${sqlArray(exercise.requiredCapabilityTags)},
    ${sqlArray(exercise.intensityTags)},
    ${exercise.isPublished ? "true" : "false"},
    null
  )`;
});

lines.push(values.join(",\n"));
lines.push("on conflict (id) do update");
lines.push("set");
lines.push("  title = excluded.title,");
lines.push("  description = excluded.description,");
lines.push("  image_paths = excluded.image_paths,");
lines.push("  target_muscles = excluded.target_muscles,");
lines.push("  equipment_tags = excluded.equipment_tags,");
lines.push("  contraindication_tags = excluded.contraindication_tags,");
lines.push("  required_capability_tags = excluded.required_capability_tags,");
lines.push("  intensity_tags = excluded.intensity_tags,");
lines.push("  is_published = excluded.is_published,");
lines.push("  updated_at = now();");
lines.push("");

const outPath = resolve(
  "supabase/migrations/20260921120000_seed_full_exercise_library.sql",
);
writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
console.log(
  `Wrote ${EXERCISE_SEED_CATALOG_FULL.length} exercises to ${outPath}`,
);
