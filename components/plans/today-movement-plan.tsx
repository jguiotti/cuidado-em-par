"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { swapPlanExerciseAction } from "@/app/actions/daily-plan";
import {
  markContentDoneAction,
  type SafeExerciseCard,
} from "@/app/actions/safe-content";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { plansCopy } from "@/lib/i18n/plans-pt-br";

interface TodayMovementPlanProps {
  isRestDay: boolean;
  workoutMinutesPerDay: number;
  exercises: SafeExerciseCard[];
  doneExerciseIds: string[];
  swapCandidates: SafeExerciseCard[];
}

export function TodayMovementPlan({
  isRestDay,
  workoutMinutesPerDay,
  exercises,
  doneExerciseIds,
  swapCandidates,
}: TodayMovementPlanProps) {
  const router = useRouter();
  const [doneIds, setDoneIds] = useState(doneExerciseIds);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const candidatesByExclude = useMemo(() => {
    const planned = new Set(exercises.map((item) => item.id));
    return swapCandidates.filter((item) => !planned.has(item.id));
  }, [exercises, swapCandidates]);

  function markDone(exerciseId: string) {
    setError(null);
    startTransition(async () => {
      const result = await markContentDoneAction("workout", exerciseId);
      if (!result.ok) {
        setError(plansCopy.genericError);
        return;
      }
      setDoneIds((current) =>
        current.includes(exerciseId) ? current : [...current, exerciseId],
      );
      router.refresh();
    });
  }

  function swap(fromId: string, toId: string) {
    setError(null);
    startTransition(async () => {
      const result = await swapPlanExerciseAction({
        fromExerciseId: fromId,
        toExerciseId: toId,
      });
      if (!result.ok) {
        setError(plansCopy.genericError);
        return;
      }
      setSwappingId(null);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-ink">
          {isRestDay
            ? plansCopy.movement.restTitle
            : plansCopy.movement.title}
        </h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          {isRestDay
            ? plansCopy.movement.restSupport
            : plansCopy.movement.minutesTarget(workoutMinutesPerDay)}
        </p>
        {!isRestDay ? (
          <p className="text-sm leading-relaxed text-ink-soft">
            {plansCopy.movement.mixHint}
          </p>
        ) : null}
      </div>

      {!isRestDay && exercises.length === 0 ? (
        <p className="text-sm text-ink-soft">{plansCopy.movement.empty}</p>
      ) : null}

      <ul className="space-y-3">
        {exercises.map((exercise) => {
          const isDone = doneIds.includes(exercise.id);
          return (
            <li
              key={exercise.id}
              className="space-y-3 rounded-[1.25rem] bg-surface-raised p-4"
            >
              {exercise.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={exercise.imageSrc}
                  alt=""
                  className="h-44 w-full rounded-2xl object-cover"
                />
              ) : null}
              <div className="space-y-2">
                <p className="text-base font-semibold text-ink">
                  {exercise.title}
                </p>
                <p className="text-sm text-ink-soft">
                  {plansCopy.movement.duration(
                    exercise.estimatedDurationMinutes,
                  )}
                </p>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {exercise.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant={isDone ? "secondary" : "primary"}
                  disabled={isPending || isDone}
                  onClick={() => markDone(exercise.id)}
                  className="w-full"
                >
                  {isDone
                    ? plansCopy.movement.done
                    : plansCopy.movement.markDone}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() =>
                    setSwappingId((current) =>
                      current === exercise.id ? null : exercise.id,
                    )
                  }
                  className="w-full"
                >
                  {plansCopy.movement.swap}
                </Button>
              </div>
              {swappingId === exercise.id ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-ink-soft">
                    {plansCopy.movement.swapPick}
                  </p>
                  <ul className="max-h-56 space-y-2 overflow-y-auto">
                    {candidatesByExclude.slice(0, 12).map((candidate) => (
                      <li key={candidate.id}>
                        <button
                          type="button"
                          className="focus-ring flex w-full items-start gap-3 rounded-[1rem] px-2 py-2 text-left hover:bg-mint/40"
                          disabled={isPending}
                          onClick={() => swap(exercise.id, candidate.id)}
                        >
                          {candidate.imageSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={candidate.imageSrc}
                              alt=""
                              className="h-14 w-14 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <span
                              className="h-14 w-14 shrink-0 rounded-xl bg-surface"
                              aria-hidden
                            />
                          )}
                          <span className="min-w-0 space-y-1">
                            <span className="block text-sm font-semibold text-ink">
                              {candidate.title}
                            </span>
                            <span className="line-clamp-2 block text-xs leading-relaxed text-ink-soft">
                              {candidate.description}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Link
        href="/workouts"
        className="focus-ring inline-flex min-h-10 items-center text-sm font-semibold text-mint-deep"
      >
        {plansCopy.movement.openLibrary}
      </Link>
    </Surface>
  );
}
