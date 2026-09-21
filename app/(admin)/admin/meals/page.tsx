import Link from "next/link";
import { redirect } from "next/navigation";

import { listAdminMealsAction } from "@/app/actions/admin-meals";
import { adminCopy } from "@/lib/i18n/admin-pt-br";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMealsPage() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    redirect("/home");
  }

  const result = await listAdminMealsAction();
  if (!result.ok) {
    redirect("/home");
  }

  const meals = result.meals;

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-ink">
            {adminCopy.mealsListTitle}
          </h2>
          <p className="text-base leading-relaxed text-ink-soft">
            {adminCopy.mealsListSupport}
          </p>
        </div>
        <Link
          href="/admin/meals/new"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-[var(--radius-soft)] bg-mint-deep px-5 text-base font-semibold text-surface"
        >
          {adminCopy.mealsNewCta}
        </Link>
      </div>

      {meals.length === 0 ? (
        <div className="surface p-6">
          <p className="text-base leading-relaxed text-ink-soft">
            {adminCopy.mealsEmpty}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {meals.map((meal) => (
            <li key={meal.id}>
              <Link
                href={`/admin/meals/${meal.id}`}
                className="focus-ring block rounded-[var(--radius-soft)] bg-surface-raised p-4 transition hover:bg-sand"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-ink">
                      {meal.title}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {adminCopy.mealSlots[meal.mealSlot] ?? meal.mealSlot}
                      {" · "}
                      {meal.dietCompatibleTags.join(", ") || "—"}
                    </p>
                  </div>
                  <span
                    className={`rounded-[var(--radius-pill)] px-3 py-1 text-sm font-medium ${
                      meal.isPublished
                        ? "bg-mint text-ink"
                        : "bg-sand text-ink-soft"
                    }`}
                  >
                    {meal.isPublished
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
