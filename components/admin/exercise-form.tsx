"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import {
  attachExerciseImagePathAction,
  createExerciseAction,
  createExerciseImageUploadAction,
  setExercisePublishedAction,
  updateExerciseAction,
} from "@/app/actions/admin-exercises";
import { TagMultiSelect } from "@/components/admin/tag-multi-select";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { TextField } from "@/components/ui/text-field";
import { createClient } from "@/lib/supabase/client";
import {
  EXERCISE_CAPABILITY_SLUGS,
  EXERCISE_CONTRAINDICATION_SLUGS,
  EXERCISE_EQUIPMENT_SLUGS,
  EXERCISE_INTENSITY_SLUGS,
  EXERCISE_MUSCLE_SLUGS,
  type ExerciseAdminRow,
  type ExerciseFormInput,
} from "@/lib/admin/exercise-tags";
import { resolveExerciseImageSrc } from "@/lib/admin/exercise-illustration";
import { getClinicalCondition } from "@/lib/clinical/conditions-catalog";
import { adminCopy } from "@/lib/i18n/admin-pt-br";

interface ExerciseFormProps {
  mode: "create" | "edit";
  initial?: ExerciseAdminRow;
}

function intensityLabel(slug: string): string {
  return adminCopy.intensities[slug] ?? slug;
}

function contraindicationLabel(slug: string): string {
  return getClinicalCondition(slug)?.labelPtBr ?? slug;
}

