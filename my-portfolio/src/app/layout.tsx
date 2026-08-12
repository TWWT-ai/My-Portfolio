/**
 * UPDATED — root layout.
 *
 * Changes made:
 *  1. Added Inter via `next/font/google` and exposed it as `--font-inter`.
 *     The hero design is built on Inter; loading it through next/font keeps it
 *     self-hosted (no render-blocking <link> to Google, no layout shift).
 *     Geist / Geist Mono are left in place — nothing else was using Inter, so
 *     removing them would have been an unrelated change.
 *  2. Set the site metadata (was still the create-next-app default).
 *  3. Mounted <NavBar /> so the logo + burger menu are present on every route.
 *     NavBar is position:fixed, so it does not affect page flow. The existing
 *     /about, /projects and /contact pages were NOT edited, but they now sit
 *     underneath the fixed nav — if their headings feel tight against the top,
 *     bump their `py-16` to `pt-28`.
 *  4. Mounted <Footer /> globally. <body> is already a flex column, so the
 *     footer is pinned to the bottom of short pages rather than floating
 *     mid-screen. Its height is a known constant (`--footer-h` in globals.css)
 *     that the hero subtracts from 100vh, so the home page fits exactly one
 *     viewport with nothing to scroll.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/nav_bar";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Primary UI font for the hero and navigation. Inter is a variable font, so
// no `weight` is declared — the whole 100–900 axis is available (the hero uses
// 500/600/700) from a single file. Same convention as Geist above.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Temuulen Wang — Full-Stack Developer",
  description:
    "Portfolio of Temuulen Wang: full-stack developer building fast, data-driven products with TypeScript, Next.js and PostgreSQL.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
