/**
 * Sprint 8 offline smoke: group limits + care event aggregation parity.
 */

import { memberLimitForKind } from "../lib/care/circle";
import { deriveCareEventKinds } from "../lib/care/kinds";

function assert(name: string, condition: boolean) {
  console.log(`${condition ? "PASS" : "FAIL"} ${name}`);
}

assert("pair limit 2", memberLimitForKind("pair") === 2);
assert("group limit 8", memberLimitForKind("group") === 8);

assert(
  "group does not publish clinical kind names",
  !deriveCareEventKinds({
    logs: [{ kind: "workout", value: 1, content_id: "pregnancy-unsafe" }],
    waterGoalMl: 2000,
  }).some((k) => k.includes("pregnancy") || k.includes("torn")),
);

assert(
  "feed kinds stay aggregated for groups",
  deriveCareEventKinds({
    logs: [
      { kind: "water", value: 2000 },
      { kind: "workout", value: 1, content_id: "a" },
      { kind: "workout", value: 1, content_id: "b" },
      { kind: "meal", value: 1, content_id: "m" },
    ],
    waterGoalMl: 2000,
  }).join(",") === "water,workout,meal",
);
