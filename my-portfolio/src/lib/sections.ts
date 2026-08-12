/**
 * ADDED — single source of truth for the site's four top-level sections.
 *
 * Both the home-page hero cards (`src/components/hero.tsx`) and the burger
 * menu panel (`src/components/nav_bar.tsx`) map over this array, so the two
 * navigation surfaces can never drift out of sync. Add or reorder a section
 * here and it updates in both places.
 *
 * NOTE: `/experience` does not have a `page.tsx` yet — the link is wired up
 * ready for it, but it will 404 until `src/app/experience/page.tsx` exists.
 * The other three routes (/about, /projects, /contact) already exist and were
 * deliberately left untouched by this change.
 */

export type Section = {
  /** Two-digit label rendered above the card title. */
  index: string;
  title: string;
  href: string;
  /** Short summary under the title. Keep it to ~60 chars so the card stays
   *  one line on desktop — four two-line cards no longer fit above the fold. */
  description: string;
};

export const SECTIONS: Section[] = [
  {
    index: "01",
    title: "About Me",
    href: "/about",
    description:
      "Background, the tools I reach for, and what I'm looking for next.",
  },
  {
    index: "02",
    title: "Projects",
    href: "/projects",
    description:
      "Case studies — problem, approach, stack and result.",
  },
  {
    index: "03",
    title: "Experience",
    href: "/experience",
    description:
      "Roles, education and the outcomes I actually shipped.",
  },
  {
    index: "04",
    title: "Contact Me",
    href: "/contact",
    description:
      "Start a project, ask a question, or just say hello.",
  },
];
