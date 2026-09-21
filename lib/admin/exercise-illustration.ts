/** Storage-style path for seed illustrations (served from /public). */
export function illustrationStoragePath(slug: string): string {
  return `exercises/illustrations/${slug}.png`;
}

const ILLUSTRATION_PATH =
  /^exercises\/illustrations\/([a-z0-9-]+)\.png$/;

/**
 * Resolves an image_paths entry to a browser src.
 * Seed drawings live under public/exercise-illustrations/.
 * Other paths stay as storage object keys (caller signs when needed).
 */
export function resolveExerciseImageSrc(path: string): string | null {
  const match = ILLUSTRATION_PATH.exec(path);
  if (match) {
    return `/exercise-illustrations/${match[1]}.png`;
  }
  return null;
}
