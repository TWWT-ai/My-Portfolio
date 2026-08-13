/**
 * ADDED — project data for /projects.
 *
 * DELIBERATELY SHAPED LIKE A GITHUB REPO. Every field here maps to something
 * the GitHub REST API already returns, so the planned "connect a repository"
 * flow can populate this without the page layout changing at all:
 *
 *   slug          <- repo.name
 *   title         <- repo.name, prettified by hand
 *   tagline       <- repo.description
 *   readmeExcerpt <- a chosen section of README.md (see below)
 *   skills        <- repo.topics  (plus anything you add by hand)
 *   repoUrl       <- repo.html_url
 *   liveUrl       <- repo.homepage
 *   createdAt     <- repo.created_at        (ISO 8601)
 *   updatedAt     <- repo.pushed_at         (ISO 8601)
 *
 * The page sorts on `createdAt` descending, so ordering is data-driven — you
 * never reorder this array by hand.
 *
 * `readmeExcerpt` is the field the README-import feature will write to. Keep it
 * to roughly 100 words: the card shows it clamped and "View more" expands it in
 * place. Anything much longer just makes the expanded card overflow the grid.
 *
 * `theme` drives the hover treatment — the whole page background switches to it
 * while the card is hovered. Use `color` for a solid fill, or `image` for a
 * background image in public/ (image wins if both are set).
 *
 * REPLACE ALL OF THIS with your real projects; it is placeholder content.
 */

export type ProjectTheme = {
  /** Solid background colour applied to the page on hover. */
  color?: string;
  /** Path under public/, e.g. "/themes/foo.png". Takes precedence over color. */
  image?: string;
  /** Set to "light" when the theme is dark, so text flips to a light ink. */
  ink?: "light" | "dark";
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  readmeExcerpt: string;
  skills: string[];
  repoUrl?: string;
  liveUrl?: string;
  /** ISO 8601. Sort key — newest first. */
  createdAt: string;
  updatedAt?: string;
  theme: ProjectTheme;
};

export const PROJECTS: Project[] = [
  {
    slug: "my-portfolio",
    title: "Personal Portfolio",
    tagline: "This site — Next.js, Prisma and PostgreSQL.",
    readmeExcerpt:
      "A production-shaped portfolio rather than a static template. The public pages are Server Components reading from PostgreSQL through Prisma, with incremental static regeneration so content updates without a redeploy. The home page pairs a cursor-tracked spotlight reveal with a navigation grid, and the whole layout is measured to land in a single viewport at laptop heights. Contact submissions are validated with a shared Zod schema on both client and server, stored, and forwarded by email.",
    skills: ["TypeScript", "Next.js", "Prisma", "PostgreSQL", "CSS"],
    repoUrl: "https://github.com/TWWT-ai/My-Portfolio",
    createdAt: "2026-08-11T00:00:00Z",
    updatedAt: "2026-08-12T00:00:00Z",
    theme: { color: "#75c5de" },
  },
  {
    slug: "project-two",
    title: "Second Project",
    tagline: "One line on what it does.",
    readmeExcerpt:
      "Placeholder. Swap this for the opening section of the repository's README — the part that explains the problem the project solves and the approach taken, rather than installation instructions. Around a hundred words reads well here: enough to give a recruiter the shape of the work without making them open the repo, and short enough that the expanded card still fits on screen.",
    skills: ["Python", "FastAPI", "Docker"],
    repoUrl: "https://github.com/TWWT-ai",
    createdAt: "2026-06-02T00:00:00Z",
    theme: { color: "#1f2a37", ink: "light" },
  },
  {
    slug: "project-three",
    title: "Third Project",
    tagline: "One line on what it does.",
    readmeExcerpt:
      "Placeholder. Problem, approach, stack, result — in that order — is the structure recruiters scan for, and it maps cleanly onto how most READMEs already open. Keep the result concrete: a number, a latency figure, a user count, anything measurable beats an adjective.",
    skills: ["React", "Tailwind", "Vite"],
    repoUrl: "https://github.com/TWWT-ai",
    createdAt: "2026-04-18T00:00:00Z",
    theme: { color: "#e8b64c" },
  },
  {
    slug: "project-four",
    title: "Fourth Project",
    tagline: "One line on what it does.",
    readmeExcerpt:
      "Placeholder. This fourth entry exists to show the grid wrapping to a second row — three per row, newest first. Delete it if you only have three projects; the grid handles any count.",
    skills: ["Java", "Spring", "MySQL"],
    repoUrl: "https://github.com/TWWT-ai",
    createdAt: "2026-01-09T00:00:00Z",
    theme: { color: "#3f6f52", ink: "light" },
  },
];

/** Newest first. The page always renders through this, never the raw array. */
export const projectsByNewest = (): Project[] =>
  [...PROJECTS].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
