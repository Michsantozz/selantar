import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Instrument_Serif, Syne } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Selantar — Autonomous Dispute Mediator",
  description:
    "AI that listens to both sides, protects egos, and settles disputes on-chain. No lawyers. No delays.",
  openGraph: {
    title: "Selantar — Autonomous Dispute Mediator",
    description:
      "AI-powered B2B contract dispute mediation with on-chain settlements via ERC-8004.",
    url: "https://selantar.vercel.app",
    siteName: "Selantar",
    type: "website",
    images: [
      {
        url: "https://selantar.vercel.app/selantar-logo.png",
        width: 1200,
        height: 630,
        alt: "Selantar — Autonomous Dispute Mediator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selantar — Autonomous Dispute Mediator",
    description:
      "AI that listens to both sides, protects egos, and settles disputes on-chain.",
    images: ["https://selantar.vercel.app/selantar-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${syne.variable} antialiased`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="contents">{children}</main>
      </body>
    </html>
  );
}
