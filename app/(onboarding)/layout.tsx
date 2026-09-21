export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-8 sm:px-6">
      <p className="mb-6 text-sm font-semibold text-mint-deep">Cuidado em Par</p>
      {children}
    </div>
  );
}
