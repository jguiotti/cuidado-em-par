"use client";

import { useMemo, useState } from "react";

import { TextField } from "@/components/ui/text-field";
import { adminCopy } from "@/lib/i18n/admin-pt-br";

interface TagOption {
  slug: string;
  label: string;
}

interface TagMultiSelectProps {
  legend: string;
  hint?: string;
  options: TagOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export function TagMultiSelect({
  legend,
  hint,
  options,
  selected,
  onChange,
  disabled = false,
}: TagMultiSelectProps) {
  const [query, setQuery] = useState("");
  const requireQuery = options.length > 12;

  const selectedOptions = useMemo(
    () =>
      selected
        .map((slug) => options.find((item) => item.slug === slug))
        .filter((item): item is TagOption => Boolean(item)),
    [options, selected],
  );

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (requireQuery && normalized.length < 1) {
      return [];
    }
    return options.filter((item) => {
      if (selected.includes(item.slug)) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      return (
        item.label.toLocaleLowerCase("pt-BR").includes(normalized) ||
        item.slug.includes(normalized.replace(/\s+/g, "-"))
      );
    });
  }, [options, query, requireQuery, selected]);

  function add(slug: string) {
    onChange(selected.includes(slug) ? selected : [...selected, slug]);
    setQuery("");
  }

  function remove(slug: string) {
    onChange(selected.filter((item) => item !== slug));
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      {hint ? (
        <p className="text-sm leading-relaxed text-ink-soft">{hint}</p>
      ) : null}

      {selectedOptions.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {selectedOptions.map((item) => (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() => remove(item.slug)}
                className="focus-ring flex w-full items-center justify-between gap-3 rounded-[var(--radius-soft)] bg-mint px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-ink">
                  {item.label}
                </span>
                <span className="text-sm text-ink">{adminCopy.remove}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">
          {adminCopy.selectedCount(0)}
        </p>
      )}

      <TextField
        label={adminCopy.searchTagsLabel}
        name={`${legend}-search`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={adminCopy.searchTagsPlaceholder}
        disabled={disabled}
      />

      {requireQuery && query.trim().length < 1 ? (
        <p className="text-sm text-ink-soft">
          Digite para buscar entre as opções.
        </p>
      ) : (
        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
          {results.slice(0, 40).map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => add(item.slug)}
              className="focus-ring rounded-[var(--radius-soft)] bg-surface-raised px-4 py-3 text-left text-sm font-semibold text-ink"
            >
              {item.label} · {adminCopy.add}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  );
}
