import {
  eachDayInclusive,
  endOfWeekSundaySaoPaulo,
  isDayTogether,
  personHasCareDay,
  startOfWeekMondaySaoPaulo,
  type WeeklyCareGoal,
} from "@/lib/care/week";
import type { CareEventKind } from "@/lib/care/kinds";

export interface ProgressMemberDay {
  userId: string;
  displayName: string;
  kinds: CareEventKind[];
  hasRestDay: boolean;
  hasCare: boolean;
}

export interface ProgressDayStatus {
  day: string;
  closedTogether: boolean;
  membersWithCare: ProgressMemberDay[];
}

export interface CircleCareProgress {
  weeklyCareGoal: WeeklyCareGoal;
  weekStart: string;
  weekEnd: string;
  daysTogetherCount: number;
  dayStatuses: ProgressDayStatus[];
}

/**
 * Pure builder for weekly circle progress (no ranking).
 * Events: Map day -> userId -> kinds.
 */
export function buildCircleCareProgress(input: {
  weeklyCareGoal: WeeklyCareGoal;
  members: Array<{ userId: string; displayName: string }>;
  /** day -> userId -> kinds */
  eventsByDayUser: Map<string, Map<string, CareEventKind[]>>;
  anchorDay: string;
}): CircleCareProgress {
  const weekStart = startOfWeekMondaySaoPaulo(input.anchorDay);
  const weekEnd = endOfWeekSundaySaoPaulo(input.anchorDay);
  const days = eachDayInclusive(weekStart, weekEnd);
  const memberCount = input.members.length;

  const dayStatuses: ProgressDayStatus[] = days.map((day) => {
    const dayMap = input.eventsByDayUser.get(day) ?? new Map();
    const membersWithCare: ProgressMemberDay[] = input.members.map(
      (member) => {
        const kinds = dayMap.get(member.userId) ?? [];
        return {
          userId: member.userId,
          displayName: member.displayName,
          kinds,
          hasRestDay: kinds.includes("rest-day"),
          hasCare: personHasCareDay(kinds),
        };
      },
    );
    const withCareCount = membersWithCare.filter((m) => m.hasCare).length;
    return {
      day,
      closedTogether: isDayTogether({
        memberCount,
        membersWithCareCount: withCareCount,
      }),
      membersWithCare,
    };
  });

  const daysTogetherCount = dayStatuses.filter((d) => d.closedTogether).length;

  return {
    weeklyCareGoal: input.weeklyCareGoal,
    weekStart,
    weekEnd,
    daysTogetherCount,
    dayStatuses,
  };
}
