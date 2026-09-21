"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import {
  attachMealImagePathAction,
  createMealAction,
  createMealImageUploadAction,
  setMealPublishedAction,
  updateMealAction,
} from "@/app/actions/admin-meals";
import { TagMultiSelect } from "@/components/admin/tag-multi-select";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { TextField } from "@/components/ui/text-field";
import {
  MEAL_CONTAINS_SLUGS,
  MEAL_DIET_SLUGS,
  MEAL_SLOT_SLUGS,
  type MealAdminRow,
  type MealFormInput,
  type MealIngredient,
} from "@/lib/admin/meal-tags";
import { adminCopy } from "@/lib/i18n/admin-pt-br";
import { createClient } from "@/lib/supabase/client";
import { TAG_LABELS_PT_BR } from "@/lib/tags/labels";
import type { TagSlug } from "@/lib/tags/constants";

interface MealFormProps {
  mode: "create" | "edit";
  initial?: MealAdminRow;
}

function emptyIngredient(): MealIngredient {
  return { item: "", qty: "", alt: "" };
}

export function MealForm({ mode, initial }: MealFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [mealSlot, setMealSlot] = useState(initial?.mealSlot ?? "lunch");
  const [containsTags, setContainsTags] = useState(
    initial?.containsTags ?? [],
  );
  const [dietCompatibleTags, setDietCompatibleTags] = useState(
    initial?.dietCompatibleTags ?? ["low-cost"],
  );
  const [ingredients, setIngredients] = useState<MealIngredient[]>(
    initial?.ingredients?.length
      ? initial.ingredients.map((row) => ({
          item: row.item,
          qty: row.qty,
          alt: row.alt ?? "",
        }))
      : [emptyIngredient()],
  );
  const [imagePaths, setImagePaths] = useState(initial?.imagePaths ?? []);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const containsOptions = useMemo(
    () =>
      MEAL_CONTAINS_SLUGS.map((slug) => ({
        slug,
        label:
          TAG_LABELS_PT_BR[slug as TagSlug] ??
          adminCopy.containsLabels?.[slug] ??
          adminCopy.contains?.[slug] ??
          slug,
      })),
    [],
  );
  const dietOptions = useMemo(
    () =>
      MEAL_DIET_SLUGS.map((slug) => ({
        slug,
        label:
          TAG_LABELS_PT_BR[slug as TagSlug] ??
          adminCopy.dietLabels?.[slug] ??
          adminCopy.diet?.[slug] ??
          slug,
      })),
    [],
  );

  function buildInput(): MealFormInput {
    return {
      title,
      description,
      mealSlot,
      containsTags,
      dietCompatibleTags,
      phaseTags: [],
      ingredients: ingredients.map((row) => ({
        item: row.item,
        qty: row.qty,
        ...(row.alt?.trim() ? { alt: row.alt.trim() } : {}),
      })),
      imagePaths,
    };
  }

  function mapError(code: string): string {
    switch (code) {
      case "publish_needs_diet_tags":
        return adminCopy.publishBlockedDietTags;
      case "publish_needs_low_cost":
        return adminCopy.publishBlockedLowCost;
      case "invalid_title":
        return adminCopy.invalidTitle;
      case "invalid_description":
        return adminCopy.invalidDescription;
      case "invalid_meal_slot":
        return adminCopy.invalidMealSlot;
      case "invalid_ingredients":
        return adminCopy.invalidIngredients;
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
          ? await createMealAction(input)
          : await updateMealAction(initial!.id, input);

      if (!result.ok) {
        setError(mapError(result.code));
        return;
      }

      if (mode === "create" && result.id) {
        router.replace(`/admin/meals/${result.id}`);
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
      const result = await setMealPublishedAction(initial.id, !isPublished);
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
      const signed = await createMealImageUploadAction(
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

      const attached = await attachMealImagePathAction(
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

  function updateIngredient(
    index: number,
    field: keyof MealIngredient,
    value: string,
  ) {
    setIngredients((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">
          {mode === "create"
            ? adminCopy.mealsFormCreateTitle
            : adminCopy.mealsFormEditTitle}
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
        {adminCopy.mealsDescriptionLabel}
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

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-ink">
          {adminCopy.mealSlotLegend}
        </legend>
        <div className="flex flex-wrap gap-2">
          {MEAL_SLOT_SLUGS.map((slot) => (
            <label
              key={slot}
              className={`focus-within:ring-2 focus-within:ring-mint-deep rounded-[var(--radius-soft)] px-4 py-2 text-sm font-medium ${
                mealSlot === slot
                  ? "bg-mint text-ink"
                  : "bg-surface-raised text-ink-soft"
              }`}
            >
              <input
                type="radio"
                name="mealSlot"
                value={slot}
                checked={mealSlot === slot}
                onChange={() => setMealSlot(slot)}
                disabled={isPending}
                className="sr-only"
              />
              {adminCopy.mealSlots[slot]}
            </label>
          ))}
        </div>
      </fieldset>

      <TagMultiSelect
        legend={adminCopy.containsLegend}
        hint={adminCopy.containsHint}
        options={containsOptions}
        selected={containsTags}
        onChange={setContainsTags}
        disabled={isPending}
      />

      <TagMultiSelect
        legend={adminCopy.dietLegend}
        hint={adminCopy.dietHint}
        options={dietOptions}
        selected={dietCompatibleTags}
        onChange={setDietCompatibleTags}
        disabled={isPending}
      />

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-ink">
          {adminCopy.ingredientsLegend}
        </legend>
        {ingredients.map((row, index) => (
          <div
            key={`ingredient-${index}`}
            className="space-y-3 rounded-[var(--radius-soft)] bg-surface-raised p-4"
          >
            <TextField
              label={adminCopy.ingredientItemLabel}
              name={`ingredient-item-${index}`}
              value={row.item}
              onChange={(event) =>
                updateIngredient(index, "item", event.target.value)
              }
              disabled={isPending}
              required
            />
            <TextField
              label={adminCopy.ingredientQtyLabel}
              name={`ingredient-qty-${index}`}
              value={row.qty}
              onChange={(event) =>
                updateIngredient(index, "qty", event.target.value)
              }
              disabled={isPending}
              required
            />
            <TextField
              label={adminCopy.ingredientAltLabel}
              name={`ingredient-alt-${index}`}
              value={row.alt ?? ""}
              onChange={(event) =>
                updateIngredient(index, "alt", event.target.value)
              }
              disabled={isPending}
            />
            {ingredients.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={() =>
                  setIngredients((current) =>
                    current.filter((_, rowIndex) => rowIndex !== index),
                  )
                }
              >
                {adminCopy.removeIngredientCta}
              </Button>
            ) : null}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          disabled={isPending || ingredients.length >= 30}
          onClick={() =>
            setIngredients((current) => [...current, emptyIngredient()])
          }
        >
          {adminCopy.addIngredientCta}
        </Button>
      </fieldset>

      {mode === "edit" ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-ink">
            {adminCopy.uploadLabel}
          </p>
          <p className="text-sm text-ink-soft">{adminCopy.mealsUploadHint}</p>
          {imagePaths.length > 0 ? (
            <ul className="space-y-1 text-sm text-ink-soft">
              {imagePaths.map((path) => (
                <li key={path}>{path}</li>
              ))}
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
