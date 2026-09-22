import Image from "next/image";
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

const MARK_SIZES: Record<"mark" | "hero" | "stacked", number> = {
  mark: 36,
  hero: 56,
  stacked: 72,
};

export function BrandLogo({
  variant = "header",
  href = "/",
  className = "",
}: BrandLogoProps) {
  const content =
    variant === "header" ? (
      <span className={`inline-flex items-center ${className}`.trim()}>
        <Image
          src="/brand/logo-horizontal.png"
          alt={brandCopy.name}
          width={220}
          height={56}
          className="h-10 w-auto max-w-[min(100%,14rem)] object-contain object-left sm:h-11"
          priority
        />
      </span>
    ) : variant === "stacked" ? (
      <span
        className={`inline-flex flex-col items-center gap-2 ${className}`.trim()}
      >
        <Image
          src="/brand/logo-vertical.png"
          alt={brandCopy.name}
          width={160}
          height={200}
          className="h-auto w-36 object-contain sm:w-40"
          priority
        />
      </span>
    ) : variant === "hero" ? (
      <span
        className={`inline-flex flex-col items-start gap-3 ${className}`.trim()}
      >
        <Image
          src="/brand/logo-horizontal.png"
          alt={brandCopy.name}
          width={280}
          height={72}
          className="h-12 w-auto max-w-full object-contain object-left sm:h-14"
          priority
        />
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {brandCopy.tagline}
        </span>
      </span>
    ) : (
      <span className={`inline-flex items-center ${className}`.trim()}>
        <BrandMark size={MARK_SIZES.mark} />
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
