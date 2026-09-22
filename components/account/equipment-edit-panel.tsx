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

import { updateMyEquipmentAction } from "@/app/actions/profile-health";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import { accountCopy } from "@/lib/i18n/account-pt-br";
import { onboardingCopy } from "@/lib/i18n/onboarding-pt-br";
import {
  getHomeEquipmentOption,
  searchHomeEquipment,
} from "@/lib/onboarding/equipment";

interface EquipmentEditPanelProps {
  initialSelected: readonly string[];
}

export function EquipmentEditPanel({
  initialSelected,
}: EquipmentEditPanelProps) {
  const router = useRouter();
  const listId = "account-equipment-search-results";
  const searchRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string[]>([...initialSelected]);
  const [query, setQuery] = useState("");
  const [hasChosenNone, setHasChosenNone] = useState(
    initialSelected.length === 0,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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

  const canSave = hasChosenNone || selected.length > 0;

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
    setMessage(null);

    if (!canSave) {
      setError(onboardingCopy.equipment.needChoice);
      return;
    }

    startTransition(async () => {
      const result = await updateMyEquipmentAction({
        extraEquipmentTags: hasChosenNone ? [] : selected,
        noneSelected: hasChosenNone && selected.length === 0,
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
          {accountCopy.healthEdit.equipmentTitle}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.healthEdit.equipmentSupport}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {selectedOptions.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">
              {onboardingCopy.equipment.selectedLabel(selectedOptions.length)}
            </p>
            <ul className="flex flex-wrap gap-2">
              {selectedOptions.map((option) => (
                <li key={option.slug}>
                  <button
                    type="button"
                    className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] bg-mint px-3 py-1 text-sm font-semibold text-mint-deep"
                    onClick={() => removeItem(option.slug)}
                    aria-label={`${onboardingCopy.equipment.remove}: ${option.labelPtBr}`}
                  >
                    {option.labelPtBr}
                    <span aria-hidden>×</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <TextField
          ref={searchRef}
          label={onboardingCopy.equipment.searchLabel}
          hint={onboardingCopy.equipment.searchHint}
          name="equipmentSearch"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={onboardingCopy.equipment.searchPlaceholder}
          disabled={isPending}
          autoComplete="off"
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
        />

        <ul
          id={listId}
          role="listbox"
          className="max-h-56 space-y-1 overflow-y-auto rounded-[1.25rem] bg-surface-raised p-2"
        >
          {searchResults.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink-soft">
              {query.trim()
                ? onboardingCopy.equipment.noResults
                : onboardingCopy.equipment.searchIdle}
            </li>
          ) : (
            searchResults.map((option) => (
              <li key={option.slug}>
                <button
                  type="button"
                  role="option"
                  className="focus-ring flex w-full items-center justify-between rounded-[1rem] px-3 py-2 text-left hover:bg-mint/40"
                  onClick={() => addItem(option.slug)}
                >
                  <span className="text-sm font-semibold text-ink">
                    {option.labelPtBr}
                  </span>
                  <span className="text-xs text-ink-soft">
                    {onboardingCopy.equipment.add}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>

        <button
          type="button"
          onClick={chooseNone}
          className={`focus-ring rounded-[1.25rem] px-4 py-3 text-left text-sm font-semibold ${
            hasChosenNone && selected.length === 0
              ? "bg-mint text-ink"
              : "bg-surface-raised text-ink-soft"
          }`}
          aria-pressed={hasChosenNone && selected.length === 0}
          disabled={isPending}
        >
          {onboardingCopy.equipment.none}
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

        <Button
          type="submit"
          disabled={isPending || !canSave}
          className="w-full"
        >
          {accountCopy.healthEdit.save}
        </Button>
      </form>
    </Surface>
  );
}
