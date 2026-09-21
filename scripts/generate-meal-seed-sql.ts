import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { mealIdFromSlug } from "../lib/admin/meal-id";
import { mealPhotoStoragePath } from "../lib/admin/meal-illustration";
import { MEAL_SEED_CATALOG_FULL } from "../lib/admin/meal-seed-catalog";

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

function sqlJson(value: unknown): string {
  return `${sqlText(JSON.stringify(value))}::jsonb`;
}

const lines: string[] = [];
lines.push("-- purpose: full low-cost meal library seed (Nutricionista review).");
lines.push("-- affected: meals_library");
lines.push("-- notes: generated from lib/admin/meal-seed-catalog*.ts");
lines.push("--   upsert by fixed uuid from slug; photos at meals/photos/{slug}.png");
lines.push("");

// Remove previous sprint4 fixed seed ids to avoid duplicate titles
lines.push("delete from public.meals_library");
lines.push("where id in (");
const oldIds = [
  "b1000000-0000-4000-8000-000000000001",
  "b1000000-0000-4000-8000-000000000002",
  "b1000000-0000-4000-8000-000000000003",
  "b1000000-0000-4000-8000-000000000004",
  "b1000000-0000-4000-8000-000000000005",
  "b1000000-0000-4000-8000-000000000006",
  "b1000000-0000-4000-8000-000000000007",
  "b1000000-0000-4000-8000-000000000008",
  "b1000000-0000-4000-8000-000000000009",
  "b1000000-0000-4000-8000-00000000000a",
  "b1000000-0000-4000-8000-00000000000b",
  "b1000000-0000-4000-8000-00000000000c",
];
lines.push(oldIds.map((id) => `  '${id}'`).join(",\n"));
lines.push(");");
lines.push("");

lines.push("insert into public.meals_library (");
lines.push(
  "  id, title, description, ingredients, image_paths, meal_slot,",
);
lines.push(
  "  contains_tags, diet_compatible_tags, phase_tags, is_published, created_by",
);
lines.push(")");
lines.push("values");

const values = MEAL_SEED_CATALOG_FULL.map((entry) => {
  const id = mealIdFromSlug(entry.slug);
  const imagePath = mealPhotoStoragePath(entry.slug);
  return `  (
    '${id}',
    ${sqlText(entry.title)},
    ${sqlText(entry.description)},
    ${sqlJson(entry.ingredients)},
    ${sqlArray([imagePath])},
    ${sqlText(entry.mealSlot)},
    ${sqlArray(entry.containsTags)},
    ${sqlArray(entry.dietCompatibleTags)},
    '{}',
    ${entry.isPublished ? "true" : "false"},
    null
  )`;
});

lines.push(values.join(",\n"));
lines.push("on conflict (id) do update");
lines.push("set");
lines.push("  title = excluded.title,");
lines.push("  description = excluded.description,");
lines.push("  ingredients = excluded.ingredients,");
lines.push("  image_paths = excluded.image_paths,");
lines.push("  meal_slot = excluded.meal_slot,");
lines.push("  contains_tags = excluded.contains_tags,");
lines.push("  diet_compatible_tags = excluded.diet_compatible_tags,");
lines.push("  phase_tags = excluded.phase_tags,");
lines.push("  is_published = excluded.is_published,");
lines.push("  updated_at = now();");
lines.push("");

const outPath = resolve(
  "supabase/migrations/20260921160000_seed_full_meal_library.sql",
);
writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
console.log(
  `Wrote ${MEAL_SEED_CATALOG_FULL.length} meals to ${outPath}`,
);
