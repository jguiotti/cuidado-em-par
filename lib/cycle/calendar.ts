/**
 * Menstrual calendar estimates (calendar method).
 * Educational self-care only — not a fertility diagnosis or medical advice.
 */

import { TAG_SLUGS } from "@/lib/tags/constants";

export type CycleDayKind =
  | "period"
  | "fertile"
  | "ovulation"
  | "follicular"
  | "luteal"
  | "predicted-period"
  | "late"
  | "none";

export interface CycleProfileInput {
  lastPeriodStart: string | null;
  averageCycleLengthDays: number;
  averagePeriodLengthDays: number;
  today?: string;
}

export interface CycleDayInfo {
  isoDate: string;
  kind: CycleDayKind;
  cycleDay: number | null;
}

export interface CycleReminderFlags {
  periodApproaching: boolean;
  fertileStarting: boolean;
  lateOrPossiblePregnancy: boolean;
  daysUntilPredictedPeriod: number | null;
  daysLate: number | null;
}

function parseIsoDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!, 12));
}

function toIsoDay(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysIso(iso: string, days: number): string {
  const date = parseIsoDay(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDay(date);
}

export function diffDaysIso(fromIso: string, toIso: string): number {
  const from = parseIsoDay(fromIso).getTime();
  const to = parseIsoDay(toIso).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function clampCycleLength(days: number): number {
  return Math.min(45, Math.max(21, Math.round(days)));
}

export function clampPeriodLength(days: number): number {
  return Math.min(10, Math.max(2, Math.round(days)));
}

/** Classic estimate: ovulation ~ cycleLength - 14; fertile window ±4 around ovulation. */
export function fertileWindowBounds(cycleLength: number): {
  fertileStartDay: number;
  fertileEndDay: number;
  ovulationDay: number;
} {
  const length = clampCycleLength(cycleLength);
  const ovulationDay = Math.max(10, length - 14);
  const fertileStartDay = Math.max(8, ovulationDay - 4);
  const fertileEndDay = Math.min(length - 1, ovulationDay + 1);
  return { fertileStartDay, fertileEndDay, ovulationDay };
}

export function cycleDayNumber(
  lastPeriodStart: string,
  isoDate: string,
  cycleLength: number,
): number {
  const length = clampCycleLength(cycleLength);
  const diff = diffDaysIso(lastPeriodStart, isoDate);
  if (diff < 0) {
    return ((diff % length) + length) % length + 1;
  }
  return (diff % length) + 1;
}

export function classifyCycleDay(
  input: CycleProfileInput,
  isoDate: string,
): CycleDayInfo {
  if (!input.lastPeriodStart) {
    return { isoDate, kind: "none", cycleDay: null };
  }

  const cycleLength = clampCycleLength(input.averageCycleLengthDays);
  const periodLength = clampPeriodLength(input.averagePeriodLengthDays);
  const today = input.today ?? isoDate;
  const dayNum = cycleDayNumber(input.lastPeriodStart, isoDate, cycleLength);
  const { fertileStartDay, fertileEndDay, ovulationDay } =
    fertileWindowBounds(cycleLength);

  const daysSinceStart = diffDaysIso(input.lastPeriodStart, isoDate);
  const expectedNext = addDaysIso(input.lastPeriodStart, cycleLength);
  const isPastExpected =
    daysSinceStart >= cycleLength && isoDate <= today;

  if (isPastExpected && isoDate === today) {
    return { isoDate, kind: "late", cycleDay: dayNum };
  }

  if (dayNum <= periodLength) {
    return { isoDate, kind: "period", cycleDay: dayNum };
  }

  if (dayNum === ovulationDay) {
    return { isoDate, kind: "ovulation", cycleDay: dayNum };
  }

  if (dayNum >= fertileStartDay && dayNum <= fertileEndDay) {
    return { isoDate, kind: "fertile", cycleDay: dayNum };
  }

  if (isoDate === expectedNext || (dayNum >= cycleLength - 1 && dayNum <= cycleLength)) {
    if (dayNum > periodLength && isoDate >= expectedNext) {
      return { isoDate, kind: "predicted-period", cycleDay: dayNum };
    }
  }

  // Predicted period days around expected next start when viewing future
  if (
    diffDaysIso(expectedNext, isoDate) >= 0 &&
    diffDaysIso(expectedNext, isoDate) < periodLength
  ) {
    return { isoDate, kind: "predicted-period", cycleDay: dayNum };
  }

  if (dayNum < fertileStartDay) {
    return { isoDate, kind: "follicular", cycleDay: dayNum };
  }

  return { isoDate, kind: "luteal", cycleDay: dayNum };
}

export function buildMonthGrid(
  year: number,
  monthIndex0: number,
  input: CycleProfileInput,
): CycleDayInfo[] {
  const first = new Date(Date.UTC(year, monthIndex0, 1, 12));
  const daysInMonth = new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
  const cells: CycleDayInfo[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = toIsoDay(new Date(Date.UTC(year, monthIndex0, day, 12)));
    cells.push(classifyCycleDay(input, iso));
  }
  void first;
  return cells;
}

export function reminderFlagsForToday(
  input: CycleProfileInput,
): CycleReminderFlags {
  const empty: CycleReminderFlags = {
    periodApproaching: false,
    fertileStarting: false,
    lateOrPossiblePregnancy: false,
    daysUntilPredictedPeriod: null,
    daysLate: null,
  };

  if (!input.lastPeriodStart) {
    return empty;
  }

  const today = input.today ?? toIsoDay(new Date());
  const cycleLength = clampCycleLength(input.averageCycleLengthDays);
  const expectedNext = addDaysIso(input.lastPeriodStart, cycleLength);
  const daysUntil = diffDaysIso(today, expectedNext);
  const daysLate = daysUntil < 0 ? Math.abs(daysUntil) : null;
  const dayNum = cycleDayNumber(input.lastPeriodStart, today, cycleLength);
  const { fertileStartDay } = fertileWindowBounds(cycleLength);

  return {
    periodApproaching: daysUntil >= 1 && daysUntil <= 3,
    fertileStarting: dayNum === fertileStartDay || dayNum === fertileStartDay - 1,
    lateOrPossiblePregnancy: daysLate != null && daysLate >= 5,
    daysUntilPredictedPeriod: daysUntil >= 0 ? daysUntil : null,
    daysLate,
  };
}

/** Phase tags for the motor on a given day. */
export function phaseTagsForDay(
  input: CycleProfileInput,
  isoDate: string,
  mode: "menstrual-cycle" | "pregnancy" | "postpartum",
  pregnancyTrimester?: 1 | 2 | 3,
): string[] {
  if (mode === "pregnancy") {
    if (pregnancyTrimester === 2) {
      return [TAG_SLUGS.pregnancyTrimester2];
    }
    if (pregnancyTrimester === 3) {
      return [TAG_SLUGS.pregnancyTrimester3];
    }
    return [TAG_SLUGS.pregnancyTrimester1];
  }
  if (mode === "postpartum") {
    return [TAG_SLUGS.postpartum];
  }

  const tags = new Set<string>([TAG_SLUGS.cycleActive]);
  const info = classifyCycleDay(input, isoDate);
  switch (info.kind) {
    case "period":
      tags.add(TAG_SLUGS.menstrualPhase);
      break;
    case "follicular":
      tags.add(TAG_SLUGS.follicularPhase);
      break;
    case "fertile":
    case "ovulation":
      tags.add(TAG_SLUGS.ovulation);
      break;
    case "luteal":
    case "predicted-period":
    case "late":
      tags.add(TAG_SLUGS.lutealPhase);
      break;
    default:
      break;
  }
  return Array.from(tags);
}
