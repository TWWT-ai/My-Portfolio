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
 * `theme` drives the hover treatment while the card is hovered. The two kinds
 * behave differently on purpose:
 *
 *   color  — floods the WHOLE page, chrome included, and flips the ink with it.
 *   image  — paints only the themed region (page heading + entry panel), at
 *            half opacity, over the page's normal pale field. Set it on its
 *            own: pairing it with a colour would put a half-transparent
 *            picture on top of a strong flood and muddy both.
 *
 * The five newest entries carry images; the rest keep their solid colours.
 *
 * REAL CONTENT. Every entry below is a public repo on github.com/TWWT-ai, and
 * `createdAt` / `updatedAt` are the actual `created_at` / `pushed_at` values
 * read from the GitHub API on 2026-10-25 — not estimates. Five of these used
 * to carry a placeholder-date marker; the dates are now the real ones, and
 * several were out by a day or two.
 *
 * STILL MISSING, and deliberately so: Spyder-Project, Volley-Posture-Tracker,
 * GDG-TW and MU0- are public but have little or nothing in them yet. Six more
 * repos (Loop-Visualizer, While-compiler, Gravity-Simulator, 3D-model-generator,
 * FitMe, OpenCV) exist on the machine with TWWT-ai remotes but are PRIVATE, so
 * a card for them would link to a 404 until they are made public.
 */

