import { isSleepQuality, type SleepQuality } from "@/lib/habits/types";

const SLEEP_MINUTES_MIN = 0;
const SLEEP_MINUTES_MAX = 24 * 60;
const SLEEP_HOURS_MAX = 24;

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

/**
 * UI asks for hours slept; storage stays in minutes on habit_logs.value.
 * Accepts "6", "6,5", "6.5".
 */
export function sleepHoursToMinutes(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const raw =
    typeof value === "string" ? value.trim().replace(",", ".") : value;
  const hours = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(hours)) {
    return null;
  }
  if (hours < 0 || hours > SLEEP_HOURS_MAX) {
    return null;
  }
  return normalizeSleepMinutes(hours * 60);
}

export function sleepMinutesToHoursLabel(minutes: number): string {
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return String(hours);
  }
  return String(Math.round(hours * 10) / 10);
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
  hours?: unknown;
}): boolean {
  const quality = normalizeSleepQuality(input.quality);
  const minutesFromHours =
    input.hours !== undefined && input.hours !== null && input.hours !== ""
      ? sleepHoursToMinutes(input.hours)
      : null;
  const minutes =
    minutesFromHours ?? normalizeSleepMinutes(input.minutes);
  return quality !== null || minutes !== null;
}
