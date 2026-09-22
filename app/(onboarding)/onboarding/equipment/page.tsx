import { redirect } from "next/navigation";

import { EquipmentStep } from "@/components/onboarding/equipment-step";
import { selectedFromAvailableEquipmentTags } from "@/lib/onboarding/equipment";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function EquipmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/equipment");
  }

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);
  if (step !== "equipment") {
    redirect(pathForOnboardingStep(step));
  }

  const { data: clinical } = await supabase
    .from("user_clinical_conditions")
    .select("available_equipment_tags")
    .eq("user_id", user.id)
    .maybeSingle();

  const initialSelected = selectedFromAvailableEquipmentTags(
    clinical?.available_equipment_tags ?? [],
  );

  return <EquipmentStep initialSelected={initialSelected} />;
}
