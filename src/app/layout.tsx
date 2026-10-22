import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/language-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mandi Mitra — Your AI Farming Companion",
  description:
    "Mandi Mitra helps Nashik-belt onion farmers find the mandi with the best expected net earnings after transport and mandi charges.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-(--color-bg) text-(--color-text)">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
