import {
  getHabitDoneTodayAction,
  listSafeExercisesForMeAction,
} from "@/app/actions/safe-content";
import { MarkHabitDoneButton } from "@/components/care/mark-habit-done-button";
import { SafeExerciseList } from "@/components/care/safe-exercise-list";
import { InlineAlert } from "@/components/ui/inline-alert";
import { appCopy } from "@/lib/i18n/app-pt-br";

export default async function WorkoutsPage() {
  const [listResult, habitResult] = await Promise.all([
    listSafeExercisesForMeAction(),
    getHabitDoneTodayAction("workout"),
  ]);

  const initiallyDone = habitResult.ok ? habitResult.done : false;

  return (
    <main className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-ink">{appCopy.move.title}</h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {appCopy.move.support}
        </p>
      </div>

      <MarkHabitDoneButton kind="workout" initiallyDone={initiallyDone} />

      {!listResult.ok ? (
        <InlineAlert tone="error">{appCopy.move.loadError}</InlineAlert>
      ) : (
        <SafeExerciseList items={listResult.items} />
      )}
    </main>
  );
}
