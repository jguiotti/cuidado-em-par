export const SLEEP_QUALITY_VALUES = ["poor", "ok", "good"] as const;

export type SleepQuality = (typeof SLEEP_QUALITY_VALUES)[number];

export function isSleepQuality(value: unknown): value is SleepQuality {
  return (
    typeof value === "string" &&
    (SLEEP_QUALITY_VALUES as readonly string[]).includes(value)
  );
}

export interface HabitPrefsSnapshot {
  waterGoalMl: number;
  waterReminderEnabled: boolean;
  sleepReminderEnabled: boolean;
  sleepTargetBedtime: string | null;
  activePauseEnabled: boolean;
  activePauseIntervalMinutes: number;
}

export interface SleepLogSnapshot {
  quality: SleepQuality | null;
  minutes: number | null;
}

export interface TodayRitualSnapshot {
  day: string;
  prefs: HabitPrefsSnapshot;
  waterMl: number;
  waterGoalMl: number;
  sleep: SleepLogSnapshot | null;
  /** @deprecated Prefer activePauseCount — kept for older callers. */
  activePauseDone: boolean;
  activePauseCount: number;
  workoutDone: boolean;
  mealDone: boolean;
  workoutCount: number;
  mealCount: number;
  hasRemindersConsent: boolean;
}

export const DEFAULT_HABIT_PREFS: HabitPrefsSnapshot = {
  waterGoalMl: 2000,
  waterReminderEnabled: true,
  sleepReminderEnabled: true,
  sleepTargetBedtime: null,
  activePauseEnabled: true,
  activePauseIntervalMinutes: 90,
};
