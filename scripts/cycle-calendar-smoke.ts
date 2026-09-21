/**
 * Smoke checks for menstrual calendar estimates (calendar method).
 * Run: npx tsx scripts/cycle-calendar-smoke.ts
 */

import {
  classifyCycleDay,
  fertileWindowBounds,
  phaseTagsForDay,
  reminderFlagsForToday,
} from "../lib/cycle/calendar";
import { TAG_SLUGS } from "../lib/tags/constants";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const input = {
  lastPeriodStart: "2026-09-01",
  averageCycleLengthDays: 28,
  averagePeriodLengthDays: 5,
  today: "2026-09-21",
};

const period = classifyCycleDay(input, "2026-09-02");
assert(period.kind === "period", `expected period, got ${period.kind}`);

const { ovulationDay, fertileStartDay } = fertileWindowBounds(28);
assert(ovulationDay === 14, `expected ovulation 14, got ${ovulationDay}`);

const ovulation = classifyCycleDay(input, "2026-09-14");
assert(
  ovulation.kind === "ovulation",
  `expected ovulation, got ${ovulation.kind}`,
);

const fertile = classifyCycleDay(input, "2026-09-12");
assert(
  fertile.kind === "fertile" || fertile.kind === "ovulation",
  `expected fertile window, got ${fertile.kind}`,
);

const late = reminderFlagsForToday({
  ...input,
  today: "2026-10-06",
});
assert(late.lateOrPossiblePregnancy === true, "expected late flag");
assert(late.daysLate != null && late.daysLate >= 5, "expected daysLate >= 5");

const approaching = reminderFlagsForToday({
  ...input,
  today: "2026-09-27",
});
assert(approaching.periodApproaching === true, "expected period approaching");

const fertileStart = reminderFlagsForToday({
  ...input,
  today: `2026-09-${String(fertileStartDay).padStart(2, "0")}`,
});
assert(fertileStart.fertileStarting === true, "expected fertile starting");

const tags = phaseTagsForDay(input, "2026-09-02", "menstrual-cycle");
assert(tags.includes(TAG_SLUGS.cycleActive), "missing cycle-active");
assert(tags.includes(TAG_SLUGS.menstrualPhase), "missing menstrual-phase");

console.log("cycle-calendar-smoke: PASS");
