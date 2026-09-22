"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  leaveCircleAction,
  sendCareNudgeAction,
  updateCircleWeeklyGoalAction,
  type CareCircleSnapshot,
  type CareFeedDay,
  type CareNudgeRow,
} from "@/app/actions/care-circle";
import type { CircleCareProgress } from "@/lib/care/progress";
import { WEEKLY_CARE_GOAL_VALUES } from "@/lib/care/week";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { circleCopy } from "@/lib/i18n/circle-pt-br";
import type { CareEventKind } from "@/lib/care/kinds";

interface CircleActivePanelProps {
  circle: CareCircleSnapshot;
  feed: CareFeedDay[];
  progress: CircleCareProgress | null;
  nudges: CareNudgeRow[];
  currentUserId: string;
}

function formatDayLabel(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  if (!year || !month || !date) {
    return day;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(Date.UTC(year, month - 1, date, 12)));
}

function kindLabel(kind: CareEventKind): string {
  return circleCopy.kinds[kind];
}

export function CircleActivePanel({
  circle,
  feed,
  progress,
  nudges,
  currentUserId,
}: CircleActivePanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [goalMessage, setGoalMessage] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [goal, setGoal] = useState(circle.weeklyCareGoal);
  const [isPending, startTransition] = useTransition();
  const isWaiting = circle.members.length < 2;
  const canInviteMore = circle.members.length < circle.memberLimit;
  const todayFeed = feed[0] ?? null;
  const history = feed.slice(1);
  const kindLabelText =
    circle.kind === "group" ? circleCopy.kindGroup : circleCopy.kindPair;

  const sentTo = new Set(
    nudges
      .filter((n) => n.fromUserId === currentUserId)
      .map((n) => n.toUserId),
  );
  const receivedFrom = nudges.filter((n) => n.toUserId === currentUserId);

  const todayProgress = progress?.dayStatuses.find(
    (status) => status.day === (todayFeed?.day ?? ""),
  );

  function handleCopy() {
    setCopyMessage(null);
    void navigator.clipboard.writeText(circle.inviteCode).then(
      () => setCopyMessage(circleCopy.copied),
      () => setError(circleCopy.errors.generic),
    );
  }

  function handleSaveGoal() {
    setError(null);
    setGoalMessage(null);
    startTransition(async () => {
      const result = await updateCircleWeeklyGoalAction({ goal });
      if (!result.ok) {
        setError(
          result.code === "invalid_goal"
            ? circleCopy.errors.invalid_goal
            : circleCopy.errors.generic,
        );
        return;
      }
      setGoalMessage(circleCopy.goalSaved);
      router.refresh();
    });
  }

  function handleNudge(toUserId: string) {
    setError(null);
    startTransition(async () => {
      const result = await sendCareNudgeAction({ toUserId });
      if (!result.ok) {
        if (result.code === "already_sent") {
          setError(circleCopy.errors.already_sent);
          return;
        }
        setError(circleCopy.errors.generic);
        return;
      }
      router.refresh();
    });
  }

  function handleLeave() {
    setError(null);
    startTransition(async () => {
      const result = await leaveCircleAction();
      if (!result.ok) {
        setError(circleCopy.errors.generic);
        return;
      }
      setConfirmLeave(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {progress ? (
        <Surface className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-ink">
              {circleCopy.progressTitle}
            </h2>
            <p className="text-base font-semibold text-mint-deep">
              {circleCopy.progressSupport(
                progress.daysTogetherCount,
                progress.weeklyCareGoal,
              )}
            </p>
            <div
              className="h-3 overflow-hidden rounded-[var(--radius-pill)] bg-surface-raised"
              role="progressbar"
              aria-valuenow={progress.daysTogetherCount}
              aria-valuemin={0}
              aria-valuemax={progress.weeklyCareGoal}
              aria-label={circleCopy.progressTitle}
            >
              <div
                className="h-full rounded-[var(--radius-pill)] bg-mint-deep transition-[width]"
                style={{
                  width: `${Math.min(
                    100,
                    (progress.daysTogetherCount / progress.weeklyCareGoal) * 100,
                  )}%`,
                }}
              />
            </div>
            {progress.daysTogetherCount >= progress.weeklyCareGoal ? (
              <p className="text-sm leading-relaxed text-ink-soft">
                {circleCopy.progressMet}
              </p>
            ) : null}
            {todayProgress ? (
              <p className="text-sm text-ink-soft">
                {todayProgress.closedTogether
                  ? circleCopy.togetherToday
                  : circleCopy.togetherOpen}
              </p>
            ) : null}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-ink">
              {circleCopy.goalLegend}
            </legend>
            <p className="text-sm leading-relaxed text-ink-soft">
              {circleCopy.goalHint}
            </p>
            <div className="flex flex-wrap gap-2">
              {WEEKLY_CARE_GOAL_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGoal(value)}
                  className={`focus-ring min-h-11 rounded-[var(--radius-soft)] px-4 text-sm font-semibold ${
                    goal === value
                      ? "bg-mint text-ink"
                      : "bg-surface-raised text-ink-soft"
                  }`}
                  aria-pressed={goal === value}
                  disabled={isPending}
                >
                  {circleCopy.goalOptions[value]}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveGoal}
              disabled={isPending || goal === circle.weeklyCareGoal}
              className="w-full"
            >
              {circleCopy.goalSave}
            </Button>
            {goalMessage ? (
              <p className="text-sm text-ink-soft" role="status">
                {goalMessage}
              </p>
            ) : null}
          </fieldset>
        </Surface>
      ) : null}

      {receivedFrom.length > 0 ? (
        <Surface className="space-y-2 bg-blush/40">
          {receivedFrom.map((nudge) => (
            <p
              key={`${nudge.fromUserId}-${nudge.toUserId}`}
              className="text-sm font-semibold text-ink"
            >
              {circleCopy.nudgeReceived(nudge.fromDisplayName)}
            </p>
          ))}
        </Surface>
      ) : null}

      <Surface className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink">{circle.name}</h2>
          <span className="text-sm font-medium text-mint-deep">
            {kindLabelText}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          {circleCopy.privacy}
        </p>
        <p className="text-sm font-medium text-ink-soft">
          {circleCopy.membersCount(
            circle.members.length,
            circle.memberLimit,
          )}
        </p>

        {canInviteMore ? (
          <div className="space-y-3">
            {isWaiting ? (
              <p className="text-sm leading-relaxed text-ink-soft">
                {circleCopy.waiting}
              </p>
            ) : null}
            <p className="text-base font-semibold tracking-wide text-ink">
              {circleCopy.codeLabel}: {circle.inviteCode}
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCopy}
              className="w-full"
            >
              {circleCopy.copyCode}
            </Button>
            {copyMessage ? (
              <p className="text-sm text-ink-soft" role="status">
                {copyMessage}
              </p>
            ) : null}
          </div>
        ) : null}
      </Surface>

      <Surface className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">{circleCopy.members}</h2>
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {[...circle.members]
            .sort((a, b) =>
              a.displayName.localeCompare(b.displayName, "pt-BR"),
            )
            .map((member) => (
              <li
                key={member.userId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-soft)] bg-surface-raised px-4 py-3"
              >
                <span className="text-base text-ink">
                  {member.userId === currentUserId
                    ? `${member.displayName} (${circleCopy.you})`
                    : member.displayName}
                </span>
                {member.userId !== currentUserId ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-11 px-3 text-sm"
                    disabled={isPending || sentTo.has(member.userId)}
                    onClick={() => handleNudge(member.userId)}
                  >
                    {sentTo.has(member.userId)
                      ? circleCopy.nudgeSent
                      : circleCopy.nudgeSend}
                  </Button>
                ) : null}
              </li>
            ))}
        </ul>
      </Surface>

      {todayFeed ? (
        <Surface className="space-y-4">
          <h2 className="text-xl font-semibold text-ink">{circleCopy.today}</h2>
          {todayFeed.entries.map((entry) => (
            <div key={entry.userId} className="space-y-2">
              <p className="font-semibold text-ink">
                {entry.userId === currentUserId
                  ? `${entry.displayName} (${circleCopy.you})`
                  : entry.displayName}
              </p>
              {entry.kinds.length === 0 ? (
                <p className="text-sm text-ink-soft">{circleCopy.dayEmpty}</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {entry.kinds.map((kind) => (
                    <li
                      key={kind}
                      className="rounded-[var(--radius-soft)] bg-mint px-3 py-2 text-sm font-medium text-ink"
                    >
                      {kindLabel(kind)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Surface>
      ) : null}

      {history.length > 0 ? (
        <Surface className="space-y-4">
          <h2 className="text-xl font-semibold text-ink">
            {circleCopy.history}
          </h2>
          {history.map((day) => (
            <div key={day.day} className="space-y-2">
              <p className="text-sm font-semibold text-mint-deep">
                {formatDayLabel(day.day)}
              </p>
              {day.entries.every((entry) => entry.kinds.length === 0) ? (
                <p className="text-sm text-ink-soft">{circleCopy.dayEmpty}</p>
              ) : (
                <ul className="space-y-2">
                  {day.entries.map((entry) =>
                    entry.kinds.length === 0 ? null : (
                      <li key={entry.userId} className="text-sm text-ink-soft">
                        <span className="font-medium text-ink">
                          {entry.displayName}:{" "}
                        </span>
                        {entry.kinds.map(kindLabel).join(", ")}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          ))}
        </Surface>
      ) : null}

      <Surface className="space-y-3">
        {!confirmLeave ? (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setConfirmLeave(true)}
            disabled={isPending}
          >
            {circleCopy.leave}
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-ink-soft">
              {circleCopy.leaveConfirm}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={handleLeave}
                disabled={isPending}
                className="w-full"
              >
                {circleCopy.leaveCta}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmLeave(false)}
                disabled={isPending}
                className="w-full"
              >
                {circleCopy.cancel}
              </Button>
            </div>
          </div>
        )}
      </Surface>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </div>
  );
}
