"use server";

import { revalidatePath } from "next/cache";

import { todayInSaoPaulo } from "@/lib/habits/day";
import { createClient } from "@/lib/supabase/server";

export type ProgressResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; code: string };

export interface ProgressDayStats {
  day: string;
  waterMl: number;
  hasSleep: boolean;
  pauseCount: number;
  workoutCount: number;
  mealCount: number;
  cardioMinutes: number;
  cardioDistanceM: number;
}

export interface BodyMeasurementRow {
  recordedOn: string;
  weightKg: number | null;
  waistCm: number | null;
  hipCm: number | null;
}

export interface ProgressSnapshot {
  days: ProgressDayStats[];
  rangeDays: number;
  careDays: number;
  totalCardioMinutes: number;
  totalCardioDistanceM: number;
  measurements: BodyMeasurementRow[];
  hasBiometricsConsent: boolean;
  currentWeightKg: number | null;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function hasBiometricsConsent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("lgpd_consent_logs")
    .select("accepted")
    .eq("user_id", userId)
    .eq("purpose", "biometrics")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.accepted === true;
}

function addDaysIso(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d!, 12));
  date.setUTCDate(date.getUTCDate() + delta);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export async function getProgressSnapshotAction(
  rangeDays: 7 | 30 = 7,
): Promise<ProgressResult<ProgressSnapshot>> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const today = todayInSaoPaulo();
  const from = addDaysIso(today, -(rangeDays - 1));
  const biometricsConsent = await hasBiometricsConsent(supabase, user.id);

  const [logsResult, measurementsResult, biometricResult] = await Promise.all([
    supabase
      .from("habit_logs")
      .select("day, kind, value, distance_m")
      .eq("user_id", user.id)
      .gte("day", from)
      .lte("day", today)
      .order("day", { ascending: true }),
    biometricsConsent
      ? supabase
          .from("user_body_measurements")
          .select("recorded_on, weight_kg, waist_cm, hip_cm")
          .eq("user_id", user.id)
          .gte("recorded_on", from)
          .lte("recorded_on", today)
          .order("recorded_on", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    biometricsConsent
      ? supabase
          .from("user_biometrics")
          .select("weight_kg")
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (logsResult.error) {
    console.error("getProgressSnapshotAction logs", logsResult.error.message);
    return { ok: false, code: "load_failed" };
  }

  const byDay = new Map<string, ProgressDayStats>();
  for (let i = 0; i < rangeDays; i += 1) {
    const day = addDaysIso(from, i);
    byDay.set(day, {
      day,
      waterMl: 0,
      hasSleep: false,
      pauseCount: 0,
      workoutCount: 0,
      mealCount: 0,
      cardioMinutes: 0,
      cardioDistanceM: 0,
    });
  }

  for (const log of logsResult.data ?? []) {
    const stats = byDay.get(log.day);
    if (!stats) {
      continue;
    }
    if (log.kind === "water") {
      stats.waterMl = typeof log.value === "number" ? log.value : 0;
    } else if (log.kind === "sleep") {
      stats.hasSleep = true;
    } else if (log.kind === "active-pause") {
      stats.pauseCount =
        typeof log.value === "number" && log.value > 0
          ? Math.round(log.value)
          : 1;
    } else if (log.kind === "workout") {
      stats.workoutCount += 1;
    } else if (log.kind === "meal") {
      stats.mealCount += 1;
    } else if (log.kind === "cardio") {
      if (typeof log.value === "number") {
        stats.cardioMinutes += Math.max(0, Math.round(log.value));
      }
      if (typeof log.distance_m === "number") {
        stats.cardioDistanceM += Math.max(0, Math.round(log.distance_m));
      }
    }
  }

  const days = Array.from(byDay.values());
  const careDays = days.filter(
    (day) =>
      day.waterMl > 0 ||
      day.hasSleep ||
      day.pauseCount > 0 ||
      day.workoutCount > 0 ||
      day.mealCount > 0 ||
      day.cardioMinutes > 0,
  ).length;

  const measurements: BodyMeasurementRow[] = (measurementsResult.data ?? []).map(
    (row) => ({
      recordedOn: row.recorded_on,
      weightKg:
        row.weight_kg != null ? Number(row.weight_kg) : null,
      waistCm: row.waist_cm != null ? Number(row.waist_cm) : null,
      hipCm: row.hip_cm != null ? Number(row.hip_cm) : null,
    }),
  );

  return {
    ok: true,
    data: {
      days,
      rangeDays,
      careDays,
      totalCardioMinutes: days.reduce((sum, day) => sum + day.cardioMinutes, 0),
      totalCardioDistanceM: days.reduce(
        (sum, day) => sum + day.cardioDistanceM,
        0,
      ),
      measurements,
      hasBiometricsConsent: biometricsConsent,
      currentWeightKg:
        biometricResult.data?.weight_kg != null
          ? Number(biometricResult.data.weight_kg)
          : null,
    },
  };
}

export async function upsertBodyMeasurementAction(input: {
  recordedOn?: string;
  weightKg?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
}): Promise<ProgressResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await hasBiometricsConsent(supabase, user.id))) {
    return { ok: false, code: "consent_required" };
  }

  const recordedOn =
    input.recordedOn && /^\d{4}-\d{2}-\d{2}$/.test(input.recordedOn)
      ? input.recordedOn
      : todayInSaoPaulo();

  const weightKg =
    input.weightKg == null || input.weightKg === undefined
      ? null
      : Number(input.weightKg);
  const waistCm =
    input.waistCm == null || input.waistCm === undefined
      ? null
      : Number(input.waistCm);
  const hipCm =
    input.hipCm == null || input.hipCm === undefined
      ? null
      : Number(input.hipCm);

  if (weightKg == null && waistCm == null && hipCm == null) {
    return { ok: false, code: "empty_measurement" };
  }
  if (weightKg != null && (weightKg <= 0 || weightKg > 500)) {
    return { ok: false, code: "invalid_weight" };
  }
  if (waistCm != null && (waistCm <= 0 || waistCm > 300)) {
    return { ok: false, code: "invalid_waist" };
  }
  if (hipCm != null && (hipCm <= 0 || hipCm > 300)) {
    return { ok: false, code: "invalid_hip" };
  }

  const { error } = await supabase.from("user_body_measurements").upsert(
    {
      user_id: user.id,
      recorded_on: recordedOn,
      weight_kg: weightKg,
      waist_cm: waistCm,
      hip_cm: hipCm,
    },
    { onConflict: "user_id,recorded_on" },
  );

  if (error) {
    console.error("upsertBodyMeasurementAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  if (weightKg != null) {
    await supabase.from("user_biometrics").upsert(
      {
        user_id: user.id,
        weight_kg: weightKg,
      },
      { onConflict: "user_id" },
    );
  }

  revalidatePath("/progress");
  revalidatePath("/account");
  revalidatePath("/home");
  return { ok: true };
}
