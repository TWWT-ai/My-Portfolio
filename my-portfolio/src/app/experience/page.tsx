/**
 * ADDED — /experience. This route did not exist; the home page's third card
 * pointed at it and 404'd.
 *
 * Deliberately near-identical to /projects: same <EntryGrid />, same hover
 * repaint, same reveal. The only differences are the data file it reads and
 * the fact that `meta` carries a display period ("2024 — Present") rather than
 * a single year. Keeping the two pages this close is the point — they are one
 * pattern, not two.
 *
 * Server Component, no database call.
 */

import EntryGrid, { type Entry } from "@/components/entry_grid";
import { experienceByNewest } from "@/lib/experience";

export const metadata = {
  title: "Experience — Temuulen Wang",
  description: "Roles, education and the outcomes I actually shipped.",
};

export default function ExperiencePage() {
  const entries: Entry[] = experienceByNewest().map((e) => ({
    slug: e.slug,
    title: e.title,
    tagline: e.tagline,
    meta: e.period,
    body: e.summary,
    skills: e.skills,
    theme: e.theme,
  }));

  return (
    <main className="page">
      <div className="page-head">
        <span className="page-eyebrow">03 — Experience</span>
        <h1 className="page-title">Experience</h1>
        <p className="page-lede">
          Where I&apos;ve worked and studied, most recent first.
        </p>
      </div>
      <EntryGrid entries={entries} emptyLabel="Nothing listed yet." />
    </main>
  );
}
