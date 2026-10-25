import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Newsreader, Playfair_Display } from "next/font/google";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
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
      className={`${jakarta.variable} ${dmSans.variable} ${newsreader.variable} ${playfair.variable}`}
    >
      <body
        className={`${jakarta.variable} ${dmSans.variable} ${newsreader.variable} ${playfair.variable} ethereal-bg min-h-screen font-sans text-slate-800 antialiased relative overflow-x-hidden flex flex-col justify-between selection:bg-rose-200 selection:text-rose-900`}
      >
        {children}
      </body>
    </html>
  );
}
