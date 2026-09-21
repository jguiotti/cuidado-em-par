import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";

import "./globals.css";

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cuidado em Par",
  description:
    "Saúde preventiva acessível, com treinos e refeições seguros para o seu contexto.",
  applicationName: "Cuidado em Par",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Cuidado em Par",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon.png", sizes: "512x512", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#4A7C6E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
