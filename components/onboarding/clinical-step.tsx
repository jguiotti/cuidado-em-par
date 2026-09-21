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

import { updateClinicalAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { TextField } from "@/components/ui/text-field";
import {
  CLINICAL_GROUP_LABELS_PT_BR,
  getClinicalCondition,
  searchClinicalConditions,
} from "@/lib/clinical/conditions-catalog";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import { ONBOARDING_TOTAL_STEPS } from "@/lib/onboarding/progress";

interface ClinicalStepProps {
  initialConditions?: string[];
}

const MIN_QUERY_LENGTH = 1;

export function ClinicalStep({
  initialConditions = [],
}: ClinicalStepProps) {
  const router = useRouter();
  const listId = "clinical-search-results";
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(initialConditions);
  const [hasChosenNone, setHasChosenNone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchResults = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return [];
    }
    return searchClinicalConditions(trimmed).filter(
      (condition) => !selected.includes(condition.slug),
    );
  }, [query, selected]);

  const selectedConditions = useMemo(
    () =>
      selected
        .map((slug) => getClinicalCondition(slug))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [selected],
  );

  const canContinue = hasChosenNone || selected.length > 0;
  const showResults = query.trim().length >= MIN_QUERY_LENGTH;

  function addCondition(slug: string) {
    setHasChosenNone(false);
    setSelected((current) =>
      current.includes(slug) ? current : [...current, slug],
    );
    setQuery("");
    searchRef.current?.focus();
  }

  function removeCondition(slug: string) {
    setSelected((current) => current.filter((item) => item !== slug));
  }

  function chooseNone() {
    setHasChosenNone(true);
    setSelected([]);
    setQuery("");
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && searchResults[0]) {
      event.preventDefault();
      addCondition(searchResults[0].slug);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!canContinue) {
      setError(onboardingCopy.clinical.needChoice);
      return;
    }

    startTransition(async () => {
      const result = await updateClinicalAction({
        conditionTags: hasChosenNone ? [] : selected,
        noneSelected: hasChosenNone,
      });

      if (!result.ok) {
        if (result.code === "unauthenticated") {
          router.replace("/login?next=/onboarding/clinical");
          return;
        }
        if (result.code === "consent_required") {
          router.replace("/onboarding/consent");
          return;
        }
        setError(onboardingCopy.genericError);
        return;
      }

      router.push("/onboarding/mobility");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <ProgressSteps
        current={5}
        total={ONBOARDING_TOTAL_STEPS}
        label={onboardingCopy.progressLabel(5, ONBOARDING_TOTAL_STEPS)}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-ink">
          {onboardingCopy.clinical.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {onboardingCopy.clinical.support}
        </p>
      </div>

      {selectedConditions.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">
            {onboardingCopy.clinical.selectedLabel(selectedConditions.length)}
          </p>
          <ul className="flex flex-col gap-2">
            {selectedConditions.map((condition) => (
              <li key={condition.slug}>
                <button
                  type="button"
                  onClick={() => removeCondition(condition.slug)}
                  className="focus-ring flex w-full items-start justify-between gap-3 rounded-[var(--radius-soft)] bg-mint px-4 py-3 text-left"
                  disabled={isPending}
                >
                  <span className="space-y-1">
                    <span className="block text-base font-semibold text-ink">
                      {condition.labelPtBr}
                    </span>
                    <span className="block text-sm font-normal text-ink-soft">
                      {CLINICAL_GROUP_LABELS_PT_BR[condition.group]}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-ink">
                    {onboardingCopy.clinical.remove}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-ink-soft">
            {onboardingCopy.clinical.addMoreHint}
          </p>
        </div>
      ) : null}

      {hasChosenNone ? (
        <div className="rounded-[var(--radius-soft)] bg-mint px-4 py-3 text-base font-semibold text-ink">
          {onboardingCopy.clinical.noneConfirmed}
        </div>
      ) : null}

      <div className="space-y-3">
        <TextField
          ref={searchRef}
          label={onboardingCopy.clinical.searchLabel}
          name="clinicalSearch"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={onboardingCopy.clinical.searchPlaceholder}
          hint={onboardingCopy.clinical.searchHint}
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
                {onboardingCopy.clinical.noResults}
              </p>
            ) : (
              searchResults.map((condition) => (
                <button
                  key={condition.slug}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => addCondition(condition.slug)}
                  className="focus-ring flex w-full flex-col gap-1 rounded-[var(--radius-soft)] bg-surface-raised px-4 py-3 text-left transition hover:bg-sand"
                  disabled={isPending}
                >
                  <span className="text-base font-semibold text-ink">
                    {condition.labelPtBr}
                  </span>
                  <span className="text-sm text-ink-soft">
                    {CLINICAL_GROUP_LABELS_PT_BR[condition.group]} ·{" "}
                    {onboardingCopy.clinical.add}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-ink-soft">
            {onboardingCopy.clinical.searchIdle}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={chooseNone}
        className={`focus-ring rounded-[var(--radius-soft)] p-4 text-left text-base font-semibold transition ${
          hasChosenNone
            ? "bg-mint text-ink shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-mint-deep)_55%,transparent)]"
            : "bg-surface-raised text-ink"
        }`}
        aria-pressed={hasChosenNone}
        disabled={isPending}
      >
        {onboardingCopy.clinical.none}
      </button>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Button
        type="submit"
        disabled={isPending || !canContinue}
        className="w-full"
      >
        {isPending ? onboardingCopy.saving : onboardingCopy.clinical.cta}
      </Button>
    </form>
  );
}
