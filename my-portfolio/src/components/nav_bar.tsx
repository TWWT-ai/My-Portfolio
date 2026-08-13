"use client";

/**
 * FILLED IN — this file was previously empty.
 *
 * Global navigation, mounted once in `src/app/layout.tsx` so it appears on
 * every route. Two fixed pieces:
 *  - top-left  : the "TW" logo mark, which links home.
 *  - top-right : a burger button that slides down a dark glass menu panel.
 *
 * The panel lists the SAME four sections as the home-page hero cards, because
 * both read from `src/lib/sections.ts`. Update that one array to change both.
 *
 * Also renders the inline "redirecting header" — the four section links laid
 * out horizontally, centred between the logo and the burger, on screens wide
 * enough to hold them (>=900px). Below that the burger panel is the only
 * navigation, since four inline links plus a logo will not fit a phone.
 * The current route is marked with aria-current and an accent underline.
 *
 * Client Component: it owns the open/closed state of the panel, and reads the
 * active pathname.
 * The panel closes on link click and on Escape.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SECTIONS } from "@/lib/sections";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div className="logo-wrapper">
        <Link href="/" className="logo-link" aria-label="Temuulen Wang — home">
          <span className="logo-mark">TW</span>
          <span className="logo-text">Temuulen Wang</span>
        </Link>
      </div>

      {/* Inline redirecting header — desktop only. */}
      <nav className="header-nav" aria-label="Pages">
        {SECTIONS.map((section) => {
          const active = pathname === section.href;
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`header-link${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {section.title}
            </Link>
          );
        })}
      </nav>

      <div className="burger-wrapper">
        <button
          type="button"
          className={`burger-btn${open ? " open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="menu-panel"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="bar" />
          <span className="bar" />
        </button>
      </div>

      <div id="menu-panel" className={`menu-panel${open ? " open" : ""}`}>
        <nav aria-label="Main menu">
          {SECTIONS.map((section) => (
            <Link key={section.href} href={section.href} onClick={() => setOpen(false)}>
              {section.title}
            </Link>
          ))}
        </nav>

        <div className="menu-contact">
          <a href="mailto:temuulenwang@gmail.com" className="menu-email">
            temuulenwang@gmail.com
          </a>
          <div className="menu-socials">
            <a href="https://github.com/TWWT-ai" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/temuulen-wang/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>

        <div className="menu-cta-wrap">
          <Link href="/contact" className="menu-cta-btn" onClick={() => setOpen(false)}>
            <span className="menu-cta-bg" />
            <span className="menu-cta-text">Let&apos;s talk</span>
            <span className="menu-cta-circle">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M5 13L13 5M13 5H6M13 5V12"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
