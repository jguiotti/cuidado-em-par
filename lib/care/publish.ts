import {
  deriveCareEventKinds,
  type CareEventKind,
} from "@/lib/care/kinds";
import { todayInSaoPaulo } from "@/lib/habits/day";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/**
 * Syncs aggregated care_events for the user across all circles they belong to.
 * Safe to call after any habit mutation. Never writes ml, sleep quality, or content ids.
 */
export async function syncCareEventsForUserDay(
  supabase: SupabaseServer,
  userId: string,
  day: string = todayInSaoPaulo(),
): Promise<void> {
  const [membersResult, logsResult, prefsResult] = await Promise.all([
    supabase
      .from("care_circle_members")
      .select("circle_id")
      .eq("user_id", userId),
    supabase
      .from("habit_logs")
      .select("kind, value, content_id")
      .eq("user_id", userId)
      .eq("day", day),
    supabase
      .from("user_habit_prefs")
      .select("water_goal_ml")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (membersResult.error) {
    console.error("syncCareEvents members", membersResult.error.message);
    return;
  }

  const circleIds = (membersResult.data ?? []).map((row) => row.circle_id);
  if (circleIds.length === 0) {
    return;
  }

  if (logsResult.error) {
    console.error("syncCareEvents logs", logsResult.error.message);
    return;
  }

  const waterGoalMl = prefsResult.data?.water_goal_ml ?? 2000;
  const desired = new Set(
    deriveCareEventKinds({
      logs: logsResult.data ?? [],
      waterGoalMl,
    }),
  );

  for (const circleId of circleIds) {
    const { data: existing, error: existingError } = await supabase
      .from("care_events")
      .select("kind")
      .eq("circle_id", circleId)
      .eq("user_id", userId)
      .eq("day", day);

    if (existingError) {
      console.error("syncCareEvents existing", existingError.message);
      continue;
    }

    const existingKinds = new Set(
      (existing ?? []).map((row) => row.kind as CareEventKind),
    );

    for (const kind of desired) {
      if (existingKinds.has(kind)) {
        continue;
      }
      const { error } = await supabase.from("care_events").insert({
        circle_id: circleId,
        user_id: userId,
        day,
        kind,
      });
      if (error && !/duplicate|unique/i.test(error.message)) {
        console.error("syncCareEvents insert", error.message);
      }
    }

    for (const kind of existingKinds) {
      if (desired.has(kind)) {
        continue;
      }
      const { error } = await supabase
        .from("care_events")
        .delete()
        .eq("circle_id", circleId)
        .eq("user_id", userId)
        .eq("day", day)
        .eq("kind", kind);
      if (error) {
        console.error("syncCareEvents delete", error.message);
      }
    }
  }
}
