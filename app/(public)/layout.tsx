export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-6 sm:px-6 sm:py-8">
      {children}
    </div>
  );
}
