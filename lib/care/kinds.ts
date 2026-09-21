export const CARE_EVENT_KINDS = [
  "water",
  "sleep",
  "active-pause",
  "workout",
  "meal",
] as const;

export type CareEventKind = (typeof CARE_EVENT_KINDS)[number];

export function isCareEventKind(value: string): value is CareEventKind {
  return (CARE_EVENT_KINDS as readonly string[]).includes(value);
}

export interface HabitLogRowForCare {
  kind: string;
  value: number | null;
  content_id?: string | null;
}

/**
 * Derives which care_event kinds should exist for a day from the owner's habit_logs.
 * Never includes clinical detail — only aggregated presence.
 */
export function deriveCareEventKinds(input: {
  logs: HabitLogRowForCare[];
  waterGoalMl: number;
}): CareEventKind[] {
  const kinds = new Set<CareEventKind>();
  let waterMl = 0;
  let hasSleep = false;
  let hasPause = false;
  let workoutCount = 0;
  let mealCount = 0;

  for (const log of input.logs) {
    if (log.kind === "water") {
      waterMl = typeof log.value === "number" ? log.value : 0;
    } else if (log.kind === "sleep") {
      hasSleep = true;
    } else if (log.kind === "active-pause") {
      hasPause = true;
    } else if (log.kind === "workout") {
      workoutCount += 1;
    } else if (log.kind === "meal") {
      mealCount += 1;
    }
  }

  if (waterMl >= input.waterGoalMl && input.waterGoalMl > 0) {
    kinds.add("water");
  }
  if (hasSleep) {
    kinds.add("sleep");
  }
  if (hasPause) {
    kinds.add("active-pause");
  }
  if (workoutCount > 0) {
    kinds.add("workout");
  }
  if (mealCount > 0) {
    kinds.add("meal");
  }

  return CARE_EVENT_KINDS.filter((kind) => kinds.has(kind));
}
