"use client";

import Link from "next/link";
import { useEffect } from "react";

import { InlineAlert } from "@/components/ui/inline-alert";
import type { CycleReminderFlags } from "@/lib/cycle/calendar";
import { todayInSaoPaulo } from "@/lib/habits/day";
import { accountCopy } from "@/lib/i18n/account-pt-br";

interface CycleRemindersBannerProps {
  reminders: CycleReminderFlags;
  remindPeriodApproaching: boolean;
  remindFertileWindow: boolean;
  remindLateOrPossiblePregnancy: boolean;
}

function notifyOnce(tag: string, title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }
  if (Notification.permission !== "granted") {
    return;
  }
  const day = todayInSaoPaulo();
  const key = `cycle-reminder:${tag}:${day}`;
  try {
    if (window.localStorage.getItem(key) === "1") {
      return;
    }
    window.localStorage.setItem(key, "1");
  } catch {
    // ignore storage failures
  }

  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_HABIT_REMINDER",
      title,
      body,
      tag,
    });
    return;
  }
  void new Notification(title, { body, tag });
}

export function CycleRemindersBanner({
  reminders,
  remindPeriodApproaching,
  remindFertileWindow,
  remindLateOrPossiblePregnancy,
}: CycleRemindersBannerProps) {
  const showPeriod =
    remindPeriodApproaching &&
    reminders.periodApproaching &&
    reminders.daysUntilPredictedPeriod != null;
  const showFertile = remindFertileWindow && reminders.fertileStarting;
  const showLate =
    remindLateOrPossiblePregnancy &&
    reminders.lateOrPossiblePregnancy &&
    reminders.daysLate != null;

  useEffect(() => {
    if (showPeriod && reminders.daysUntilPredictedPeriod != null) {
      notifyOnce(
        "cycle-period",
        accountCopy.cycle.title,
        accountCopy.cycleAlerts.periodApproaching(
          reminders.daysUntilPredictedPeriod,
        ),
      );
    }
    if (showFertile) {
      notifyOnce(
        "cycle-fertile",
        accountCopy.cycle.title,
        accountCopy.cycleAlerts.fertileStarting,
      );
    }
    if (showLate && reminders.daysLate != null) {
      notifyOnce(
        "cycle-late",
        accountCopy.cycle.title,
        accountCopy.cycleAlerts.late(reminders.daysLate),
      );
    }
  }, [showPeriod, showFertile, showLate, reminders]);

  if (!showPeriod && !showFertile && !showLate) {
    return null;
  }

  return (
    <div className="space-y-3">
      {showPeriod && reminders.daysUntilPredictedPeriod != null ? (
        <InlineAlert tone="info">
          {accountCopy.cycleAlerts.periodApproaching(
            reminders.daysUntilPredictedPeriod,
          )}
        </InlineAlert>
      ) : null}
      {showFertile ? (
        <InlineAlert tone="info">
          {accountCopy.cycleAlerts.fertileStarting}
        </InlineAlert>
      ) : null}
      {showLate && reminders.daysLate != null ? (
        <InlineAlert tone="info">
          {accountCopy.cycleAlerts.late(reminders.daysLate)}
        </InlineAlert>
      ) : null}
      <Link
        href="/account#cycle-calendar"
        className="focus-ring inline-flex min-h-10 items-center text-sm font-semibold text-mint-deep"
      >
        {accountCopy.cycleAlerts.openCycle}
      </Link>
    </div>
  );
}
