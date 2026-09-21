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

import { updateMyClinicalConditionsAction } from "@/app/actions/profile-health";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import {
  CLINICAL_GROUP_LABELS_PT_BR,
  getClinicalCondition,
  searchClinicalConditions,
} from "@/lib/clinical/conditions-catalog";
import { accountCopy } from "@/lib/i18n/account-pt-br";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";

interface HealthConditionsEditPanelProps {
  initialConditions: string[];
}

const MIN_QUERY_LENGTH = 1;

export function HealthConditionsEditPanel({
  initialConditions,
}: HealthConditionsEditPanelProps) {
  const router = useRouter();
  const listId = "account-clinical-search-results";
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(initialConditions);
  const [hasChosenNone, setHasChosenNone] = useState(
    initialConditions.length === 0,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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

  const canSave = hasChosenNone || selected.length > 0;
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
    setMessage(null);

    if (!canSave) {
      setError(onboardingCopy.clinical.needChoice);
      return;
    }

    startTransition(async () => {
      const result = await updateMyClinicalConditionsAction({
        conditionTags: hasChosenNone ? [] : selected,
        noneSelected: hasChosenNone,
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
          {accountCopy.healthEdit.clinicalTitle}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.healthEdit.clinicalSupport}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          ref={searchRef}
          label={onboardingCopy.clinical.searchLabel}
          hint={onboardingCopy.clinical.searchHint}
          name="clinicalSearch"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={onboardingCopy.clinical.searchPlaceholder}
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
                {onboardingCopy.clinical.noResults}
              </li>
            ) : (
              searchResults.map((condition) => (
                <li key={condition.slug}>
                  <button
                    type="button"
                    role="option"
                    className="focus-ring flex w-full flex-col items-start gap-0.5 rounded-[1rem] px-3 py-2 text-left hover:bg-mint/40"
                    onClick={() => addCondition(condition.slug)}
                  >
                    <span className="text-sm font-semibold text-ink">
                      {condition.labelPtBr}
                    </span>
                    <span className="text-xs text-ink-soft">
                      {CLINICAL_GROUP_LABELS_PT_BR[condition.group]}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}

        {selectedConditions.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">
              {onboardingCopy.clinical.selectedLabel(selectedConditions.length)}
            </p>
            <ul className="flex flex-wrap gap-2">
              {selectedConditions.map((condition) => (
                <li key={condition.slug}>
                  <button
                    type="button"
                    className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] bg-mint px-3 py-1 text-sm font-semibold text-mint-deep"
                    onClick={() => removeCondition(condition.slug)}
                    aria-label={`${onboardingCopy.clinical.remove}: ${condition.labelPtBr}`}
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
            hasChosenNone
              ? "bg-mint text-ink"
              : "bg-surface-raised text-ink-soft"
          }`}
          onClick={chooseNone}
          disabled={isPending}
        >
          {onboardingCopy.clinical.none}
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
