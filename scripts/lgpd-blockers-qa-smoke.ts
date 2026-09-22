/**
 * QA smoke — LGPD/clinical blockers closed in 20260922170000 + markContentDone gate.
 * Static verification (no live DB). Run: npx tsx scripts/lgpd-blockers-qa-smoke.ts
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.join(__dirname, "..");

function read(rel: string) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const safeContent = read("app/actions/safe-content.ts");
assert.match(
  safeContent,
  /unsafe_content/,
  "markContentDone must reject unsafe_content",
);
assert.match(
  safeContent,
  /listSafeExercisesForMeAction/,
  "workout done must gate via list_safe exercises",
);
assert.match(
  safeContent,
  /listSafeMealsForMeAction/,
  "meal done must gate via list_safe meals",
);
assert.ok(
  safeContent.indexOf("listSafeExercisesForMeAction") <
    safeContent.indexOf('from("habit_logs").upsert'),
  "clinical gate must run before habit_logs upsert",
);

const careCircle = read("app/actions/care-circle.ts");
assert.match(
  careCircle,
  /list_circle_member_display_names/,
  "circle must load names via RPC, not full user_profiles",
);
assert.doesNotMatch(
  careCircle,
  /\.from\("user_profiles"\)\s*\n\s*\.select\("id, display_name"\)/,
  "circle must not select mates from user_profiles directly",
);

const account = read("app/actions/account.ts");
assert.match(
  account,
  /record_own_account_deletion/,
  "delete account must record tombstone RPC",
);
assert.doesNotMatch(
  account,
  /lgpd_consent_logs"\)\.insert\(\{[\s\S]*purpose: "terms"[\s\S]*accepted: false/,
  "delete must not rely on consent log that cascades away",
);

const migration = read(
  "supabase/migrations/20260922170000_lgpd_mates_profile_and_deletion_audit.sql",
);
assert.match(
  migration,
  /drop policy if exists "circle mates can select public profile"/,
);
assert.match(migration, /account_deletion_audit/);
assert.match(
  migration,
  /Intentionally has no FK to auth\.users/,
);
assert.match(migration, /list_circle_member_display_names/);
assert.match(migration, /record_own_account_deletion/);

console.log("lgpd-blockers-qa-smoke: PASS");
