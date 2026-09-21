import { deriveCareEventKinds } from "../lib/care/kinds";

function assert(name: string, condition: boolean) {
  console.log(`${condition ? "PASS" : "FAIL"} ${name}`);
}

assert(
  "water below goal does not publish water",
  !deriveCareEventKinds({
    logs: [{ kind: "water", value: 500 }],
    waterGoalMl: 2000,
  }).includes("water"),
);

assert(
  "water at goal publishes water",
  deriveCareEventKinds({
    logs: [{ kind: "water", value: 2000 }],
    waterGoalMl: 2000,
  }).includes("water"),
);

assert(
  "two workouts collapse to one workout kind",
  deriveCareEventKinds({
    logs: [
      { kind: "workout", value: 1, content_id: "a" },
      { kind: "workout", value: 1, content_id: "b" },
    ],
    waterGoalMl: 2000,
  }).filter((k) => k === "workout").length === 1,
);

assert(
  "sleep and pause and meal",
  deriveCareEventKinds({
    logs: [
      { kind: "sleep", value: 420 },
      { kind: "active-pause", value: 1 },
      { kind: "meal", value: 1, content_id: "m1" },
    ],
    waterGoalMl: 2000,
  }).join(",") === "sleep,active-pause,meal",
);

assert(
  "empty logs yield empty kinds",
  deriveCareEventKinds({ logs: [], waterGoalMl: 2000 }).length === 0,
);

assert(
  "no clinical fields in kind list",
  !deriveCareEventKinds({
    logs: [{ kind: "workout", value: 1, content_id: "torn-acl-exercise" }],
    waterGoalMl: 2000,
  }).some((k) => k.includes("torn") || k.includes("clinical")),
);
