import Link from "next/link";
import { redirect } from "next/navigation";

import { adminCopy } from "@/lib/i18n/admin-pt-br";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    redirect("/home");
  }

  return (
    <main className="flex flex-col gap-6">
      <div className="surface space-y-3 p-6">
        <h2 className="text-xl font-semibold text-ink">
          {adminCopy.panelTitle}
        </h2>
        <p className="text-base leading-relaxed text-ink-soft">
          {adminCopy.panelSupport}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/exercises"
          className="focus-ring rounded-[var(--radius-soft)] bg-mint p-5 text-base font-semibold text-ink"
        >
          {adminCopy.exercisesNav}
        </Link>
        <Link
          href="/admin/meals"
          className="focus-ring rounded-[var(--radius-soft)] bg-surface-raised p-5 text-base font-semibold text-ink"
        >
          {adminCopy.mealsNav}
        </Link>
      </div>
    </main>
  );
}
