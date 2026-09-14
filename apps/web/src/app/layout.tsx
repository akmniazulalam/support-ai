import type { Metadata } from "next";
import { Geist, Geist_Mono, Jost, Syne } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SupportAI - Intelligent Customer Support",
  description: "Instant AI customer support powered by your business knowledge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jost.variable} ${syne.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white" cz-shortcut-listen="true">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}


