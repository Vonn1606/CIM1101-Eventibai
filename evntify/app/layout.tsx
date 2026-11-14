import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Newsreader, Playfair_Display, Crimson_Text } from "next/font/google";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-crimson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eventify!",
  description:
    "Join the campus event community. Discover and join upcoming talks, concerts, and hackathons.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${dmSans.variable} ${newsreader.variable} ${playfair.variable} ${crimson.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
