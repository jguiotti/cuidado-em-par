"use server";

import { revalidatePath } from "next/cache";

import {
  isCareCircleKind,
  memberLimitForKind,
  type CareCircleKind,
} from "@/lib/care/circle";
import {
  CARE_EVENT_KINDS,
  isCareEventKind,
  type CareEventKind,
} from "@/lib/care/kinds";
import { buildCircleCareProgress } from "@/lib/care/progress";
import { syncCareEventsForUserDay } from "@/lib/care/publish";
import {
  isWeeklyCareGoal,
  startOfWeekMondaySaoPaulo,
  endOfWeekSundaySaoPaulo,
  type WeeklyCareGoal,
} from "@/lib/care/week";
import { todayInSaoPaulo } from "@/lib/habits/day";
import { createClient } from "@/lib/supabase/server";

export type CareActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; code: string };

export interface CareMember {
  userId: string;
  displayName: string;
}

export interface CareCircleSnapshot {
  circleId: string;
  kind: CareCircleKind;
  name: string;
  inviteCode: string;
  members: CareMember[];
  memberLimit: number;
  isCreator: boolean;
  weeklyCareGoal: WeeklyCareGoal;
}

export interface CareFeedDay {
  day: string;
  entries: Array<{
    userId: string;
    displayName: string;
    kinds: CareEventKind[];
  }>;
}

function revalidateCircle() {
  revalidatePath("/circle");
  revalidatePath("/home");
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function mapRpcError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid_invite")) {
    return "invalid_invite";
  }
  if (lower.includes("pair_full")) {
    return "pair_full";
  }
  if (lower.includes("group_full")) {
    return "group_full";
  }
  if (lower.includes("already_in_circle")) {
    return "already_in_circle";
  }
  if (lower.includes("invalid_goal")) {
    return "invalid_goal";
  }
  if (lower.includes("not_in_circle")) {
    return "not_in_circle";
  }
  if (lower.includes("unauthenticated")) {
    return "unauthenticated";
  }
  return "save_failed";
}

export async function getMyCareCircleAction(): Promise<
  CareActionResult<CareCircleSnapshot | null>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("care_circle_members")
    .select("circle_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    console.error("getMyCareCircleAction membership", membershipError.message);
    return { ok: false, code: "load_failed" };
  }

  if (!membership) {
    return { ok: true, data: null };
  }

  const { data: circle, error: circleError } = await supabase
    .from("care_circles")
    .select("id, kind, name, invite_code, created_by, weekly_care_goal")
    .eq("id", membership.circle_id)
    .maybeSingle();

  if (circleError || !circle) {
    console.error("getMyCareCircleAction circle", circleError?.message);
    return { ok: false, code: "load_failed" };
  }

  if (!isCareCircleKind(circle.kind)) {
    return { ok: true, data: null };
  }

  const { data: memberRows, error: membersError } = await supabase
    .from("care_circle_members")
    .select("user_id")
    .eq("circle_id", circle.id);

  if (membersError) {
    console.error("getMyCareCircleAction members", membersError.message);
    return { ok: false, code: "load_failed" };
  }

  const userIds = (memberRows ?? []).map((row) => row.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("id, display_name")
    .in("id", userIds);

  if (profilesError) {
    console.error("getMyCareCircleAction profiles", profilesError.message);
    return { ok: false, code: "load_failed" };
  }

  const nameById = new Map(
    (profiles ?? []).map((row) => [
      row.id as string,
      (row.display_name?.trim() || "pessoa") as string,
    ]),
  );

  const members: CareMember[] = userIds.map((userId) => ({
    userId,
    displayName: nameById.get(userId) ?? "pessoa",
  }));

  const weeklyRaw = Number(
    (circle as { weekly_care_goal?: number | null }).weekly_care_goal ?? 3,
  );
  const weeklyCareGoal = isWeeklyCareGoal(weeklyRaw) ? weeklyRaw : 3;

  return {
    ok: true,
    data: {
      circleId: circle.id,
      kind: circle.kind,
      name: circle.name,
      inviteCode: circle.invite_code,
      members,
      memberLimit: memberLimitForKind(circle.kind),
      isCreator: circle.created_by === user.id,
      weeklyCareGoal,
    },
  };
}

async function createCircleViaRpc(
  rpcName: "create_care_pair" | "create_care_group",
  name: string | null | undefined,
): Promise<CareActionResult<{ inviteCode: string; circleId: string }>> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const { data, error } = await supabase.rpc(rpcName, {
    p_name: name?.trim() || null,
  });

  if (error) {
    console.error(rpcName, error.message);
    return { ok: false, code: mapRpcError(error.message) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.invite_code || !row?.circle_id) {
    return { ok: false, code: "save_failed" };
  }

  await syncCareEventsForUserDay(supabase, user.id);
  revalidateCircle();
  return {
    ok: true,
    data: { inviteCode: row.invite_code, circleId: row.circle_id },
  };
}

