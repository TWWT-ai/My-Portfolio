/**
 * REPLACED — /projects.
 *
 * Was a copy of the home-page scaffold (same h1, same Prisma featured query).
 * Now: a bounded three-per-row grid, newest first, with the hover repaint and
 * reveal handled by the shared <EntryGrid />.
 *
 * Server Component. It reads the static data file, maps it into the neutral
 * Entry shape and hands it over — no database call, which also means this route
 * no longer participates in the build-time Postgres connection that has been
 * failing the Vercel deploy.
 *
 * Sorting lives in projectsByNewest(), not here, so "newest first" stays a
 * property of the data.
 *
 * When the GitHub sync lands it writes src/lib/projects.ts and nothing on this
 * page has to change.
 */

import EntryGrid, { type Entry } from "@/components/entry_grid";
import { FloatingSprites } from "@/components/pixel_sprites";
import { projectsByNewest } from "@/lib/projects";

export const metadata = {
  title: "Projects — Temuulen Wang",
  description: "Selected work: problem, approach, stack and result.",
};

export default function ProjectsPage() {
  const entries: Entry[] = projectsByNewest().map((p) => ({
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    meta: new Date(p.createdAt).getFullYear().toString(),
    body: p.readmeExcerpt,
    skills: p.skills,
    links: [
      ...(p.repoUrl ? [{ label: "Repository", href: p.repoUrl }] : []),
      ...(p.liveUrl ? [{ label: "Live", href: p.liveUrl }] : []),
    ],
    theme: p.theme,
  }));

  return (
    <main className="page">
      <FloatingSprites set="projects" />

      <div className="page-head">
        <span className="page-eyebrow">02 — Projects</span>
        <h1 className="page-title">Projects</h1>
        <p className="page-lede">
          Case studies in reverse order. Hover one to read it.
        </p>
      </div>
      <EntryGrid entries={entries} emptyLabel="No projects published yet." />
    </main>
  );
}
