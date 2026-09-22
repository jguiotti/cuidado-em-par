import { todayInSaoPaulo } from "@/lib/habits/day";

/** Monday–Sunday week for America/Sao_Paulo calendar days (ISO YYYY-MM-DD). */
export function startOfWeekMondaySaoPaulo(
  dayIso: string = todayInSaoPaulo(),
): string {
  const [y, m, d] = dayIso.split("-").map(Number);
  const utc = new Date(Date.UTC(y!, m! - 1, d!, 12));
  // getUTCDay: 0 Sun … 6 Sat → Monday-based offset
  const utcDay = utc.getUTCDay();
  const offsetFromMonday = utcDay === 0 ? 6 : utcDay - 1;
  utc.setUTCDate(utc.getUTCDate() - offsetFromMonday);
  return utc.toISOString().slice(0, 10);
}

export function endOfWeekSundaySaoPaulo(
  dayIso: string = todayInSaoPaulo(),
): string {
  const start = startOfWeekMondaySaoPaulo(dayIso);
  const [y, m, d] = start.split("-").map(Number);
  const utc = new Date(Date.UTC(y!, m! - 1, d!, 12));
  utc.setUTCDate(utc.getUTCDate() + 6);
  return utc.toISOString().slice(0, 10);
}

/** Inclusive list of YYYY-MM-DD from start through end. */
export function eachDayInclusive(startIso: string, endIso: string): string[] {
  const days: string[] = [];
  const [ys, ms, ds] = startIso.split("-").map(Number);
  const cursor = new Date(Date.UTC(ys!, ms! - 1, ds!, 12));
  const [ye, me, de] = endIso.split("-").map(Number);
  const end = new Date(Date.UTC(ye!, me! - 1, de!, 12));
  while (cursor.getTime() <= end.getTime()) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export const WEEKLY_CARE_GOAL_VALUES = [3, 5, 7] as const;

export type WeeklyCareGoal = (typeof WEEKLY_CARE_GOAL_VALUES)[number];

export function isWeeklyCareGoal(value: number): value is WeeklyCareGoal {
  return (WEEKLY_CARE_GOAL_VALUES as readonly number[]).includes(value);
}

/**
 * How many members must have a care day for the circle day to close "together".
 * Pair: both. Group: floor(n/2), at least 2 when n >= 2. Solo (n < 2): never.
 */
export function togetherThreshold(memberCount: number): number {
  if (memberCount < 2) {
    return Number.POSITIVE_INFINITY;
  }
  if (memberCount === 2) {
    return 2;
  }
  return Math.max(2, Math.floor(memberCount / 2));
}

export function isDayTogether(input: {
  memberCount: number;
  membersWithCareCount: number;
}): boolean {
  const need = togetherThreshold(input.memberCount);
  return input.membersWithCareCount >= need;
}

export function personHasCareDay(kinds: readonly string[]): boolean {
  return kinds.length > 0;
}
