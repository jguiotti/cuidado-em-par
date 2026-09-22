"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import {
  logCustomMealAction,
  markPlanMealDoneAction,
  swapPlanMealAction,
} from "@/app/actions/daily-plan";
import type { SafeMealCard } from "@/app/actions/safe-content";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { plansCopy } from "@/lib/i18n/plans-pt-br";
import { appCopy } from "@/lib/i18n/app-pt-br";
import { MEAL_SLOT_VALUES, type MealSlot } from "@/lib/tags/constants";

interface TodayMealsPlanProps {
  meals: Record<MealSlot, SafeMealCard | null>;
  doneMealSlots: MealSlot[];
  customMeals: Array<{ slot: MealSlot; note: string }>;
  swapCandidates: SafeMealCard[];
}

export function TodayMealsPlan({
  meals,
  doneMealSlots,
  customMeals,
  swapCandidates,
}: TodayMealsPlanProps) {
  const router = useRouter();
  const [doneSlots, setDoneSlots] = useState(doneMealSlots);
  const [customs, setCustoms] = useState(customMeals);
  const [swappingSlot, setSwappingSlot] = useState<MealSlot | null>(null);
  const [customSlot, setCustomSlot] = useState<MealSlot | null>(null);
  const [customNote, setCustomNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const customBySlot = useMemo(() => {
    const map = new Map<MealSlot, string>();
    for (const item of customs) {
      map.set(item.slot, item.note);
    }
    return map;
  }, [customs]);

  function candidatesFor(slot: MealSlot, currentId: string | null) {
    return swapCandidates.filter(
      (item) => item.mealSlot === slot && item.id !== currentId,
    );
  }

  function markDone(slot: MealSlot, mealId: string) {
    setError(null);
    startTransition(async () => {
      const result = await markPlanMealDoneAction({ mealId, slot });
      if (!result.ok) {
        setError(plansCopy.genericError);
        return;
      }
      setDoneSlots((current) =>
        current.includes(slot) ? current : [...current, slot],
      );
      router.refresh();
    });
  }

  function swap(slot: MealSlot, toMealId: string) {
    setError(null);
    startTransition(async () => {
      const result = await swapPlanMealAction({ slot, toMealId });
      if (!result.ok) {
        setError(plansCopy.genericError);
        return;
      }
      setSwappingSlot(null);
      router.refresh();
    });
  }

  function saveCustom(event: FormEvent) {
    event.preventDefault();
    if (!customSlot) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await logCustomMealAction({
        slot: customSlot,
        note: customNote,
      });
      if (!result.ok) {
        setError(plansCopy.genericError);
        return;
      }
      setCustoms((current) => [
        ...current.filter((item) => item.slot !== customSlot),
        { slot: customSlot, note: customNote.trim() },
      ]);
      setDoneSlots((current) =>
        current.includes(customSlot) ? current : [...current, customSlot],
      );
      setCustomSlot(null);
      setCustomNote("");
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-ink">{plansCopy.meals.title}</h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          {plansCopy.meals.support}
        </p>
      </div>

      <ul className="space-y-3">
        {MEAL_SLOT_VALUES.map((slot) => {
          const meal = meals[slot];
          const isDone = doneSlots.includes(slot);
          const customNoteForSlot = customBySlot.get(slot);
          return (
            <li
              key={slot}
              className="space-y-3 rounded-[1.25rem] bg-surface-raised p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-mint-deep">
                {plansCopy.meals.slots[slot]}
              </p>
              {customNoteForSlot ? (
                <p className="text-sm font-semibold text-ink">
                  {plansCopy.meals.customDone(customNoteForSlot)}
                </p>
              ) : meal ? (
                <div className="space-y-3">
                  {meal.imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={meal.imageSrc}
                      alt=""
                      className="h-44 w-full rounded-2xl object-cover"
                    />
                  ) : null}
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-ink">
                      {meal.title}
                    </p>
                    <p className="text-sm leading-relaxed text-ink-soft">
                      {meal.description}
                    </p>
                  </div>
                  {meal.ingredients.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-ink">
                        {appCopy.eat.ingredients}
                      </p>
                      <ul className="space-y-1 text-sm text-ink-soft">
                        {meal.ingredients.map((ingredient) => (
                          <li key={`${meal.id}-${ingredient.item}`}>
                            {ingredient.item} — {ingredient.qty}
                            {ingredient.alt ? (
                              <span className="block text-ink-soft/90">
                                {appCopy.eat.alt}: {ingredient.alt}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-ink-soft">{plansCopy.meals.empty}</p>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                {meal && !customNoteForSlot ? (
                  <Button
                    type="button"
                    variant={isDone ? "secondary" : "primary"}
                    disabled={isPending || isDone}
                    onClick={() => markDone(slot, meal.id)}
                    className="w-full"
                  >
                    {plansCopy.meals.markDone}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() =>
                    setSwappingSlot((current) =>
                      current === slot ? null : slot,
                    )
                  }
                  className="w-full"
                >
                  {plansCopy.meals.swap}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => {
                    setCustomSlot(slot);
                    setCustomNote("");
                  }}
                  className="w-full"
                >
                  {plansCopy.meals.custom}
                </Button>
              </div>

              {swappingSlot === slot ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-ink-soft">
                    {plansCopy.meals.swapPick}
                  </p>
                  <ul className="max-h-56 space-y-2 overflow-y-auto">
                    {candidatesFor(slot, meal?.id ?? null)
                      .slice(0, 12)
                      .map((candidate) => (
                        <li key={candidate.id}>
                          <button
                            type="button"
                            className="focus-ring flex w-full items-start gap-3 rounded-[1rem] px-2 py-2 text-left hover:bg-mint/40"
                            disabled={isPending}
                            onClick={() => swap(slot, candidate.id)}
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

              {customSlot === slot ? (
                <form onSubmit={saveCustom} className="space-y-3">
                  <TextField
                    label={plansCopy.meals.customLabel}
                    name={`custom-${slot}`}
                    value={customNote}
                    onChange={(event) => setCustomNote(event.target.value)}
                    placeholder={plansCopy.meals.customPlaceholder}
                    disabled={isPending}
                    required
                    minLength={2}
                    maxLength={120}
                  />
                  <Button type="submit" disabled={isPending} className="w-full">
                    {plansCopy.meals.customSave}
                  </Button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Link
        href="/meals"
        className="focus-ring inline-flex min-h-10 items-center text-sm font-semibold text-mint-deep"
      >
        {plansCopy.meals.openLibrary}
      </Link>
    </Surface>
  );
}
