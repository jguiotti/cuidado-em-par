import type { ReactNode } from "react";

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
      className={`focus-within:outline-none block cursor-pointer rounded-[var(--radius-soft)] p-4 transition ${
        selected
          ? "bg-mint text-ink shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-mint-deep)_55%,transparent)]"
          : "bg-surface-raised text-ink"
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
      <span className="block text-base font-semibold">{label}</span>
      {description ? (
        <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
          {description}
        </span>
      ) : null}
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
