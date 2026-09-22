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

import { updateEquipmentAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { TextField } from "@/components/ui/text-field";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import {
  getHomeEquipmentOption,
  searchHomeEquipment,
} from "@/lib/onboarding/equipment";
import { ONBOARDING_TOTAL_STEPS } from "@/lib/onboarding/progress";

interface EquipmentStepProps {
  initialSelected?: string[];
}

export function EquipmentStep({ initialSelected = [] }: EquipmentStepProps) {
  const router = useRouter();
  const listId = "equipment-search-results";
  const searchRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [query, setQuery] = useState("");
  const [hasChosenNone, setHasChosenNone] = useState(
    initialSelected.length === 0,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchResults = useMemo(
    () =>
      searchHomeEquipment(query).filter(
        (option) => !selected.includes(option.slug),
      ),
    [query, selected],
  );

  const selectedOptions = useMemo(
    () =>
      selected
        .map((slug) => getHomeEquipmentOption(slug))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [selected],
  );

  const canContinue = hasChosenNone || selected.length > 0;

  function addItem(slug: string) {
    setHasChosenNone(false);
    setSelected((current) =>
      current.includes(slug) ? current : [...current, slug],
    );
    setQuery("");
    searchRef.current?.focus();
  }

  function removeItem(slug: string) {
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
      addItem(searchResults[0].slug);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!canContinue) {
      setError(onboardingCopy.equipment.needChoice);
      return;
    }

    startTransition(async () => {
      const result = await updateEquipmentAction({
        extraEquipmentTags: hasChosenNone ? [] : selected,
        noneSelected: hasChosenNone && selected.length === 0,
      });

      if (!result.ok) {
        if (result.code === "unauthenticated") {
          router.replace("/login?next=/onboarding/equipment");
          return;
        }
        if (result.code === "consent_required") {
          router.replace("/onboarding/consent");
          return;
        }
        setError(onboardingCopy.genericError);
        return;
      }

      router.push("/onboarding/nutrition");
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
          {onboardingCopy.equipment.title}
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {onboardingCopy.equipment.support}
        </p>
      </div>

      {selectedOptions.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">
            {onboardingCopy.equipment.selectedLabel(selectedOptions.length)}
          </p>
          <ul className="flex flex-col gap-2">
            {selectedOptions.map((option) => (
              <li key={option.slug}>
                <button
                  type="button"
                  onClick={() => removeItem(option.slug)}
                  className="focus-ring flex w-full items-center justify-between gap-3 rounded-[var(--radius-soft)] bg-mint px-4 py-3 text-left"
                  disabled={isPending}
                >
                  <span className="text-base font-semibold text-ink">
                    {option.labelPtBr}
                  </span>
                  <span className="shrink-0 text-sm font-medium text-ink">
                    {onboardingCopy.equipment.remove}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-ink-soft">
            {onboardingCopy.equipment.addMoreHint}
          </p>
        </div>
      ) : null}

      {hasChosenNone && selected.length === 0 ? (
        <div className="rounded-[var(--radius-soft)] bg-mint px-4 py-3 text-base font-semibold text-ink">
          {onboardingCopy.equipment.noneConfirmed}
        </div>
      ) : null}

      <div className="space-y-3">
        <TextField
          ref={searchRef}
          label={onboardingCopy.equipment.searchLabel}
          name="equipmentSearch"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={onboardingCopy.equipment.searchPlaceholder}
          hint={onboardingCopy.equipment.searchHint}
          disabled={isPending}
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
        />

        <div className="space-y-2" id={listId} role="listbox">
          {searchResults.length === 0 ? (
            <p className="text-sm leading-relaxed text-ink-soft">
              {query.trim()
                ? onboardingCopy.equipment.noResults
                : onboardingCopy.equipment.searchIdle}
            </p>
          ) : (
            searchResults.map((option) => (
              <button
                key={option.slug}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => addItem(option.slug)}
                className="focus-ring flex w-full flex-col gap-1 rounded-[var(--radius-soft)] bg-surface-raised px-4 py-3 text-left transition hover:bg-sand"
                disabled={isPending}
              >
                <span className="text-base font-semibold text-ink">
                  {option.labelPtBr}
                </span>
                <span className="text-sm text-ink-soft">
                  {onboardingCopy.equipment.add}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={chooseNone}
        className={`focus-ring rounded-[var(--radius-soft)] p-4 text-left text-base font-semibold transition ${
          hasChosenNone && selected.length === 0
            ? "bg-mint text-ink shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-mint-deep)_55%,transparent)]"
            : "bg-surface-raised text-ink"
        }`}
        aria-pressed={hasChosenNone && selected.length === 0}
        disabled={isPending}
      >
        {onboardingCopy.equipment.none}
      </button>

      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

      <Button
        type="submit"
        disabled={isPending || !canContinue}
        className="w-full"
      >
        {isPending ? onboardingCopy.saving : onboardingCopy.equipment.cta}
      </Button>
    </form>
  );
}
