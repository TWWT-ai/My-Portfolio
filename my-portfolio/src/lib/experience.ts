/**
 * ADDED — role and education data for /experience.
 *
 * Intentionally the SAME SHAPE as Project in ./projects.ts, because /experience
 * reuses the exact grid, hover-background and reveal-on-hover mechanics. The
 * shared card component (src/components/entry_grid.tsx) is typed against the
 * common fields, so anything true of a project card is true of an experience
 * card.
 *
 * Field mapping differs only in meaning:
 *   title    -> role or qualification
 *   tagline  -> organisation
 *   period   -> "2024 — Present"; display only, never sorted on
 *   summary  -> the ~100-word write-up (Project calls this readmeExcerpt)
 *   skills   -> what you actually used
 *   createdAt-> start date, ISO 8601. Sort key, newest first.
 *
 * Achievement bullets belong in `summary` as prose with concrete numbers —
 * "cut API response time 40% with Redis caching" beats "worked on performance".
 *
 * REPLACE ALL OF THIS with your real history; it is placeholder content.
 */

import type { ProjectTheme } from "./projects";

export type ExperienceKind = "work" | "education";

export type Experience = {
  slug: string;
  kind: ExperienceKind;
  /** Role, or qualification for education entries. */
  title: string;
  /** Employer, or institution. */
  tagline: string;
  /** Display-only, e.g. "2024 — Present". Sorting uses createdAt. */
  period: string;
  summary: string;
  skills: string[];
  /** ISO 8601 start date. Sort key — newest first. */
  createdAt: string;
  theme: ProjectTheme;
};

export const EXPERIENCE: Experience[] = [
  {
    slug: "current-role",
    kind: "work",
    title: "Your Role Here",
    tagline: "Company Name",
    period: "2025 — Present",
    summary:
      "Placeholder. Describe what you own, not what you were assigned. Lead with the outcome and let the stack follow: what got faster, cheaper, more reliable, or possible that was not before. Two or three concrete achievements with numbers attached will do more than a list of technologies, and the skill tags below already cover the stack.",
    skills: ["TypeScript", "Next.js", "PostgreSQL"],
    createdAt: "2025-06-01T00:00:00Z",
    theme: { color: "#75c5de" },
  },
  {
    slug: "previous-role",
    kind: "work",
    title: "Previous Role",
    tagline: "Company Name",
    period: "2024 — 2025",
    summary:
      "Placeholder. Same structure as above. If this was an internship or a part-time role, say so plainly — it reads as honest rather than padded, and the work speaks for itself.",
    skills: ["Python", "Docker", "AWS"],
    createdAt: "2024-02-01T00:00:00Z",
    theme: { color: "#1f2a37", ink: "light" },
  },
  {
    slug: "degree",
    kind: "education",
    title: "Your Degree",
    tagline: "University Name",
    period: "2021 — 2025",
    summary:
      "Placeholder. Degree, focus, and anything genuinely differentiating — a thesis topic, a notable project, a scholarship. Skip the general-education coursework; nobody reads it.",
    skills: ["Algorithms", "Databases", "Distributed Systems"],
    createdAt: "2021-09-01T00:00:00Z",
    theme: { color: "#3f6f52", ink: "light" },
  },
];

/** Newest first, same contract as projectsByNewest(). */
export const experienceByNewest = (): Experience[] =>
  [...EXPERIENCE].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
