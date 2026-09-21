import { adminCopy } from "@/lib/i18n/admin-pt-br";
import { appCopy } from "@/lib/i18n/app-pt-br";
import type { SafeExerciseCard } from "@/app/actions/safe-content";
import { MarkHabitDoneButton } from "@/components/care/mark-habit-done-button";

interface SafeExerciseListProps {
  items: SafeExerciseCard[];
  doneIds?: ReadonlySet<string> | string[];
  emptyMessage?: string;
}

function equipmentLabel(slug: string): string {
  return adminCopy.equipment[slug] ?? slug;
}

function muscleLabel(slug: string): string {
  return adminCopy.muscles[slug as keyof typeof adminCopy.muscles] ?? slug;
}

function toDoneSet(
  doneIds: ReadonlySet<string> | string[] | undefined,
): Set<string> {
  if (!doneIds) {
    return new Set();
  }
  return doneIds instanceof Set ? doneIds : new Set(doneIds);
}

export function SafeExerciseList({
  items,
  doneIds,
  emptyMessage,
}: SafeExerciseListProps) {
  const doneSet = toDoneSet(doneIds);

  if (items.length === 0) {
    return (
      <div className="surface p-6">
        <p className="text-base leading-relaxed text-ink-soft">
          {emptyMessage ?? appCopy.move.empty}
        </p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="space-y-3 rounded-[1.25rem] bg-surface p-4 shadow-[0_10px_28px_color-mix(in_srgb,var(--color-ink)_6%,transparent)]"
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-deep text-sm font-bold text-surface">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
              <p className="text-sm leading-relaxed text-ink-soft">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.equipmentTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[var(--radius-pill)] bg-mint px-2.5 py-1 text-xs font-semibold text-mint-deep"
                  >
                    {equipmentLabel(tag)}
                  </span>
                ))}
                {item.targetMuscles.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[var(--radius-pill)] bg-surface-raised px-2.5 py-1 text-xs font-semibold text-ink-soft"
                  >
                    {muscleLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {item.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageSrc}
              alt=""
              className="h-40 w-full rounded-2xl object-cover"
            />
          ) : null}
          <MarkHabitDoneButton
            kind="workout"
            contentId={item.id}
            initiallyDone={doneSet.has(item.id)}
          />
        </li>
      ))}
    </ol>
  );
}
