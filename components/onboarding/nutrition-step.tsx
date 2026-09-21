"use client";

import { useRouter } from "next/navigation";
import {
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { updateNutritionAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import {
  ChoiceCard,
  ChoiceCardGroup,
} from "@/components/ui/choice-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { TextField } from "@/components/ui/text-field";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import {
  getFoodAvoidCondition,
  searchFoodAvoidConditions,
} from "@/lib/nutrition/food-conditions-catalog";
import { ONBOARDING_TOTAL_STEPS } from "@/lib/onboarding/progress";
import {
  DIET_PATTERN_VALUES,
  type DietPattern,
} from "@/lib/tags/constants";

interface NutritionStepProps {
  initialDietPattern?: DietPattern;
  initialAvoids?: string[];
}

const MIN_QUERY_LENGTH = 1;

export function NutritionStep({
  initialDietPattern = "no-restriction",
  initialAvoids = [],
}: NutritionStepProps) {
  const router = useRouter();
  const listId = "nutrition-search-results";
  const searchRef = useRef<HTMLInputElement>(null);
  const [dietPattern, setDietPattern] =
    useState<DietPattern>(initialDietPattern);
  const [avoids, setAvoids] = useState<string[]>(initialAvoids);
  const [query, setQuery] = useState("");
  const [hasChosenNoAvoids, setHasChosenNoAvoids] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchResults = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return [];
    }
    return searchFoodAvoidConditions(trimmed).filter(
      (condition) => !avoids.includes(condition.slug),
    );
  }, [query, avoids]);

  const selectedAvoids = useMemo(
    () =>
      avoids
        .map((slug) => getFoodAvoidCondition(slug))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [avoids],
  );

  const showResults = query.trim().length >= MIN_QUERY_LENGTH;
  const canContinue = hasChosenNoAvoids || avoids.length > 0;

  function addAvoid(slug: string) {
    setHasChosenNoAvoids(false);
    setAvoids((current) =>
      current.includes(slug) ? current : [...current, slug],
    );
    setQuery("");
    searchRef.current?.focus();
  }

  function removeAvoid(slug: string) {
    setAvoids((current) => current.filter((item) => item !== slug));
  }

  function chooseNoAvoids() {
    setHasChosenNoAvoids(true);
    setAvoids([]);
    setQuery("");
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && searchResults[0]) {
      event.preventDefault();
      addAvoid(searchResults[0].slug);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!canContinue) {
      setError(onboardingCopy.nutrition.needChoice);
      return;
    }

    startTransition(async () => {
      const result = await updateNutritionAction({
        dietPattern,
        avoidsTags: hasChosenNoAvoids ? [] : avoids,
      });

      if (!result.ok) {
        if (result.code === "unauthenticated") {
          router.replace("/login?next=/onboarding/nutrition");
          return;
        }
        if (result.code === "consent_required") {
          router.replace("/onboarding/consent");
          return;
        }
        setError(onboardingCopy.genericError);
        return;
      }

      router.push("/onboarding/cycle");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <ProgressSteps
        current={7}
        total={ONBOARDING_TOTAL_STEPS}
        label={onboardingCopy.progressLabel(7, ONBOARDING_TOTAL_STEPS)}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-ink">
          {onboardingCopy.nutrition.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {onboardingCopy.nutrition.support}
        </p>
      </div>

      <ChoiceCardGroup legend={onboardingCopy.nutrition.patternLegend}>
        {DIET_PATTERN_VALUES.map((value) => (
          <ChoiceCard
            key={value}
            name="dietPattern"
            value={value}
            label={onboardingCopy.nutrition.patterns[value]}
            selected={dietPattern === value}
            onSelect={() => setDietPattern(value)}
          />
        ))}
      </ChoiceCardGroup>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-ink">
          {onboardingCopy.nutrition.avoidsLegend}
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">
          {onboardingCopy.nutrition.avoidsHint}
        </p>
      </div>

      {selectedAvoids.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">
            {onboardingCopy.nutrition.selectedLabel(selectedAvoids.length)}
          </p>
          <ul className="flex flex-col gap-2">
            {selectedAvoids.map((condition) => (
              <li key={condition.slug}>
                <button
                  type="button"
                  onClick={() => removeAvoid(condition.slug)}
                  className="focus-ring flex w-full items-start justify-between gap-3 rounded-[var(--radius-soft)] bg-mint px-4 py-3 text-left"
                  disabled={isPending}
                >
                  <span className="space-y-1">
                    <span className="block text-base font-semibold text-ink">
                      {condition.labelPtBr}
                    </span>
                    <span className="block text-sm font-normal text-ink-soft">
                      {condition.groupLabelPtBr}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-ink">
                    {onboardingCopy.nutrition.remove}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-ink-soft">
            {onboardingCopy.nutrition.addMoreHint}
          </p>
        </div>
      ) : null}

      {hasChosenNoAvoids && avoids.length === 0 ? (
        <div className="rounded-[var(--radius-soft)] bg-mint px-4 py-3 text-base font-semibold text-ink">
          {onboardingCopy.nutrition.noneConfirmed}
        </div>
      ) : null}

      <div className="space-y-3">
        <TextField
          ref={searchRef}
          label={onboardingCopy.nutrition.searchLabel}
          name="nutritionSearch"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={onboardingCopy.nutrition.searchPlaceholder}
          hint={onboardingCopy.nutrition.searchHint}
          disabled={isPending}
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
        />

        {showResults ? (
          <div className="space-y-2" id={listId} role="listbox">
            {searchResults.length === 0 ? (
              <p className="text-sm leading-relaxed text-ink-soft">
                {onboardingCopy.nutrition.noResults}
              </p>
            ) : (
              searchResults.map((condition) => (
                <button
                  key={condition.slug}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => addAvoid(condition.slug)}
                  className="focus-ring flex w-full flex-col gap-1 rounded-[var(--radius-soft)] bg-surface-raised px-4 py-3 text-left transition hover:bg-sand"
                  disabled={isPending}
                >
                  <span className="text-base font-semibold text-ink">
                    {condition.labelPtBr}
                  </span>
                  <span className="text-sm text-ink-soft">
                    {condition.groupLabelPtBr} ·{" "}
                    {onboardingCopy.nutrition.add}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-ink-soft">
            {onboardingCopy.nutrition.searchIdle}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={chooseNoAvoids}
        className={`focus-ring rounded-[var(--radius-soft)] p-4 text-left text-base font-semibold transition ${
          hasChosenNoAvoids && avoids.length === 0
            ? "bg-mint text-ink shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-mint-deep)_55%,transparent)]"
            : "bg-surface-raised text-ink"
        }`}
        aria-pressed={hasChosenNoAvoids && avoids.length === 0}
        disabled={isPending}
      >
        {onboardingCopy.nutrition.none}
      </button>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Button
        type="submit"
        disabled={isPending || !canContinue}
        className="w-full"
      >
        {isPending ? onboardingCopy.saving : onboardingCopy.nutrition.cta}
      </Button>
    </form>
  );
}
