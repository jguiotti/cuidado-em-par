import { isSleepQuality, type SleepQuality } from "@/lib/habits/types";

const SLEEP_MINUTES_MIN = 0;
const SLEEP_MINUTES_MAX = 24 * 60;

export function normalizeSleepMinutes(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return null;
  }
  const rounded = Math.round(n);
  if (rounded < SLEEP_MINUTES_MIN || rounded > SLEEP_MINUTES_MAX) {
    return null;
  }
  return rounded;
}

export function normalizeSleepQuality(value: unknown): SleepQuality | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return isSleepQuality(value) ? value : null;
}

export function isValidSleepInput(input: {
  quality?: unknown;
  minutes?: unknown;
}): boolean {
  const quality = normalizeSleepQuality(input.quality);
  const minutes = normalizeSleepMinutes(input.minutes);
  return quality !== null || minutes !== null;
}
