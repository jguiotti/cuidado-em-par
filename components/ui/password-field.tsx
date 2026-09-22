"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

import {
  IconEye,
  IconEyeOff,
  IconLock,
} from "@/components/brand/soft-icons";

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  showLabel: string;
  hideLabel: string;
}

/** Password input with show/hide toggle. Default is hidden. */
export function PasswordField({
  label,
  showLabel,
  hideLabel,
  id,
  className = "",
  disabled,
  ...props
}: PasswordFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? props.name ?? generatedId;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink">
      {label}
      <span className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">
          <IconLock size={18} />
        </span>
        <input
          {...props}
          id={fieldId}
          type={isVisible ? "text" : "password"}
          disabled={disabled}
          className={`field-control min-h-14 w-full py-3 pl-12 pr-14 text-base font-normal text-ink ${className}`}
        />
        <button
          type="button"
          tabIndex={0}
          disabled={disabled}
          aria-label={isVisible ? hideLabel : showLabel}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
          className="focus-ring absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft hover:text-ink disabled:opacity-50"
        >
          {isVisible ? (
            <IconEyeOff size={18} strokeWidth={1.75} />
          ) : (
            <IconEye size={18} strokeWidth={1.75} />
          )}
        </button>
      </span>
    </label>
  );
}
