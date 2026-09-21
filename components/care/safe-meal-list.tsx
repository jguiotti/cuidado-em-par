import Link from "next/link";

import type { SafeMealCard } from "@/app/actions/safe-content";
import { MarkHabitDoneButton } from "@/components/care/mark-habit-done-button";
import { adminCopy } from "@/lib/i18n/admin-pt-br";
import { appCopy } from "@/lib/i18n/app-pt-br";
import { MEAL_SLOT_VALUES, type MealSlot } from "@/lib/tags/constants";
import { MEAL_SLOT_LABELS_PT_BR } from "@/lib/tags/labels";

interface SafeMealListProps {
  items: SafeMealCard[];
  activeSlot: MealSlot | "all";
  doneIds?: ReadonlySet<string> | string[];
  emptyMessage?: string;
}

function toDoneSet(
  doneIds: ReadonlySet<string> | string[] | undefined,
): Set<string> {
  if (!doneIds) {
    return new Set();
  }
  return doneIds instanceof Set ? doneIds : new Set(doneIds);
}

export function SafeMealList({
  items,
  activeSlot,
  doneIds,
  emptyMessage,
}: SafeMealListProps) {
  const filters: Array<MealSlot | "all"> = ["all", ...MEAL_SLOT_VALUES];
  const doneSet = toDoneSet(doneIds);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">
          {appCopy.eat.filterLabel}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((slot) => {
            const href =
              slot === "all" ? "/meals" : `/meals?slot=${slot}`;
            const label =
              slot === "all"
                ? appCopy.eat.allSlots
                : MEAL_SLOT_LABELS_PT_BR[slot];
            const isActive = activeSlot === slot;
            return (
              <Link
                key={slot}
                href={href}
                className={`focus-ring shrink-0 rounded-[var(--radius-soft)] px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-mint text-ink"
                    : "bg-surface-raised text-ink-soft"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="surface p-6">
          <p className="text-base leading-relaxed text-ink-soft">
            {emptyMessage ?? appCopy.eat.empty}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((meal) => (
            <li
              key={meal.id}
              className="space-y-3 rounded-[var(--radius-soft)] bg-surface-raised p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                {meal.imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meal.imageSrc}
                    alt=""
                    className="h-28 w-28 shrink-0 rounded-2xl object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-mint-deep">
                    {adminCopy.mealSlots[meal.mealSlot] ?? meal.mealSlot}
                  </p>
                  <h2 className="text-lg font-semibold text-ink">{meal.title}</h2>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {meal.description}
                  </p>
                </div>
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
              <MarkHabitDoneButton
                kind="meal"
                contentId={meal.id}
                initiallyDone={doneSet.has(meal.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
