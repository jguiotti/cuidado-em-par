import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import {
  IconLeaf,
  IconLock,
  IconPair,
  IconPerson,
  IconShield,
} from "@/components/brand/soft-icons";
import { welcomeCopy } from "@/lib/i18n/brand-pt-br";

function FeatureIcon({
  id,
  tone,
}: {
  id: string;
  tone: "mint" | "blush";
}) {
  const toneClass =
    tone === "blush"
      ? "bg-blush text-blush-deep"
      : "bg-mint text-mint-deep";
  const Icon =
    id === "circle" ? IconPair : id === "rhythm" ? IconLeaf : IconPerson;

  return (
    <span
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${toneClass}`}
    >
      <Icon size={22} strokeWidth={1.75} />
    </span>
  );
}

export default function WelcomePage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-10 pb-4">
      <div className="flex flex-col items-center gap-6 pt-2 text-center">
        <BrandLogo variant="stacked" href={null} />
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink sm:text-[2.75rem]">
            {welcomeCopy.title}
          </h1>
          <p className="mx-auto max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
            {welcomeCopy.support}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-mint-deep px-6 text-base font-semibold text-surface shadow-[0_10px_28px_color-mix(in_srgb,var(--color-mint-deep)_35%,transparent)] transition hover:opacity-90"
        >
          <IconLock size={18} className="text-surface" />
          {welcomeCopy.primaryCta}
        </Link>
        <Link
          href="/terms"
          className="focus-ring inline-flex min-h-14 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-blush px-6 text-base font-semibold text-ink transition hover:opacity-90"
        >
          <IconShield size={18} className="text-blush-deep" />
          {welcomeCopy.secondaryCta}
        </Link>
        <p className="flex items-center justify-center gap-2 pt-1 text-sm text-ink-soft">
          <IconLock size={16} className="text-mint-deep" />
          {welcomeCopy.accessNote}
        </p>
      </div>

      <section className="flex flex-col gap-4" aria-label="Pilares">
        {welcomeCopy.features.map((feature) => {
          const isCentered = "centered" in feature && feature.centered;
          return (
            <article
              key={feature.id}
              className={`surface ${
                isCentered
                  ? "flex flex-col items-center gap-3 px-6 py-7 text-center"
                  : "flex items-start gap-4 p-5"
              }`}
            >
              <FeatureIcon id={feature.id} tone={feature.tone} />
              <div className={`space-y-1.5 ${isCentered ? "max-w-sm" : ""}`}>
                <h2 className="text-lg font-bold text-ink">{feature.title}</h2>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {feature.body}
                </p>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
