import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";
import { brandCopy } from "@/lib/i18n/brand-pt-br";

type BrandLogoVariant = "mark" | "header" | "hero" | "stacked";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  /** Pass null to render without a link (e.g. already on home). */
  href?: string | null;
  className?: string;
}

const MARK_SIZES: Record<BrandLogoVariant, number> = {
  mark: 36,
  header: 40,
  hero: 52,
  stacked: 48,
};

export function BrandLogo({
  variant = "header",
  href = "/",
  className = "",
}: BrandLogoProps) {
  const size = MARK_SIZES[variant];

  const content =
    variant === "stacked" ? (
      <span
        className={`inline-flex flex-col items-center gap-3 ${className}`.trim()}
      >
        <span className="inline-flex items-center gap-3 rounded-[var(--radius-pill)] bg-surface px-5 py-3 shadow-[0_12px_36px_color-mix(in_srgb,var(--color-ink)_8%,transparent)]">
          <BrandMark size={size} />
          <span className="text-lg font-bold tracking-tight text-ink">
            {brandCopy.name}
          </span>
        </span>
        <span className="text-sm font-medium text-mint-deep">
          {brandCopy.lockupEyebrow}
        </span>
      </span>
    ) : (
      <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
        <span className="inline-flex overflow-hidden rounded-full bg-surface shadow-[0_8px_24px_color-mix(in_srgb,var(--color-ink)_8%,transparent)]">
          <BrandMark size={size} />
        </span>
        {variant !== "mark" ? (
          <span className="flex min-w-0 flex-col leading-tight">
            <span
              className={
                variant === "hero"
                  ? "text-xl font-bold tracking-tight text-ink sm:text-2xl"
                  : "text-base font-bold tracking-tight text-ink"
              }
            >
              {brandCopy.name}
            </span>
            {variant === "hero" ? (
              <span className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                {brandCopy.tagline}
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
    );

  if (!href) {
    return (
      <span className="inline-flex" aria-label={brandCopy.name}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="focus-ring inline-flex rounded-[var(--radius-soft)]"
      aria-label={brandCopy.name}
    >
      {content}
    </Link>
  );
}
