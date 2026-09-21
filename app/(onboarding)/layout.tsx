import { BrandLogo } from "@/components/brand/brand-logo";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-8 sm:px-6">
      <div className="mb-8">
        <BrandLogo variant="header" href={null} />
      </div>
      {children}
    </div>
  );
}