export async function createPairAction(input?: {
  name?: string | null;
}): Promise<CareActionResult<{ inviteCode: string; circleId: string }>> {
  return createCircleViaRpc("create_care_pair", input?.name);
}

export async function createGroupAction(input?: {
  name?: string | null;
}): Promise<CareActionResult<{ inviteCode: string; circleId: string }>> {
  return createCircleViaRpc("create_care_group", input?.name);
}

export async function joinCircleAction(input: {
  inviteCode: string;
}): Promise<CareActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const { error } = await supabase.rpc("join_care_circle", {
    p_invite_code: input.inviteCode.trim(),
  });

  if (error) {
    console.error("joinCircleAction", error.message);
    return { ok: false, code: mapRpcError(error.message) };
  }

  await syncCareEventsForUserDay(supabase, user.id);
  revalidateCircle();
  return { ok: true };
}

/** @deprecated use joinCircleAction — kept for Sprint 7 call sites */
export async function joinPairAction(input: {
  inviteCode: string;
}): Promise<CareActionResult> {
  return joinCircleAction(input);
}

export async function leaveCircleAction(): Promise<CareActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const snapshot = await getMyCareCircleAction();
  if (!snapshot.ok) {
    return snapshot;
  }
  if (!snapshot.data) {
    return { ok: true };
  }

  const circle = snapshot.data;

  if (circle.isCreator) {
    const { error } = await supabase
      .from("care_circles")
      .delete()
      .eq("id", circle.circleId)
      .eq("created_by", user.id);
    if (error) {
      console.error("leaveCircleAction delete circle", error.message);
      return { ok: false, code: "save_failed" };
    }
  } else {
    const { error } = await supabase
      .from("care_circle_members")
      .delete()
      .eq("circle_id", circle.circleId)
      .eq("user_id", user.id);
    if (error) {
      console.error("leaveCircleAction leave", error.message);
      return { ok: false, code: "save_failed" };
    }
  }

  revalidateCircle();
  return { ok: true };
}

/** @deprecated use leaveCircleAction */
export async function leavePairAction(): Promise<CareActionResult> {
  return leaveCircleAction();
}

