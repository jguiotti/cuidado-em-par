/** Storage-style path for seed meal photos (served from /public). */
export function mealPhotoStoragePath(slug: string): string {
  return `meals/photos/${slug}.png`;
}

const MEAL_PHOTO_PATH = /^meals\/photos\/([a-z0-9-]+)\.png$/;

/**
 * Resolves an image_paths entry to a browser src for seed meal photos.
 */
export function resolveMealImageSrc(path: string): string | null {
  const match = MEAL_PHOTO_PATH.exec(path);
  if (match) {
    return `/meal-photos/${match[1]}.png`;
  }
  return null;
}
