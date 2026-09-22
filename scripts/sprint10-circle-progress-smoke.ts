/**
 * Sprint 10 — pure helpers for circle week / together threshold.
 * Run: npx tsx scripts/sprint10-circle-progress-smoke.ts
 */

import assert from "node:assert/strict";

import { deriveCareEventKinds } from "../lib/care/kinds";
import { buildCircleCareProgress } from "../lib/care/progress";
import {
  isDayTogether,
  startOfWeekMondaySaoPaulo,
  togetherThreshold,
} from "../lib/care/week";

assert.equal(togetherThreshold(1), Number.POSITIVE_INFINITY);
assert.equal(togetherThreshold(2), 2);
assert.equal(togetherThreshold(4), 2);
assert.equal(togetherThreshold(5), 2);
assert.equal(togetherThreshold(8), 4);

assert.equal(
  isDayTogether({ memberCount: 2, membersWithCareCount: 2 }),
  true,
);
assert.equal(
  isDayTogether({ memberCount: 2, membersWithCareCount: 1 }),
  false,
);
assert.equal(
  isDayTogether({ memberCount: 4, membersWithCareCount: 2 }),
  true,
);

assert.equal(startOfWeekMondaySaoPaulo("2026-09-22"), "2026-09-21"); // Tue → Mon 21
assert.equal(startOfWeekMondaySaoPaulo("2026-09-21"), "2026-09-21");

const kinds = deriveCareEventKinds({
  logs: [{ kind: "rest-day", value: 1 }],
  waterGoalMl: 2000,
});
assert.deepEqual(kinds, ["rest-day"]);

const progress = buildCircleCareProgress({
  weeklyCareGoal: 3,
  members: [
    { userId: "a", displayName: "A" },
    { userId: "b", displayName: "B" },
  ],
  eventsByDayUser: new Map([
    [
      "2026-09-22",
      new Map([
        ["a", ["rest-day" as const]],
        ["b", ["sleep" as const]],
      ]),
    ],
  ]),
  anchorDay: "2026-09-22",
});
assert.equal(progress.daysTogetherCount, 1);

console.log("sprint10-circle-progress-smoke: PASS");
