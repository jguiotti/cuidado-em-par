import {
  getHabitDoneTodayAction,
  listSafeMealsForMeAction,
} from "@/app/actions/safe-content";
import { MarkHabitDoneButton } from "@/components/care/mark-habit-done-button";
import { SafeMealList } from "@/components/care/safe-meal-list";
import { InlineAlert } from "@/components/ui/inline-alert";
import { appCopy } from "@/lib/i18n/app-pt-br";
import { MEAL_SLOT_VALUES, type MealSlot } from "@/lib/tags/constants";

interface MealsPageProps {
  searchParams: Promise<{ slot?: string }>;
}

function parseSlot(value: string | undefined): MealSlot | "all" {
  if (!value || value === "all") {
    return "all";
  }
  if (MEAL_SLOT_VALUES.includes(value as MealSlot)) {
    return value as MealSlot;
  }
  return "all";
}

export default async function MealsPage({ searchParams }: MealsPageProps) {
  const params = await searchParams;
  const activeSlot = parseSlot(params.slot);

  const [listResult, habitResult] = await Promise.all([
    listSafeMealsForMeAction(activeSlot),
    getHabitDoneTodayAction("meal"),
  ]);

  const initiallyDone = habitResult.ok ? habitResult.done : false;

  return (
    <main className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-ink">{appCopy.eat.title}</h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {appCopy.eat.support}
        </p>
      </div>

      <MarkHabitDoneButton kind="meal" initiallyDone={initiallyDone} />

      {!listResult.ok ? (
        <InlineAlert tone="error">{appCopy.eat.loadError}</InlineAlert>
      ) : (
        <SafeMealList items={listResult.items} activeSlot={activeSlot} />
      )}
    </main>
  );
}
