/**
 * Role and education data for /experience. REAL CONTENT — taken from the CV in
 * public/resume/, so the two say the same thing to the same recruiter.
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
 *   createdAt-> START date, ISO 8601. Sort key, newest first.
 *
 * WHY THE ORDER LOOKS LIKE IT DOES. Sorting is on `createdAt`, the start date,
 * so Manchester (Sep 2025) sits above UCL (Jun 2025) even though UCL finished
 * first. That is the convention on a CV and it keeps the newest thing you began
 * at the top. If you would rather sort on end date, that is a change to
 * experienceByNewest() at the bottom of this file, not to the data.
 *
 * Bullets from the CV are rewritten as prose here, because the card reveals a
 * paragraph rather than a list — but every number survives the translation
 * intact. Do not soften them; the numbers are the whole point.
 *
 * PICKING A `theme.color`: GO CLEARLY DARK OR CLEARLY LIGHT, NOT MID-TONE.
 *
 * Hovering a card repaints the whole page in its theme, and the page eyebrow
 * ("03 — EXPERIENCE") is drawn in an accent that flips with `ink` — the bright
 * blue on dark themes, the deep teal on light ones. A mid-tone background is
 * too dark for one and too light for the other, so neither clears 4.5:1. Three
 * of these five were originally mid-tones and measured 2.99, 3.05 and 3.18:1;
 * they are darkened/lightened here to 4.7-4.8:1 worst case.
 *
 * Lighthouse will not catch this — it never hovers anything. Check by hand, or
 * keep every colour either above roughly 78% or below 35% lightness.
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
  /** ISO 8601 START date. Sort key — newest first. */
  createdAt: string;
  theme: ProjectTheme;
};

export const EXPERIENCE: Experience[] = [
  {
    slug: "ucl-ml-assistant",
    kind: "work",
    title: "Machine Learning Team Assistant",
    tagline: "UCL",
    period: "Jun 2025 — Jul 2025",
    summary:
      "Engineered a multi-task PyTorch model that classifies, detects and segments 10 hand gestures in a single forward pass, reaching 82.4% classification accuracy on a held-out-subject test set of 5,450 annotated samples. The detection half was YOLOv1 reimplemented end-to-end from scratch and fused with a U-Net head on a shared Darknet backbone: 82% detection accuracy and 0.62 mean box IoU at roughly 20% lower parameter cost than running three separate models. Then I deployed the network in a real-time front-end demo doing live webcam detection, classification and segmentation — which is what actually validated the single-pass architecture beyond the training pipeline.",
    skills: [
      "PyTorch",
      "Python",
      "YOLOv1",
      "U-Net",
      "Multi-task learning",
      "Computer vision",
    ],
    createdAt: "2025-06-01T00:00:00Z",
    theme: { color: "#14384a", ink: "light" },
  },
  {
    slug: "mongol-new-resource",
    kind: "work",
    title: "Operations Intern",
    tagline: "Mongol New Resource Technology LLC",
    period: "May 2025 — Aug 2025",
    summary:
      "Designed an internal data integration system consolidating raw-material flows and supplier-to-client transactions across 4 departments, centralising records that had been scattered over departmental spreadsheets into a single authoritative source. Built a structured data program on top of it that improved cross-department coordination and cut the time staff spent locating operational records by around 30%. Led the implementation, structuring 200+ data records, which made reporting faster and reduced retrieval delays between the factories and their suppliers.",
    skills: [
      "Data modelling",
      "Process design",
      "Excel",
      "Stakeholder coordination",
    ],
    createdAt: "2025-05-01T00:00:00Z",
    theme: { color: "#594322", ink: "light" },
  },
  {
    slug: "esm-teaching-assistant",
    kind: "work",
    title: "Teaching Assistant — Mathematics and Physics",
    tagline: "The English School of Mongolia",
    period: "Oct 2023 — May 2025",
    summary:
      "Delivered hands-on lab experiments and applied mathematics workshops for IB Middle Years and Diploma students, translating complex physics and maths concepts into lessons that landed. Alongside that I tutored 15+ students individually across Grades 9–12, raising their average exam score from 3 to 5 on the IB 7-point scale — a 67% improvement — over a six-week support period. Explaining something to a person who is stuck is still the fastest way I know to find out whether I understand it myself.",
    skills: ["Teaching", "Physics", "Mathematics", "IB curriculum"],
    createdAt: "2023-10-01T00:00:00Z",
    theme: { color: "#2c4e3a", ink: "light" },
  },
];

/** Newest first, same contract as projectsByNewest(). */
export const experienceByNewest = (): Experience[] =>
  [...EXPERIENCE].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
