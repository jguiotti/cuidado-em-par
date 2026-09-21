import { createHash } from "node:crypto";

/** Deterministic exercise UUID used by the full library seed. */
export function exerciseIdFromSlug(slug: string): string {
  const hash = createHash("sha256")
    .update(`cuidado-exercise:${slug}`)
    .digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `8${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}
