import { redirect } from "next/navigation";

import { MealForm } from "@/components/admin/meal-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminNewMealPage() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    redirect("/home");
  }

  return (
    <main className="surface p-6">
      <MealForm mode="create" />
    </main>
  );
}
