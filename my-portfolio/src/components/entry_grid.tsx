"use client";

/**
 * ADDED — the shared grid behind BOTH /projects and /experience.
 *
 * The brief said Experience "follows the same design principle" as Projects, so
 * rather than writing the grid twice it lives here once and each page maps its
 * own data into the neutral `Entry` shape below. A change to the hover
 * behaviour lands on both pages at the same time, and they cannot drift.
 *
 * What it does:
 *  - Lays out three cards per row inside a bounded rectangle that fits the
 *    viewport (see .entry-panel in globals.css). Rows wrap; the panel scrolls
 *    internally rather than growing the page.
 *  - Hovering a card repaints the WHOLE PAGE with that entry's theme — a solid
 *    colour, or a background image if one is set. Themes are per-entry data,
 *    so you edit them in src/lib/projects.ts, not here.
 *  - Hovering also reveals the ~100-word write-up and the skill tags. "View
 *    more" expands the rest in place.
 *
 * The page repaint works by writing CSS custom properties onto <html> rather
 * than re-rendering a wrapper. That matters: the fixed logo, header links and
 * footer live OUTSIDE this component in the root layout, and they still have to
 * stay legible when the background goes dark. They read the same
 * --page-ink variable this sets, so everything flips together.
 *
 * Ordering is never decided here — pages pass entries already sorted, so
 * "newest first" is a property of the data, not of the layout.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectTheme } from "@/lib/projects";

export type EntryLink = { label: string; href: string };

export type Entry = {
  slug: string;
  title: string;
  /** Organisation, or the project's one-line pitch. */
  tagline: string;
  /** Small right-aligned label: a year, or a period like "2024 — Present". */
  meta: string;
  /** The ~100-word write-up. Clamped until hovered/expanded. */
  body: string;
  skills: string[];
  links?: EntryLink[];
  theme: ProjectTheme;
};

/** Default page paint, restored whenever nothing is hovered. */
const RESTING = { bg: "var(--bg)", ink: "var(--ink)", image: "none" };

export default function EntryGrid({
  entries,
  emptyLabel = "Nothing here yet.",
}: {
  entries: Entry[];
  emptyLabel?: string;
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const hoveredRef = useRef<string | null>(null);

  /** Write the active theme onto <html> so fixed chrome flips with the page. */
  const paint = useCallback((theme: ProjectTheme | null) => {
    const root = document.documentElement;
    if (!theme) {
      root.style.setProperty("--page-bg", RESTING.bg);
      root.style.setProperty("--page-ink", RESTING.ink);
      root.style.setProperty("--page-image", RESTING.image);
      root.style.setProperty("--page-image-opacity", "0");
      return;
    }
    root.style.setProperty("--page-bg", theme.color ?? RESTING.bg);
    root.style.setProperty(
      "--page-ink",
      theme.ink === "light" ? "var(--cream)" : RESTING.ink,
    );
    root.style.setProperty(
      "--page-image",
      theme.image ? `url("${theme.image}")` : "none",
    );
    root.style.setProperty("--page-image-opacity", theme.image ? "1" : "0");
  }, []);

  // Always hand the page back its default paint on unmount — otherwise
  // navigating away mid-hover leaves the next route wearing this one's theme.
  useEffect(() => () => paint(null), [paint]);

  const onEnter = (entry: Entry) => {
    hoveredRef.current = entry.slug;
    paint(entry.theme);
  };
  const onLeave = (entry: Entry) => {
    if (hoveredRef.current === entry.slug) {
      hoveredRef.current = null;
      paint(null);
    }
  };

  if (entries.length === 0) {
    return <p className="entry-empty">{emptyLabel}</p>;
  }

  return (
    <div className="entry-panel">
      <div className="entry-grid">
        {entries.map((entry, i) => {
          const open = openSlug === entry.slug;
          return (
            <article
              key={entry.slug}
              className={`entry-card card-animate${open ? " is-open" : ""}`}
              style={{ animationDelay: `${0.05 + i * 0.06}s` }}
              onMouseEnter={() => onEnter(entry)}
              onMouseLeave={() => onLeave(entry)}
              // Keyboard users get the same repaint as mouse users.
              onFocus={() => onEnter(entry)}
              onBlur={() => onLeave(entry)}
            >
              <header className="entry-head">
                <span className="entry-meta">{entry.meta}</span>
                <h2 className="entry-title">{entry.title}</h2>
                <p className="entry-tagline">{entry.tagline}</p>
              </header>

              {/* Hidden until hover on pointer devices; always shown on touch,
                  where there is no hover to trigger it. */}
              <div className="entry-reveal">
                <p className={`entry-body${open ? " expanded" : ""}`}>
                  {entry.body}
                </p>

                <button
                  type="button"
                  className="entry-more"
                  aria-expanded={open}
                  onClick={() => setOpenSlug(open ? null : entry.slug)}
                >
                  {open ? "View less" : "View more"}
                </button>

                {entry.skills.length > 0 && (
                  <ul className="entry-skills" aria-label="Skills used">
                    {entry.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                )}

                {entry.links && entry.links.length > 0 && (
                  <p className="entry-links">
                    {entry.links.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          link.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {link.label}
                      </Link>
                    ))}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