export function ExerciseForm({ mode, initial }: ExerciseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [equipmentTags, setEquipmentTags] = useState(
    initial?.equipmentTags ?? ["bodyweight"],
  );
  const [requiredCapabilityTags, setRequiredCapabilityTags] = useState(
    initial?.requiredCapabilityTags ?? [],
  );
  const [contraindicationTags, setContraindicationTags] = useState(
    initial?.contraindicationTags ?? [],
  );
  const [intensityTags, setIntensityTags] = useState(
    initial?.intensityTags ?? ["low-intensity"],
  );
  const [targetMuscles, setTargetMuscles] = useState(
    initial?.targetMuscles ?? [],
  );
  const [imagePaths, setImagePaths] = useState(initial?.imagePaths ?? []);
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(
    String(initial?.estimatedDurationMinutes ?? 5),
  );
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const equipmentOptions = useMemo(
    () =>
      EXERCISE_EQUIPMENT_SLUGS.map((slug) => ({
        slug,
        label: adminCopy.equipment[slug],
      })),
    [],
  );
  const capabilityOptions = useMemo(
    () =>
      EXERCISE_CAPABILITY_SLUGS.map((slug) => ({
        slug,
        label: adminCopy.capabilities[slug],
      })),
    [],
  );
  const muscleOptions = useMemo(
    () =>
      EXERCISE_MUSCLE_SLUGS.map((slug) => ({
        slug,
        label: adminCopy.muscles[slug],
      })),
    [],
  );
  const intensityOptions = useMemo(
    () =>
      EXERCISE_INTENSITY_SLUGS.map((slug) => ({
        slug,
        label: intensityLabel(slug),
      })),
    [],
  );
  const contraindicationOptions = useMemo(
    () =>
      EXERCISE_CONTRAINDICATION_SLUGS.map((slug) => ({
        slug,
        label: contraindicationLabel(slug),
      })),
    [],
  );

  function buildInput(): ExerciseFormInput {
    return {
      title,
      description,
      equipmentTags,
      requiredCapabilityTags,
      contraindicationTags,
      intensityTags,
      targetMuscles,
      videoUrl: videoUrl.trim() ? videoUrl.trim() : null,
      imagePaths,
      estimatedDurationMinutes: Number(estimatedDurationMinutes) || 5,
    };
  }

  function mapError(code: string): string {
    switch (code) {
      case "publish_needs_capabilities":
        return adminCopy.publishBlockedCapabilities;
      case "publish_needs_contraindication":
        return adminCopy.publishBlockedContraindication;
      case "invalid_title":
        return adminCopy.invalidTitle;
      case "invalid_description":
        return adminCopy.invalidDescription;
      case "invalid_video":
        return adminCopy.invalidVideo;
      case "invalid_duration":
        return adminCopy.invalidDuration;
      case "forbidden":
        return adminCopy.forbidden;
      default:
        return adminCopy.genericError;
    }
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const input = buildInput();
      const result =
        mode === "create"
          ? await createExerciseAction(input)
          : await updateExerciseAction(initial!.id, input);

      if (!result.ok) {
        setError(mapError(result.code));
        return;
      }

      if (mode === "create" && result.id) {
        router.replace(`/admin/exercises/${result.id}`);
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  function handlePublishToggle() {
    if (!initial) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setExercisePublishedAction(
        initial.id,
        !isPublished,
      );
      if (!result.ok) {
        setError(mapError(result.code));
        return;
      }
      setIsPublished(!isPublished);
      router.refresh();
    });
  }

  function handleImageUpload() {
    if (!initial) {
      setError(adminCopy.imageUploadNeedSave);
      return;
    }
    if (!imageFile) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const signed = await createExerciseImageUploadAction(
        initial.id,
        imageFile.name,
      );
      if (!signed.ok) {
        setError(mapError(signed.code));
        return;
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("content-media")
        .uploadToSignedUrl(signed.path, signed.token, imageFile);

      if (uploadError) {
        setError(adminCopy.genericError);
        return;
      }

      const attached = await attachExerciseImagePathAction(
        initial.id,
        signed.path,
      );
      if (!attached.ok) {
        setError(mapError(attached.code));
        return;
      }

      setImagePaths((current) =>
        current.includes(signed.path) ? current : [...current, signed.path],
      );
      setImageFile(null);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">
          {mode === "create"
            ? adminCopy.formCreateTitle
            : adminCopy.formEditTitle}
        </h2>
        {mode === "edit" ? (
          <p className="text-sm font-medium text-ink-soft">
            {isPublished
              ? adminCopy.statusPublished
              : adminCopy.statusDraft}
          </p>
        ) : null}
      </div>

      <TextField
        label={adminCopy.titleLabel}
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isPending}
        required
      />

      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        {adminCopy.descriptionLabel}
        <textarea
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isPending}
          required
          rows={6}
          className="field-control px-4 py-3 text-base font-normal text-ink"
        />
      </label>

      <TextField
        label={adminCopy.durationLabel}
        hint={adminCopy.durationHint}
        name="estimatedDurationMinutes"
        type="number"
        min={1}
        max={60}
        value={estimatedDurationMinutes}
        onChange={(event) => setEstimatedDurationMinutes(event.target.value)}
        disabled={isPending}
        required
      />

      <TextField
        label={adminCopy.videoLabel}
        name="videoUrl"
        value={videoUrl}
        onChange={(event) => setVideoUrl(event.target.value)}
        disabled={isPending}
        placeholder="https://"
      />

      <TagMultiSelect
        legend={adminCopy.equipmentLegend}
        options={equipmentOptions}
        selected={equipmentTags}
        onChange={setEquipmentTags}
        disabled={isPending}
      />

      <TagMultiSelect
        legend={adminCopy.capabilityLegend}
        hint={adminCopy.capabilityHint}
        options={capabilityOptions}
        selected={requiredCapabilityTags}
        onChange={setRequiredCapabilityTags}
        disabled={isPending}
      />

      <TagMultiSelect
        legend={adminCopy.contraindicationLegend}
        options={contraindicationOptions}
        selected={contraindicationTags}
        onChange={setContraindicationTags}
        disabled={isPending}
      />

      <TagMultiSelect
        legend={adminCopy.intensityLegend}
        options={intensityOptions}
        selected={intensityTags}
        onChange={setIntensityTags}
        disabled={isPending}
      />

      <TagMultiSelect
        legend={adminCopy.musclesLegend}
        options={muscleOptions}
        selected={targetMuscles}
        onChange={setTargetMuscles}
        disabled={isPending}
      />

      {mode === "edit" ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-ink">
            {adminCopy.uploadLabel}
          </p>
          <p className="text-sm text-ink-soft">{adminCopy.uploadHint}</p>
          {imagePaths.length > 0 ? (
            <ul className="space-y-3 text-sm text-ink-soft">
              {imagePaths.map((path) => {
                const publicSrc = resolveExerciseImageSrc(path);
                return (
                  <li key={path} className="flex flex-col gap-2">
                    {publicSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={publicSrc}
                        alt=""
                        className="h-40 w-40 rounded-2xl object-cover"
                      />
                    ) : null}
                    <span>{path}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) =>
              setImageFile(event.target.files?.[0] ?? null)
            }
            disabled={isPending}
            className="field-control block w-full px-4 py-3 text-sm"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={isPending || !imageFile}
            onClick={handleImageUpload}
          >
            {adminCopy.imageUploadCta}
          </Button>
        </div>
      ) : null}

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? adminCopy.saving : adminCopy.saveDraftCta}
        </Button>
        {mode === "edit" ? (
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={handlePublishToggle}
            className="w-full sm:w-auto"
          >
            {isPublished ? adminCopy.unpublishCta : adminCopy.publishCta}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
