import fs from "node:fs";
import path from "node:path";

import { listMealImageJobs } from "./meal-image-prompts";

const assets = path.join(
  process.env.USERPROFILE ?? "",
  ".cursor",
  "projects",
  "c-Users-janai-cuidado-em-par",
  "assets",
);
const dst = path.join(process.cwd(), "public", "meal-photos");
fs.mkdirSync(dst, { recursive: true });

const jobs = listMealImageJobs();
let copied = 0;
for (const job of jobs) {
  const from = path.join(assets, job.filename);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, path.join(dst, job.filename));
    copied += 1;
  }
}

const done = new Set(
  fs
    .readdirSync(dst)
    .filter((file) => file.endsWith(".png"))
    .map((file) => file.replace(/\.png$/, "")),
);
const remaining = jobs.filter((job) => !done.has(job.slug));

console.log(
  JSON.stringify(
    {
      copied,
      done: done.size,
      remaining: remaining.length,
      next: remaining.slice(0, 15).map((job) => job.slug),
    },
    null,
    2,
  ),
);