export type ProjectTheme = {
  /** Solid background colour applied to the whole page on hover. */
  color?: string;
  /**
   * Path under public/, e.g. "/themes/foo.webp". Painted at 50% opacity into
   * the themed region only — not across the page. Use instead of `color`.
   */
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
    slug: "cambridge-battlecode",
    title: "Cambridge Battlecode",
    tagline: "Competition bot for Battlecode, written in C++.",
    /**
     * PROVISIONAL WRITE-UP. This repo's README is a single heading line, so
     * unlike every other entry here the text below is reconstructed from the
     * repository's structure rather than from the author's own description.
     * Replace it once the README exists — and note that anyone clicking through
     * from this card currently lands on a repo that explains nothing.
     */
    readmeExcerpt:
      "A bot for the Battlecode programming competition, where two sides play a real-time strategy game and nothing moves at match time except code written beforehand. The repository is laid out around that loop: bots/ holds strategy implementations, tools/ the scripts that run them, and analysis/ the output used to judge which one survives. GameRules.md and BotAPICpp.md sit alongside as working references for the engine and its C++ API. Written in C++, where the binding constraint is a per-turn compute budget rather than a deadline.",
    skills: ["C++", "Game AI", "Pathfinding", "Competition"],
    repoUrl: "https://github.com/TWWT-ai/Cambridge-Battlecode",
    createdAt: "2026-10-24T00:00:00Z",
    updatedAt: "2026-10-24T00:00:00Z",
    theme: { image: "/themes/battlecode.webp" },
  },
  {
    slug: "internship-tracker",
    title: "Internship Tracker",
    /* The repo is spelled "Intership-Tracker" on GitHub — a typo in the repo
       name, not here. repoUrl has to match the real name or it 404s; the slug
       and title are spelled correctly for the page. Renaming the repo would let
       both agree, and GitHub redirects the old URL afterwards. */
    tagline: "Finds, verifies and ranks graduate internships into one spreadsheet.",
    readmeExcerpt:
      "Searches Trackr, Gradcracker and Bright Network every morning, normalises and deduplicates the results, then opens each real job page to confirm the role is still accepting applications and what the true deadline is. What survives is scored against a CV-derived profile and written to a single Excel dashboard, newest and soonest-closing first. It never submits anything — you read the top rows and apply yourself. The scoring refuses to bluff: with no profile configured it caps every score at 60 and labels it UNSCORED rather than showing a match percentage no evidence supports. A source blocked by anti-bot checks reuses its last good result instead of failing the run.",
    skills: ["Python", "Playwright", "Web Scraping", "Excel", "Task Scheduling"],
    repoUrl: "https://github.com/TWWT-ai/Intership-Tracker",
    createdAt: "2026-09-25T00:00:00Z",
    updatedAt: "2026-10-10T00:00:00Z",
    /* The source screenshot is Teal's own marketing image; its wordmark has
       been painted out of the top-left corner so the card does not read as
       that company's branding. */
    theme: { image: "/themes/internship-tracker.webp" },
  },
  {
    slug: "my-portfolio",
    title: "Personal Portfolio",
    tagline: "This site — Next.js, Prisma and PostgreSQL.",
    readmeExcerpt:
      "A production-shaped portfolio rather than a static template. The public pages are Server Components reading from PostgreSQL through Prisma, with incremental static regeneration so content updates without a redeploy. The home page pairs a cursor-tracked spotlight reveal with a navigation grid, and the whole layout is measured to land in a single viewport at laptop heights. Contact submissions are validated with a shared Zod schema on both client and server, stored, and forwarded by email.",
    skills: ["TypeScript", "Next.js", "Prisma", "PostgreSQL", "CSS"],
    repoUrl: "https://github.com/TWWT-ai/My-Portfolio",
    liveUrl: "https://temuulen-wang.vercel.app/",
    createdAt: "2026-08-12T00:00:00Z",
    updatedAt: "2026-08-16T00:00:00Z",
    theme: { image: "/themes/portfolio.webp" },
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
    createdAt: "2026-07-03T00:00:00Z",
    updatedAt: "2026-09-23T00:00:00Z",
    /* Photo background cut away, so the hand floats on the page field rather
       than dropping a blue rectangle into it. */
    theme: { image: "/themes/gesture.webp" },
  },
  {
    slug: "simple-claude-code",
    title: "Simple Claude Code",
    tagline: "A coding agent that edits files and runs commands until the task is done.",
    readmeExcerpt:
      "A from-scratch coding agent in Python: it reads a task, decides which files to open, edits them, runs shell commands, reads the output, and iterates until the job is finished. The interesting part is the loop rather than the model call — deciding when a task is complete, recovering when a command fails, and keeping the working set small enough to stay coherent across turns. Built against the CodeCrafters harness.",
    skills: ["Python", "LLM APIs", "CLI Tooling", "Agents"],
    repoUrl: "https://github.com/TWWT-ai/Simple-Claude-code",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
    theme: { color: "#1f2a37", ink: "light" },
  },
  {
    slug: "musicmate",
    title: "MusicMate",
    tagline: "Music-based social matching for University of Manchester students.",
    readmeExcerpt:
      "A social matching app for Manchester students built around listening history: swipe, match on Spotify compatibility scored from shared artists, genres and listening patterns, then chat and share tracks in a playlist the match creates automatically. Campus Pulse aggregates all of it into a live feed of what the university is playing. React 19 and Vite on the front, FastAPI and SQLAlchemy over PostgreSQL behind, and sign-in through the University's own CAS server — with auth tickets persisted in Postgres rather than memory so they survive a restart on free-tier hosting.",
    skills: ["React", "Vite", "FastAPI", "PostgreSQL", "Spotify API", "OAuth"],
    /* A first-year TEAM project, and this is a fork of the team repository
       (mideyy7/musicmate) — which is why `createdAt` is the fork date and sits
       after the last upstream push. The card should read as team work; the CV
       already describes it that way. */
    repoUrl: "https://github.com/TWWT-ai/musicmate",
    liveUrl: "https://musicmate-gamma.vercel.app",
    createdAt: "2026-04-30T00:00:00Z",
    updatedAt: "2026-03-24T00:00:00Z",
    theme: { image: "/themes/musicmate.webp" },
  },
  {
    slug: "http-server",
    title: "HTTP Server",
    tagline: "An HTTP/1.1 server written from scratch in Java.",
    readmeExcerpt:
      "A working HTTP/1.1 server built directly on TCP sockets, no framework. Parses request lines and headers by hand, writes spec-conformant responses, and handles multiple concurrent clients rather than blocking on one connection at a time. The value is in what it forces you to learn: how a request is actually framed on the wire, where the protocol is strict and where it is forgiving, and what a thread-per-connection model costs. Built against the CodeCrafters challenge.",
    skills: ["Java", "TCP/Sockets", "HTTP", "Concurrency", "Maven"],
    repoUrl: "https://github.com/TWWT-ai/HTTP-Server",
    createdAt: "2026-03-06T00:00:00Z",
    updatedAt: "2026-03-06T00:00:00Z",
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
    createdAt: "2026-02-12T00:00:00Z",
    updatedAt: "2026-02-14T00:00:00Z",
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
    createdAt: "2026-03-02T00:00:00Z",
    updatedAt: "2026-05-27T00:00:00Z",
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
    createdAt: "2026-02-12T00:00:00Z",
    updatedAt: "2026-09-21T00:00:00Z",
    theme: { color: "#00979d", ink: "light" },
  },
];

/** Newest first. The page always renders through this, never the raw array. */
export const projectsByNewest = (): Project[] =>
  [...PROJECTS].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
