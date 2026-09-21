"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  leaveCircleAction,
  type CareCircleSnapshot,
  type CareFeedDay,
} from "@/app/actions/care-circle";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { circleCopy } from "@/lib/i18n/circle-pt-br";
import type { CareEventKind } from "@/lib/care/kinds";

interface CircleActivePanelProps {
  circle: CareCircleSnapshot;
  feed: CareFeedDay[];
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
  currentUserId,
}: CircleActivePanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isWaiting = circle.members.length < 2;
  const canInviteMore = circle.members.length < circle.memberLimit;
  const todayFeed = feed[0] ?? null;
  const history = feed.slice(1);
  const kindLabelText =
    circle.kind === "group" ? circleCopy.kindGroup : circleCopy.kindPair;

  function handleCopy() {
    setCopyMessage(null);
    void navigator.clipboard.writeText(circle.inviteCode).then(
      () => setCopyMessage(circleCopy.copied),
      () => setError(circleCopy.errors.generic),
    );
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
          {circle.members.map((member) => (
            <li
              key={member.userId}
              className="rounded-[var(--radius-soft)] bg-surface-raised px-4 py-3 text-base text-ink"
            >
              {member.userId === currentUserId
                ? `${member.displayName} (${circleCopy.you})`
                : member.displayName}
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
            variant="secondary"
            disabled={isPending}
            onClick={() => setConfirmLeave(true)}
            className="w-full"
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
                disabled={isPending}
                onClick={handleLeave}
                className="w-full bg-blush-deep text-ink hover:opacity-90"
              >
                {circleCopy.leaveCta}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={() => setConfirmLeave(false)}
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
