import Link from "next/link";
import { redirect } from "next/navigation";

import { listAdminExercisesAction } from "@/app/actions/admin-exercises";
import { adminCopy } from "@/lib/i18n/admin-pt-br";
import { createClient } from "@/lib/supabase/server";

export default async function AdminExercisesPage() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    redirect("/home");
  }

  const result = await listAdminExercisesAction();
  if (!result.ok) {
    redirect("/home");
  }

  const exercises = result.exercises;

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-ink">
            {adminCopy.listTitle}
          </h2>
          <p className="text-base leading-relaxed text-ink-soft">
            {adminCopy.listSupport}
          </p>
        </div>
        <Link
          href="/admin/exercises/new"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-[var(--radius-soft)] bg-mint-deep px-5 text-base font-semibold text-surface"
        >
          {adminCopy.newCta}
        </Link>
      </div>

      {exercises.length === 0 ? (
        <div className="surface p-6">
          <p className="text-base leading-relaxed text-ink-soft">
            {adminCopy.empty}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {exercises.map((exercise) => (
            <li key={exercise.id}>
              <Link
                href={`/admin/exercises/${exercise.id}`}
                className="focus-ring block rounded-[var(--radius-soft)] bg-surface-raised p-4 transition hover:bg-sand"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-ink">
                      {exercise.title}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {exercise.requiredCapabilityTags.join(", ") || "—"}
                    </p>
                  </div>
                  <span
                    className={`rounded-[var(--radius-pill)] px-3 py-1 text-sm font-medium ${
                      exercise.isPublished
                        ? "bg-mint text-ink"
                        : "bg-sand text-ink-soft"
                    }`}
                  >
                    {exercise.isPublished
                      ? adminCopy.statusPublished
                      : adminCopy.statusDraft}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
