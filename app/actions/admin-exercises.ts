"use server";

import { revalidatePath } from "next/cache";

import {
  canPublishExercise,
  sanitizeExerciseFormInput,
  type ExerciseAdminRow,
  type ExerciseFormInput,
} from "@/lib/admin/exercise-tags";
import { createClient } from "@/lib/supabase/server";

export type AdminActionResult =
  | { ok: true; id?: string }
  | { ok: false; code: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, userId: null as string | null, isAdmin: false };
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) {
    return { supabase, userId: user.id, isAdmin: false };
  }

  return { supabase, userId: user.id, isAdmin: true };
}

function mapRow(row: {
  id: string;
  title: string;
  description: string;
  equipment_tags: string[];
  contraindication_tags: string[];
  required_capability_tags: string[];
  intensity_tags: string[];
  target_muscles: string[];
  video_url: string | null;
  image_paths: string[];
  is_published: boolean;
  updated_at: string;
}): ExerciseAdminRow {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    equipmentTags: row.equipment_tags ?? [],
    contraindicationTags: row.contraindication_tags ?? [],
    requiredCapabilityTags: row.required_capability_tags ?? [],
    intensityTags: row.intensity_tags ?? [],
    targetMuscles: row.target_muscles ?? [],
    videoUrl: row.video_url,
    imagePaths: row.image_paths ?? [],
    isPublished: row.is_published,
    updatedAt: row.updated_at,
  };
}

function toDbPayload(value: ExerciseFormInput, userId: string) {
  return {
    title: value.title,
    description: value.description,
    equipment_tags: value.equipmentTags,
    contraindication_tags: value.contraindicationTags,
    required_capability_tags: value.requiredCapabilityTags,
    intensity_tags: value.intensityTags,
    target_muscles: value.targetMuscles,
    video_url: value.videoUrl,
    image_paths: value.imagePaths,
    created_by: userId,
  };
}

function revalidateAdminExercises(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/exercises");
  if (id) {
    revalidatePath(`/admin/exercises/${id}`);
  }
}

export async function listAdminExercisesAction(): Promise<
  | { ok: true; exercises: ExerciseAdminRow[] }
  | { ok: false; code: string }
> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  const { data, error } = await supabase
    .from("exercises_library")
    .select(
      "id, title, description, equipment_tags, contraindication_tags, required_capability_tags, intensity_tags, target_muscles, video_url, image_paths, is_published, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listAdminExercisesAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  return {
    ok: true,
    exercises: (data ?? []).map(mapRow),
  };
}

export async function getAdminExerciseAction(
  id: string,
): Promise<
  | { ok: true; exercise: ExerciseAdminRow }
  | { ok: false; code: string }
> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  const { data, error } = await supabase
    .from("exercises_library")
    .select(
      "id, title, description, equipment_tags, contraindication_tags, required_capability_tags, intensity_tags, target_muscles, video_url, image_paths, is_published, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getAdminExerciseAction", error.message);
    return { ok: false, code: "save_failed" };
  }
  if (!data) {
    return { ok: false, code: "not_found" };
  }

  return { ok: true, exercise: mapRow(data) };
}

export async function createExerciseAction(
  input: ExerciseFormInput,
): Promise<AdminActionResult> {
  const { supabase, userId, isAdmin } = await requireAdmin();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  const sanitized = sanitizeExerciseFormInput(input);
  if (!sanitized.ok) {
    return { ok: false, code: sanitized.code };
  }

  const { data, error } = await supabase
    .from("exercises_library")
    .insert({
      ...toDbPayload(sanitized.value, userId),
      is_published: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createExerciseAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateAdminExercises(data.id);
  return { ok: true, id: data.id };
}

export async function updateExerciseAction(
  id: string,
  input: ExerciseFormInput,
): Promise<AdminActionResult> {
  const { supabase, userId, isAdmin } = await requireAdmin();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  const sanitized = sanitizeExerciseFormInput(input);
  if (!sanitized.ok) {
    return { ok: false, code: sanitized.code };
  }

  const { data: existing, error: loadError } = await supabase
    .from("exercises_library")
    .select("is_published")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !existing) {
    return { ok: false, code: "not_found" };
  }

  if (existing.is_published) {
    const publishCheck = canPublishExercise(sanitized.value);
    if (!publishCheck.ok) {
      return { ok: false, code: publishCheck.code };
    }
  }

  const { error } = await supabase
    .from("exercises_library")
    .update(toDbPayload(sanitized.value, userId))
    .eq("id", id);

  if (error) {
    console.error("updateExerciseAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateAdminExercises(id);
  return { ok: true, id };
}

export async function setExercisePublishedAction(
  id: string,
  isPublished: boolean,
): Promise<AdminActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  if (isPublished) {
    const current = await getAdminExerciseAction(id);
    if (!current.ok) {
      return current;
    }
    const publishCheck = canPublishExercise(current.exercise);
    if (!publishCheck.ok) {
      return { ok: false, code: publishCheck.code };
    }
  }

  const { error } = await supabase
    .from("exercises_library")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) {
    console.error("setExercisePublishedAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateAdminExercises(id);
  return { ok: true, id };
}

export async function createExerciseImageUploadAction(
  exerciseId: string,
  fileName: string,
): Promise<
  | { ok: true; path: string; token: string }
  | { ok: false; code: string }
> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  const safeName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  if (!safeName || !/\.(png|jpe?g|webp)$/.test(safeName)) {
    return { ok: false, code: "invalid_image" };
  }

  const path = `exercises/${exerciseId}/${Date.now()}-${safeName}`;
  const { data, error } = await supabase.storage
    .from("content-media")
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("createExerciseImageUploadAction", error?.message);
    return { ok: false, code: "save_failed" };
  }

  return { ok: true, path, token: data.token };
}

export async function attachExerciseImagePathAction(
  exerciseId: string,
  path: string,
): Promise<AdminActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  if (!path.startsWith(`exercises/${exerciseId}/`)) {
    return { ok: false, code: "invalid_image" };
  }

  const current = await getAdminExerciseAction(exerciseId);
  if (!current.ok) {
    return current;
  }

  const imagePaths = Array.from(
    new Set([...current.exercise.imagePaths, path]),
  );

  const { error } = await supabase
    .from("exercises_library")
    .update({ image_paths: imagePaths })
    .eq("id", exerciseId);

  if (error) {
    console.error("attachExerciseImagePathAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateAdminExercises(exerciseId);
  return { ok: true, id: exerciseId };
}
