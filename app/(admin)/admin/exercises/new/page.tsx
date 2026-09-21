import { redirect } from "next/navigation";

import { ExerciseForm } from "@/components/admin/exercise-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminNewExercisePage() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    redirect("/home");
  }

  return (
    <main className="surface p-6">
      <ExerciseForm mode="create" />
    </main>
  );
}
