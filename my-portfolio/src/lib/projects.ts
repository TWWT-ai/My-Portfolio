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
    slug: "rgb-d-gesture-recognition",
    title: "RGB-D Gesture Recognition",
    tagline: "Multi-task deep learning: detect, segment and classify hand gestures from RGB-D.",
    readmeExcerpt:
      "HandGestureNet does three jobs at once from a single 4-channel RGB-D frame: a YOLO-style detection head over a 7×7 grid, a U-Net decoder producing a 448×448 binary mask, and a classifier over ten gestures — all sharing one six-stage backbone, trained under a weighted multi-task loss. Splits are person-level, so train, validation and test never share an individual and the reported numbers reflect generalisation to unseen people rather than memorised hands. A FastAPI and React demo accepts an upload or a live webcam feed and synthesises the missing depth channel with Depth-Anything-V2, running inference on CPU.",
    skills: [
      "Python",
      "PyTorch",
      "Computer Vision",
      "Multi-Task Learning",
      "FastAPI",
      "React",
    ],
    repoUrl: "https://github.com/TWWT-ai/RGB-D-Gesture-Recognition",
    createdAt: "2026-07-03T00:00:00Z", // TODO: real date
    theme: { color: "#35306b", ink: "light" },
  },
  {
    slug: "simple-claude-code",
    title: "Simple Claude Code",
    tagline: "A coding agent that edits files and runs commands until the task is done.",
    readmeExcerpt:
      "A from-scratch coding agent in Python: it reads a task, decides which files to open, edits them, runs shell commands, reads the output, and iterates until the job is finished. The interesting part is the loop rather than the model call — deciding when a task is complete, recovering when a command fails, and keeping the working set small enough to stay coherent across turns. Built against the CodeCrafters harness.",
    skills: ["Python", "LLM APIs", "CLI Tooling", "Agents"],
    repoUrl: "https://github.com/TWWT-ai/Simple-Claude-code",
    createdAt: "2026-02-12T00:00:00Z", // TODO: real date — see note below
    theme: { color: "#1f2a37", ink: "light" },
  },
  {
    slug: "http-server",
    title: "HTTP Server",
    tagline: "An HTTP/1.1 server written from scratch in Java.",
    readmeExcerpt:
      "A working HTTP/1.1 server built directly on TCP sockets, no framework. Parses request lines and headers by hand, writes spec-conformant responses, and handles multiple concurrent clients rather than blocking on one connection at a time. The value is in what it forces you to learn: how a request is actually framed on the wire, where the protocol is strict and where it is forgiving, and what a thread-per-connection model costs. Built against the CodeCrafters challenge.",
    skills: ["Java", "TCP/Sockets", "HTTP", "Concurrency", "Maven"],
    repoUrl: "https://github.com/TWWT-ai/HTTP-Server",
    createdAt: "2026-03-06T00:00:00Z", // TODO
    theme: { color: "#e8b64c" },
  },
  {
    slug: "python-powershell",
    title: "Python PowerShell",
    tagline: "A shell, reimplemented in Python.",
    readmeExcerpt:
      "A command shell built from first principles: a REPL that tokenises input, resolves builtins against external executables on PATH, and handles quoting, redirection and piping between processes. Writing one makes concrete a lot of things you otherwise take for granted — how argument parsing actually works, what a shell does versus what the OS does, and why quoting rules are the way they are.",
    skills: ["Python", "Systems Programming", "Parsing", "Processes"],
    repoUrl: "https://github.com/TWWT-ai/Python-PowerShell",
    createdAt: "2026-02-13T00:00:00Z", // TODO
    theme: { color: "#2b5b84", ink: "light" },
  },
  {
    slug: "pygame-pve",
    title: "PvE Arena Game",
    tagline: "A player-versus-enemy game built with Pygame.",
    readmeExcerpt:
      "A 2D player-versus-enemy game in Pygame, structured as separate modules rather than one file — player, enemy, weapons, buttons, menu and image effects each own their own behaviour. Covers the parts of game programming that are easy to underestimate: a main loop that keeps input, physics and rendering in step, collision handling, sprite and sound asset management, and menu state that survives restarting a round.",
    skills: ["Python", "Pygame", "Game Loop", "OOP"],
    repoUrl: "https://github.com/TWWT-ai/PYGAME-PVE-",
    createdAt: "2026-03-03T00:00:00Z", // TODO
    theme: { color: "#3f6f52", ink: "light" },
  },
  {
    slug: "robosoc-buggy",
    title: "Robosoc Buggy",
    tagline: "Arduino-controlled robotics buggy, programmed in C++.",
    readmeExcerpt:
      "Embedded C++ for an Arduino-driven buggy, written for a robotics society project. Real hardware changes the problem: no debugger worth the name, timing that matters, sensor readings that are noisy rather than clean, and motor behaviour that never quite matches the datasheet. Most of the work is the control loop between reading sensors and driving the motors.",
    skills: ["C++", "Arduino", "Embedded", "Robotics"],
    repoUrl: "https://github.com/TWWT-ai/Robosoc-Buggy",
    createdAt: "2026-02-13T00:00:00Z", // TODO
    theme: { color: "#00979d", ink: "light" },
  },
];

/** Newest first. The page always renders through this, never the raw array. */
export const projectsByNewest = (): Project[] =>
  [...PROJECTS].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
