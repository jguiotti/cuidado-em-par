import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { IconShield } from "@/components/brand/soft-icons";
import { privacyCopy } from "@/lib/i18n/privacy-pt-br";

export default function TermsPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 pb-10">
      <BrandLogo variant="header" href="/" />

      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-mint-deep">
          <IconShield size={18} />
          {privacyCopy.eyebrow}
        </p>
        <h1 className="text-3xl font-bold leading-tight text-ink">
          {privacyCopy.title}
        </h1>
        <p className="text-sm text-ink-soft">
          {privacyCopy.updatedAtLabel}: {privacyCopy.updatedAt}
        </p>
        <p className="text-base leading-relaxed text-ink-soft">
          {privacyCopy.intro}
        </p>
      </header>

      <aside
        className="surface-raised space-y-2 p-5 text-sm leading-relaxed text-ink"
        role="note"
      >
        <p className="font-semibold text-ink">{privacyCopy.controllerNotice}</p>
      </aside>

      <div className="flex flex-col gap-6">
        {privacyCopy.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="surface space-y-3 p-6"
          >
            <h2 className="text-xl font-bold text-ink">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-base leading-relaxed text-ink-soft"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="text-base leading-relaxed text-ink">{privacyCopy.closing}</p>

      <Link
        href="/"
        className="focus-ring text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
