import { notFound, redirect } from "next/navigation";

import { getAdminExerciseAction } from "@/app/actions/admin-exercises";
import { ExerciseForm } from "@/components/admin/exercise-form";
import { createClient } from "@/lib/supabase/server";

interface AdminEditExercisePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditExercisePage({
  params,
}: AdminEditExercisePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    redirect("/home");
  }

  const result = await getAdminExerciseAction(id);
  if (!result.ok) {
    notFound();
  }

  return (
    <main className="surface p-6">
      <ExerciseForm mode="edit" initial={result.exercise} />
    </main>
  );
}
