"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { acceptHabitRemindersConsentAction } from "@/app/actions/habits";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";
import type { HabitPrefsSnapshot } from "@/lib/habits/types";

interface HabitRemindersOptInProps {
  initiallyConsented: boolean;
  prefs: HabitPrefsSnapshot;
}

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

function scheduleLocalReminders(
  prefs: HabitPrefsSnapshot,
  timers: number[],
) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }
  if (Notification.permission !== "granted") {
    return;
  }

  function notify(title: string, body: string, tag: string) {
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

  if (prefs.waterReminderEnabled) {
    const waterMs = 2 * 60 * 60 * 1000;
    timers.push(
      window.setInterval(() => {
        notify(
          habitsCopy.reminders.waterTitle,
          habitsCopy.reminders.waterBody,
          "habit-water",
        );
      }, waterMs),
    );
  }

  if (prefs.activePauseEnabled) {
    const pauseMs = Math.max(
      30,
      prefs.activePauseIntervalMinutes,
    ) * 60 * 1000;
    timers.push(
      window.setInterval(() => {
        notify(
          habitsCopy.reminders.pauseTitle,
          habitsCopy.reminders.pauseBody,
          "habit-pause",
        );
      }, pauseMs),
    );
  }
}

export function HabitRemindersOptIn({
  initiallyConsented,
  prefs,
}: HabitRemindersOptInProps) {
  const router = useRouter();
  const [consented, setConsented] = useState(initiallyConsented);
  const [status, setStatus] = useState<string | null>(
    initiallyConsented ? habitsCopy.reminders.enabled : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const id of timers) {
        window.clearInterval(id);
      }
      timers.length = 0;
    };
  }, []);

  useEffect(() => {
    if (!consented) {
      return;
    }
    let cancelled = false;

    void (async () => {
      if (!("Notification" in window)) {
        return;
      }
      if (Notification.permission !== "granted") {
        return;
      }
      await ensureServiceWorker();
      if (cancelled) {
        return;
      }
      for (const id of timersRef.current) {
        window.clearInterval(id);
      }
      timersRef.current = [];
      scheduleLocalReminders(prefs, timersRef.current);
    })();

    return () => {
      cancelled = true;
    };
  }, [consented, prefs]);

  function handleEnable() {
    setError(null);
    startTransition(async () => {
      if (!("Notification" in window)) {
        setError(habitsCopy.reminders.unsupported);
        return;
      }

      const consent = await acceptHabitRemindersConsentAction(true);
      if (!consent.ok) {
        setError(habitsCopy.genericError);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError(habitsCopy.reminders.denied);
        setConsented(true);
        router.refresh();
        return;
      }

      await ensureServiceWorker();
      setConsented(true);
      setStatus(habitsCopy.reminders.enabled);
      router.refresh();
    });
  }

  function handleDisable() {
    setError(null);
    startTransition(async () => {
      const consent = await acceptHabitRemindersConsentAction(false);
      if (!consent.ok) {
        setError(habitsCopy.genericError);
        return;
      }
      for (const id of timersRef.current) {
        window.clearInterval(id);
      }
      timersRef.current = [];
      setConsented(false);
      setStatus(null);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {habitsCopy.reminders.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {habitsCopy.reminders.support}
        </p>
      </div>

      {status ? (
        <p className="text-sm text-ink-soft" role="status">
          {status}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        {!consented ? (
          <Button
            type="button"
            disabled={isPending}
            onClick={handleEnable}
            className="w-full"
          >
            {habitsCopy.reminders.ctaOn}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={handleDisable}
            className="w-full"
          >
            {habitsCopy.reminders.ctaOff}
          </Button>
        )}
      </div>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </Surface>
  );
}
