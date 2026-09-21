"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  markActivePauseDoneAction,
  unmarkActivePauseDoneAction,
} from "@/app/actions/habits";
import type { SafeExerciseCard } from "@/app/actions/safe-content";
import { IconLeaf, IconPlay } from "@/components/brand/soft-icons";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { habitsCopy } from "@/lib/i18n/habits-pt-br";

interface ActivePauseCardProps {
  initiallyDone: boolean;
  exercises: SafeExerciseCard[];
  highlight?: boolean;
}

export function ActivePauseCard({
  initiallyDone,
  exercises,
  highlight = false,
}: ActivePauseCardProps) {
  const router = useRouter();
  const [done, setDone] = useState(initiallyDone);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = done
        ? await unmarkActivePauseDoneAction()
        : await markActivePauseDoneAction();

      if (!result.ok) {
        setError(habitsCopy.genericError);
        return;
      }

      setDone(result.data.done);
      setMessage(
        result.data.done
          ? habitsCopy.pause.marked
          : habitsCopy.pause.unmarked,
      );
      router.refresh();
    });
  }

  if (highlight) {
    return (
      <div className="space-y-4 rounded-[1.5rem] bg-blush px-5 py-5 shadow-[0_12px_36px_color-mix(in_srgb,var(--color-blush-deep)_18%,transparent)]">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-blush-deep">
            <IconLeaf size={20} />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blush-deep">
              {habitsCopy.pause.reminderEyebrow}
            </p>
            <h2 className="text-xl font-bold text-ink">
              {habitsCopy.pause.title}
            </h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              {habitsCopy.pause.support}
            </p>
          </div>
        </div>

        {exercises.length > 0 ? (
          <p className="text-sm text-ink-soft">
            {habitsCopy.pause.suggestion(exercises[0]!.title)}
          </p>
        ) : null}

        <Button
          type="button"
          variant={done ? "secondary" : "primary"}
          disabled={isPending}
          onClick={handleToggle}
          className="w-full gap-2 rounded-[var(--radius-pill)]"
          aria-pressed={done}
        >
          {!done ? <IconPlay size={18} /> : null}
          {done ? habitsCopy.pause.marked : habitsCopy.pause.markDone}
        </Button>

        <Link
          href="/workouts"
          className="focus-ring inline-flex min-h-10 w-full items-center justify-center text-sm font-semibold text-ink"
        >
          {habitsCopy.pause.openMove}
        </Link>

        {message && !error ? (
          <p className="text-sm text-ink-soft" role="status">
            {message}
          </p>
        ) : null}
        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
      </div>
    );
  }

  return (
    <Surface className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-ink">
            {habitsCopy.pause.title}
          </h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            {habitsCopy.pause.support}
          </p>
        </div>
        <span className="text-sm font-medium text-mint-deep">
          {done ? habitsCopy.statusDone : habitsCopy.statusPending}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-ink">
          {habitsCopy.pause.listTitle}
        </h3>
        {exercises.length === 0 ? (
          <p className="text-sm leading-relaxed text-ink-soft">
            {habitsCopy.pause.empty}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {exercises.map((item) => (
              <li
                key={item.id}
                className="rounded-[var(--radius-soft)] bg-surface-raised p-3"
              >
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        type="button"
        variant={done ? "secondary" : "primary"}
        disabled={isPending}
        onClick={handleToggle}
        className="w-full"
        aria-pressed={done}
      >
        {done ? habitsCopy.pause.marked : habitsCopy.pause.markDone}
      </Button>

      <Link
        href="/workouts"
        className="focus-ring inline-flex min-h-12 items-center justify-center text-sm font-semibold text-mint-deep"
      >
        {habitsCopy.pause.openMove}
      </Link>

      {message && !error ? (
        <p className="text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </Surface>
  );
}
