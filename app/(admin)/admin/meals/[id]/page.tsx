import { notFound, redirect } from "next/navigation";

import { getAdminMealAction } from "@/app/actions/admin-meals";
import { MealForm } from "@/components/admin/meal-form";
import { createClient } from "@/lib/supabase/server";

interface AdminEditMealPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditMealPage({
  params,
}: AdminEditMealPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    redirect("/home");
  }

  const result = await getAdminMealAction(id);
  if (!result.ok) {
    notFound();
  }

  return (
    <main className="surface p-6">
      <MealForm mode="edit" initial={result.meal} />
    </main>
  );
}
