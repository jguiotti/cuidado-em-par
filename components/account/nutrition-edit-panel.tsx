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

import { updateMyNutritionProfileAction } from "@/app/actions/profile-health";
import { Button } from "@/components/ui/button";
import {
  ChoiceCard,
  ChoiceCardGroup,
} from "@/components/ui/choice-card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { accountCopy } from "@/lib/i18n/account-pt-br";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import {
  getFoodAvoidCondition,
  searchFoodAvoidConditions,
} from "@/lib/nutrition/food-conditions-catalog";
import {
  DIET_PATTERN_VALUES,
  type DietPattern,
} from "@/lib/tags/constants";

interface NutritionEditPanelProps {
  initialDietPattern: DietPattern;
  initialAvoids: string[];
}

const MIN_QUERY_LENGTH = 1;

export function NutritionEditPanel({
  initialDietPattern,
  initialAvoids,
}: NutritionEditPanelProps) {
  const router = useRouter();
  const listId = "account-nutrition-search-results";
  const searchRef = useRef<HTMLInputElement>(null);
  const [dietPattern, setDietPattern] =
    useState<DietPattern>(initialDietPattern);
  const [avoids, setAvoids] = useState<string[]>(initialAvoids);
  const [query, setQuery] = useState("");
  const [hasChosenNoAvoids, setHasChosenNoAvoids] = useState(
    initialAvoids.length === 0,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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
  const canSave = hasChosenNoAvoids || avoids.length > 0;

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
    setMessage(null);

    if (!canSave) {
      setError(onboardingCopy.nutrition.needChoice);
      return;
    }

    startTransition(async () => {
      const result = await updateMyNutritionProfileAction({
        dietPattern,
        avoidsTags: hasChosenNoAvoids ? [] : avoids,
        noneAvoids: hasChosenNoAvoids,
      });

      if (!result.ok) {
        setError(accountCopy.genericError);
        return;
      }

      setMessage(accountCopy.saved);
      router.refresh();
    });
  }

  return (
    <Surface className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {accountCopy.healthEdit.nutritionTitle}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.healthEdit.nutritionSupport}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <TextField
          ref={searchRef}
          label={onboardingCopy.nutrition.searchLabel}
          hint={onboardingCopy.nutrition.searchHint}
          name="nutritionSearch"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={onboardingCopy.nutrition.searchPlaceholder}
          disabled={isPending}
          autoComplete="off"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listId}
          aria-autocomplete="list"
        />

        {showResults ? (
          <ul
            id={listId}
            role="listbox"
            className="max-h-48 space-y-1 overflow-y-auto rounded-[1.25rem] bg-surface-raised p-2"
          >
            {searchResults.length === 0 ? (
              <li className="px-3 py-2 text-sm text-ink-soft">
                {onboardingCopy.nutrition.noResults}
              </li>
            ) : (
              searchResults.map((condition) => (
                <li key={condition.slug}>
                  <button
                    type="button"
                    role="option"
                    className="focus-ring flex w-full flex-col items-start gap-0.5 rounded-[1rem] px-3 py-2 text-left hover:bg-mint/40"
                    onClick={() => addAvoid(condition.slug)}
                  >
                    <span className="text-sm font-semibold text-ink">
                      {condition.labelPtBr}
                    </span>
                    <span className="text-xs text-ink-soft">
                      {condition.groupLabelPtBr}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}

        {selectedAvoids.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">
              {onboardingCopy.nutrition.selectedLabel(selectedAvoids.length)}
            </p>
            <ul className="flex flex-wrap gap-2">
              {selectedAvoids.map((condition) => (
                <li key={condition.slug}>
                  <button
                    type="button"
                    className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] bg-mint px-3 py-1 text-sm font-semibold text-mint-deep"
                    onClick={() => removeAvoid(condition.slug)}
                    aria-label={`${onboardingCopy.nutrition.remove}: ${condition.labelPtBr}`}
                  >
                    {condition.labelPtBr}
                    <span aria-hidden>×</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <button
          type="button"
          className={`focus-ring rounded-[1.25rem] px-4 py-3 text-left text-sm font-semibold ${
            hasChosenNoAvoids
              ? "bg-mint text-ink"
              : "bg-surface-raised text-ink-soft"
          }`}
          onClick={chooseNoAvoids}
          disabled={isPending}
        >
          {onboardingCopy.nutrition.none}
        </button>

        <p className="text-xs leading-relaxed text-ink-soft">
          {accountCopy.healthEdit.motorHint}
        </p>

        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
        {message && !error ? (
          <p className="text-sm text-ink-soft" role="status">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending || !canSave} className="w-full">
          {accountCopy.healthEdit.save}
        </Button>
      </form>
    </Surface>
  );
}
