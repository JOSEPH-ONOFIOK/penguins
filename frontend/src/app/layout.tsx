import type { Metadata, Viewport } from "next";
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

const description = `${COLLECTION.supply} hand-drawn penguins minting on ${COLLECTION.chain}. Complete the tasks to enter the allowlist.`;

// Absolute URLs for share cards. Set NEXT_PUBLIC_SITE_URL to the live domain.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "h00dguins",
    template: "%s · h00dguins",
  },
  description,
  applicationName: "h00dguins",
  keywords: ["h00dguins", "NFT", "Robinhood", "allowlist", "penguins", "$RPENG"],
  openGraph: {
    type: "website",
    siteName: "h00dguins",
    title: "h00dguins",
    description,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "h00dguins",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#050a1c",
  colorScheme: "dark",
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
