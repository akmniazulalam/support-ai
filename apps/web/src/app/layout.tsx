import type { Metadata } from "next";
import { Anton_SC, Cal_Sans, Google_Sans, Jost, Lexend, Poppins, Syne } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";

const siteUrl = "https://support-ai-web-eosin.vercel.app";
const siteDescription =
  "Build AI support agents from your business knowledge and deliver instant customer answers.";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});
const anton = Anton_SC({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400"
});
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: "400"
});
const cal = Cal_Sans({
  variable: "--font-cal",
  subsets: ["latin"],
  weight: "400"
});
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "100"
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
      className={`${jost.variable} ${syne.variable} ${google.variable} ${lexend.variable} ${poppins.variable} ${anton.variable} ${cal.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white" cz-shortcut-listen="true">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

