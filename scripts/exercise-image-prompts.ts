/**
 * Builds consistent illustration prompts for exercise seed images.
 * Style: soft educational line drawing (Santuário Digital palette).
 */

import { EXERCISE_SEED_CATALOG_FULL } from "../lib/admin/exercise-seed-catalog";

const STYLE = [
  "Educational line-drawing illustration",
  "soft flat colors mint green and warm blush on cream background",
  "inclusive body proportions, not a fitness model, gender-neutral clothing",
  "simple clean contours, minimal facial detail",
  "no text, no watermark, no photorealism, no 3D render",
  "instructional physiotherapy poster style",
  "single person demonstrating the movement clearly in side or three-quarter view",
].join(", ");

export function promptForExercise(title: string, description: string): string {
  return `${STYLE}. Subject: Brazilian Portuguese exercise named "${title}". Movement cue: ${description.slice(0, 220)}`;
}

export function listExerciseImageJobs() {
  return EXERCISE_SEED_CATALOG_FULL.map((exercise) => ({
    slug: exercise.slug,
    title: exercise.title,
    filename: `${exercise.slug}.png`,
    prompt: promptForExercise(exercise.title, exercise.description),
  }));
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  // no-op when imported
}
