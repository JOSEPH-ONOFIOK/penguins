import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Snowfall from "@/components/Snowfall";
import { COLLECTION } from "@/lib/collection";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "h00dguins Allowlist",
  description: `${COLLECTION.supply} hand-drawn penguins on ${COLLECTION.chain}. Claim your allowlist spot.`,
  openGraph: {
    title: "h00dguins Allowlist",
    description: `${COLLECTION.supply} hand-drawn penguins on ${COLLECTION.chain}.`,
    images: ["/1500x500.jpeg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Snowfall />
        {children}
      </body>
    </html>
  );
}
