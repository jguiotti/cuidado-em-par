import { adminCopy } from "@/lib/i18n/admin-pt-br";
import { appCopy } from "@/lib/i18n/app-pt-br";
import type { SafeExerciseCard } from "@/app/actions/safe-content";

interface SafeExerciseListProps {
  items: SafeExerciseCard[];
}

function equipmentLabel(slug: string): string {
  return adminCopy.equipment[slug] ?? slug;
}

function muscleLabel(slug: string): string {
  return adminCopy.muscles[slug as keyof typeof adminCopy.muscles] ?? slug;
}

export function SafeExerciseList({ items }: SafeExerciseListProps) {
  if (items.length === 0) {
    return (
      <div className="surface p-6">
        <p className="text-base leading-relaxed text-ink-soft">
          {appCopy.move.empty}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-[var(--radius-soft)] bg-surface-raised p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            {item.imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageSrc}
                alt=""
                className="h-28 w-28 shrink-0 rounded-2xl object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1 space-y-2">
              <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
              <p className="text-sm leading-relaxed text-ink-soft">
                {item.description}
              </p>
              {item.equipmentTags.length > 0 ? (
                <p className="text-sm text-ink-soft">
                  <span className="font-medium text-ink">
                    {appCopy.move.equipment}:{" "}
                  </span>
                  {item.equipmentTags.map(equipmentLabel).join(", ")}
                </p>
              ) : null}
              {item.targetMuscles.length > 0 ? (
                <p className="text-sm text-ink-soft">
                  <span className="font-medium text-ink">
                    {appCopy.move.muscles}:{" "}
                  </span>
                  {item.targetMuscles.map(muscleLabel).join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
