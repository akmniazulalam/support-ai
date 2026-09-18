import type { Metadata } from "next";
import { Google_Sans, Lexend } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";

const siteUrl = "https://support-ai-web-eosin.vercel.app";
const siteDescription =
  "Build AI support agents from your business knowledge and deliver instant customer answers.";


const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: "400"
});

const google = Google_Sans({
  variable: "--font-google",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SupportAI | AI-powered customer support",
    template: "%s | SupportAI",
  },
  description: siteDescription,
  applicationName: "SupportAI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SupportAI",
    title: "SupportAI | AI-powered customer support",
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: "SupportAI | AI-powered customer support",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${google.variable} ${lexend.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white" cz-shortcut-listen="true">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