export async function listCareFeedAction(input?: {
  days?: number;
}): Promise<CareActionResult<CareFeedDay[]>> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const days = Math.min(14, Math.max(1, input?.days ?? 7));
  const circleResult = await getMyCareCircleAction();
  if (!circleResult.ok) {
    return { ok: false, code: circleResult.code };
  }
  if (!circleResult.data) {
    return { ok: true, data: [] };
  }

  const circle = circleResult.data;
  const end = todayInSaoPaulo();
  const startDate = new Date(`${end}T12:00:00.000Z`);
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
  const start = startDate.toISOString().slice(0, 10);

  const { data: events, error } = await supabase
    .from("care_events")
    .select("user_id, day, kind")
    .eq("circle_id", circle.circleId)
    .gte("day", start)
    .lte("day", end)
    .order("day", { ascending: false });

  if (error) {
    console.error("listCareFeedAction", error.message);
    return { ok: false, code: "load_failed" };
  }

  const nameById = new Map(
    circle.members.map((member) => [member.userId, member.displayName]),
  );

  const byDay = new Map<string, Map<string, Set<CareEventKind>>>();

  for (const event of events ?? []) {
    if (!isCareEventKind(event.kind)) {
      continue;
    }
    if (!byDay.has(event.day)) {
      byDay.set(event.day, new Map());
    }
    const dayMap = byDay.get(event.day)!;
    if (!dayMap.has(event.user_id)) {
      dayMap.set(event.user_id, new Set());
    }
    dayMap.get(event.user_id)!.add(event.kind);
  }

  const dayList: string[] = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(`${end}T12:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - i);
    dayList.push(d.toISOString().slice(0, 10));
  }

  const feed: CareFeedDay[] = dayList.map((day) => {
    const dayMap = byDay.get(day) ?? new Map();
    const entries = circle.members.map((member) => {
      const kindsSet = dayMap.get(member.userId) ?? new Set<CareEventKind>();
      return {
        userId: member.userId,
        displayName: nameById.get(member.userId) ?? member.displayName,
        kinds: CARE_EVENT_KINDS.filter((kind) => kindsSet.has(kind)),
      };
    });
    return { day, entries };
  });

  return { ok: true, data: feed };
}

export async function getCircleCareProgressAction(): Promise<
  CareActionResult<ReturnType<typeof buildCircleCareProgress> | null>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const circleResult = await getMyCareCircleAction();
  if (!circleResult.ok) {
    return { ok: false, code: circleResult.code };
  }
  if (!circleResult.data) {
    return { ok: true, data: null };
  }

  const circle = circleResult.data;
  const anchor = todayInSaoPaulo();
  const weekStart = startOfWeekMondaySaoPaulo(anchor);
  const weekEnd = endOfWeekSundaySaoPaulo(anchor);

  const { data: events, error } = await supabase
    .from("care_events")
    .select("user_id, day, kind")
    .eq("circle_id", circle.circleId)
    .gte("day", weekStart)
    .lte("day", weekEnd);

  if (error) {
    console.error("getCircleCareProgressAction", error.message);
    return { ok: false, code: "load_failed" };
  }

  const eventsByDayUser = new Map<string, Map<string, CareEventKind[]>>();
  for (const event of events ?? []) {
    if (!isCareEventKind(event.kind)) {
      continue;
    }
    if (!eventsByDayUser.has(event.day)) {
      eventsByDayUser.set(event.day, new Map());
    }
    const dayMap = eventsByDayUser.get(event.day)!;
    const list = dayMap.get(event.user_id) ?? [];
    if (!list.includes(event.kind)) {
      list.push(event.kind);
    }
    dayMap.set(event.user_id, list);
  }

  // Normalize kind order
  for (const dayMap of eventsByDayUser.values()) {
    for (const [userId, kinds] of dayMap) {
      dayMap.set(
        userId,
        CARE_EVENT_KINDS.filter((kind) => kinds.includes(kind)),
      );
    }
  }

  const progress = buildCircleCareProgress({
    weeklyCareGoal: circle.weeklyCareGoal,
    members: circle.members,
    eventsByDayUser,
    anchorDay: anchor,
  });

  return { ok: true, data: progress };
}

export async function updateCircleWeeklyGoalAction(input: {
  goal: number;
}): Promise<CareActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!isWeeklyCareGoal(input.goal)) {
    return { ok: false, code: "invalid_goal" };
  }

  const { error } = await supabase.rpc("set_circle_weekly_care_goal", {
    p_goal: input.goal,
  });

  if (error) {
    console.error("updateCircleWeeklyGoalAction", error.message);
    return { ok: false, code: mapRpcError(error.message) };
  }

  revalidateCircle();
  return { ok: true };
}

export async function markRestDayAction(): Promise<CareActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();
  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      day,
      kind: "rest-day",
      value: 1,
      sleep_quality: null,
      content_id: null,
      content_key: "",
    },
    { onConflict: "user_id,day,kind,content_key" },
  );

  if (error) {
    console.error("markRestDayAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  await syncCareEventsForUserDay(supabase, user.id, day);
  revalidateCircle();
  return { ok: true };
}

export async function unmarkRestDayAction(): Promise<CareActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("kind", "rest-day")
    .eq("content_key", "");

  if (error) {
    console.error("unmarkRestDayAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  await syncCareEventsForUserDay(supabase, user.id, day);
  revalidateCircle();
  return { ok: true };
}

export async function getRestDayTodayAction(): Promise<
  CareActionResult<{ marked: boolean }>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();
  const { data, error } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("kind", "rest-day")
    .eq("content_key", "")
    .maybeSingle();

  if (error) {
    console.error("getRestDayTodayAction", error.message);
    return { ok: false, code: "load_failed" };
  }

  return { ok: true, data: { marked: Boolean(data) } };
}

export interface CareNudgeRow {
  fromUserId: string;
  fromDisplayName: string;
  toUserId: string;
}

export async function listCareNudgesTodayAction(): Promise<
  CareActionResult<CareNudgeRow[]>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const circleResult = await getMyCareCircleAction();
  if (!circleResult.ok) {
    return { ok: false, code: circleResult.code };
  }
  if (!circleResult.data) {
    return { ok: true, data: [] };
  }

  const day = todayInSaoPaulo();
  const { data, error } = await supabase
    .from("care_nudges")
    .select("from_user_id, to_user_id")
    .eq("circle_id", circleResult.data.circleId)
    .eq("day", day);

  if (error) {
    console.error("listCareNudgesTodayAction", error.message);
    return { ok: false, code: "load_failed" };
  }

  const nameById = new Map(
    circleResult.data.members.map((m) => [m.userId, m.displayName]),
  );

  return {
    ok: true,
    data: (data ?? []).map((row) => ({
      fromUserId: row.from_user_id,
      fromDisplayName: nameById.get(row.from_user_id) ?? "pessoa",
      toUserId: row.to_user_id,
    })),
  };
}

export async function sendCareNudgeAction(input: {
  toUserId: string;
}): Promise<CareActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const circleResult = await getMyCareCircleAction();
  if (!circleResult.ok) {
    return { ok: false, code: circleResult.code };
  }
  if (!circleResult.data) {
    return { ok: false, code: "not_in_circle" };
  }

  const mate = circleResult.data.members.find(
    (member) => member.userId === input.toUserId,
  );
  if (!mate || mate.userId === user.id) {
    return { ok: false, code: "not_mate" };
  }

  const day = todayInSaoPaulo();
  const { error } = await supabase.from("care_nudges").insert({
    circle_id: circleResult.data.circleId,
    from_user_id: user.id,
    to_user_id: input.toUserId,
    day,
  });

  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      return { ok: false, code: "already_sent" };
    }
    console.error("sendCareNudgeAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateCircle();
  return { ok: true };
}
