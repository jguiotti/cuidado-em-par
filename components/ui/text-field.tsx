import { forwardRef, type InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, hint, id, className = "", ...props }, ref) {
    const fieldId = id ?? props.name;

    return (
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        {label}
        <input
          ref={ref}
          id={fieldId}
          className={`field-control min-h-12 px-4 text-base font-normal text-ink ${className}`}
          {...props}
        />
        {hint ? (
          <span className="text-sm font-normal leading-relaxed text-ink-soft">
            {hint}
          </span>
        ) : null}
      </label>
    );
  },
);
