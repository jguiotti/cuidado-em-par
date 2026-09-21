/** Calendar day for habit_logs, always America/Sao_Paulo. */
export const HABIT_DAY_TIMEZONE = "America/Sao_Paulo" as const;

/**
 * Returns YYYY-MM-DD for the given instant in America/Sao_Paulo.
 * Used by all habit kinds (water, sleep, pause, workout, meal).
 */
export function todayInSaoPaulo(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: HABIT_DAY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Validates a YYYY-MM-DD string (strict). */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
