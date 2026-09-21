import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-mint-deep text-surface hover:opacity-90 disabled:opacity-60",
  secondary:
    "bg-surface-raised text-ink hover:opacity-90 disabled:opacity-60",
  ghost: "bg-transparent text-ink-soft hover:text-ink disabled:opacity-60",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-[var(--radius-soft)] px-5 text-base font-semibold transition ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
