import type { ReactNode } from "react";

import { IconCheck } from "@/components/brand/soft-icons";

interface ChoiceCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  name: string;
  value: string;
}

export function ChoiceCard({
  label,
  description,
  selected,
  onSelect,
  name,
  value,
}: ChoiceCardProps) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-[1.25rem] p-4 transition focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-[var(--color-mint-deep)] ${
        selected
          ? "bg-mint text-ink shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-mint-deep)_40%,transparent)]"
          : "bg-surface text-ink shadow-[0_8px_24px_color-mix(in_srgb,var(--color-ink)_5%,transparent)]"
      }`}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
      />
      <span
        className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          selected
            ? "bg-mint-deep text-surface"
            : "bg-surface-raised text-transparent"
        }`}
        aria-hidden
      >
        {selected ? <IconCheck size={16} strokeWidth={2.5} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold">{label}</span>
        {description ? (
          <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

interface ChoiceCardGroupProps {
  children: ReactNode;
  legend: string;
}

export function ChoiceCardGroup({ children, legend }: ChoiceCardGroupProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">{legend}</legend>
      {children}
    </fieldset>
  );
}
