/**
 * REPLACED — /about.
 *
 * Was a copy of the home-page scaffold (same h1, same Prisma featured-projects
 * query, which had nothing to do with an about page).
 *
 * Now: a single centred column of long-form prose with 16px pixel sprites
 * floating around it. The sprites are inline SVG from components/pixel_sprites
 * — see that file for why they are not image assets.
 *
 * Server Component, no database call. That also takes this route out of the
 * build-time Postgres connection that has been failing the Vercel deploy.
 *
 * PROSE IS NOW REAL (was placeholder). Every claim below is drawn from
 * public/resume/Temuulen_Wang_CV_SWE.pdf — the same figures, the same dates —
 * so the page and the CV cannot drift apart and contradict each other in front
 * of the same recruiter. If you edit the CV, edit this too.
 *
 * WHY IT READS THE WAY IT DOES. An about page is not a skills list; the skills
 * are already on /projects, with the repos attached. The person reading this
 * has the CV one click away and is trying to work out something the CV cannot
 * tell them — how you think, and what you are like to sit next to. So each
 * paragraph is built around one specific, checkable thing rather than an
 * adjective: a number, a decision, a mistake. "82.4% on 5,450 held-out samples"
 * survives a follow-up question. "Passionate about machine learning" does not.
 *
 * No new CSS. It reuses .about-lead / .about-prose / .about-outro exactly as
 * they were, so the layout, the sprite positions and the mobile behaviour are
 * all untouched — the only thing that changed on this page is the words.
 * Length is 6 paragraphs, which is what the column was designed around.
 */

import Image from "next/image";
import { FloatingSprites } from "@/components/pixel_sprites";

/**
 * One picture per body paragraph, alternating left / right down the page.
 *
 * THESE ARE OTHER PEOPLE'S IMAGES. Each carries a visible credit linking back
 * to its source, rendered under the frame. A credit is not a licence — if one
 * has to come out, drop its `credit`/`href` and point `src` at
 * /about/placeholder-N.svg; nothing else needs to change.
 *
 * All three are the SAME box (880x660, 4:3) — the brief asked for one size, and
 * a consistent frame is what makes an alternating column read as a rhythm
 * rather than a scrapbook. Swap the files in public/about/ for real pictures
 * and nothing here has to change, as long as the replacements are 4:3; a
 * different ratio will letterbox inside the frame rather than break the grid.
 *
 * They are numbered rather than one shared file so each can be replaced on its
 * own. `caption` is the alt text, not visible text — these are illustrative,
 * so they get a short description of what belongs there rather than a label.
 */
const FIGURES = [
  {
    src: "/about/vision-robotics.jpg",
    alt: "A humanoid robot playing cards with an older woman in a living room",
    credit: "TechNexion — Vision-Guided Robotics",
    href: "https://www.technexion.com/resources/vision-guided-robotics-how-cameras-are-transforming-robotics/",
  },
  {
    src: "/about/communication.jpg",
    alt: "Two illustrated figures, the line of speech between them tangled into a knot",
    credit: "Samip Shah — The Power of Communication",
    href: "https://www.linkedin.com/pulse/power-communication-why-you-need-start-talking-more-samip-shah",
  },
  {
    src: "/about/volleyball.png",
    alt: "Pixel-art volleyball",
    credit: "Pixel art by Vecteezy",
    href: "https://www.vecteezy.com/vector-art/26361788-pixel-art-illustration-volley-ball-pixelated-volley-ball-sports-volley-ball-icon-pixelated-for-the-pixel-art-game-and-icon-for-website-and-video-game-old-school-retro",
  },
] as const;

/**
 * A paragraph with its picture. `index` decides the side: even rows put the
 * image on the left, odd rows on the right, so it zig-zags 1-left, 2-right,
 * 3-left and so on. Doing it from the index rather than a CSS :nth-child means
 * the alternation survives someone reordering the paragraphs.
 *
 * The float is deliberately small — 6px over 7-9 seconds, staggered per row.
 * These sit beside body copy that people are trying to READ; anything with a
 * bigger amplitude turns into a distraction in peripheral vision.
 */
function AboutRow({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const fig = FIGURES[index];
  /* Tilt leans the way the picture sits — left-hand figures rotate
     anticlockwise, right-hand ones clockwise. The class carries the side and
     the CSS derives the angle from it, so the two can never disagree. */
  const side = index % 2 === 0 ? "left" : "right";
  return (
    <div className={`about-row about-row-${side}`}>
      <figure
        className="about-figure"
        style={{ animationDelay: `${index * 0.7}s`, animationDuration: `${7 + index * 0.5}s` }}
      >
        {/* `sizes` matters here. The sources are 880px wide but the frame is
            208px on desktop; without it, next/image serves a file four times
            larger than the slot it lands in. */}
        <Image
          src={fig.src}
          alt={fig.alt}
          width={880}
          height={660}
          sizes="(min-width: 900px) 240px, 90vw"
        />
        {"credit" in fig && (
          <figcaption className="about-credit">
            <a href={fig.href} target="_blank" rel="noopener noreferrer nofollow">
              {fig.credit}
            </a>
          </figcaption>
        )}
      </figure>
      <div className="about-row-text">{children}</div>
    </div>
  );
}

export const metadata = {
  title: "About — Temuulen Wang",
  description:
    "Computer Science at Manchester. Multi-task vision models at UCL, a shell written from scratch, and a live inference service on CPU.",
};

export default function AboutPage() {
  return (
    <main className="page about-page">
      <FloatingSprites set="about" />

      <div className="page-head">
        <span className="page-eyebrow">01 — About</span>
        <h1 className="page-title">About Me</h1>
      </div>

      <article className="about-prose">
        <p className="about-lead">
          I&apos;m a Computer Science student at the University of Manchester. 
          Most of what I care about lives where software meets the physical world: 
          robotics, machine learning, computer vision, and AI. 
          I like problems where the output is something you can point a camera at and watch work, or fail, in front of you.
        </p>

        <AboutRow index={0}>
          <p>
            Computer vision is the part I keep coming back to. 
            There's a specific kind of satisfaction in teaching a machine to see something — last summer I spent three months at UCL getting one model to recognise ten different hand gestures, 
            and the interesting half wasn't the accuracy number, 
            it was everything that broke before it got there. 
            It's also work I could happily do alone in a room for weeks at a time,
            which for a long while was exactly the problem.
          </p>
        </AboutRow>

        <AboutRow index={1}>
          <p>
            I'm naturally quite a quiet and introverted person. 
            Making friends has always taken me longer than it seems to take other people, 
            and for a while I assumed that was just a fixed thing about me. 
            What changed it wasn't deciding to be more outgoing — it was working on things with other people. 
            In my first-year team project I found that having a shared goal gave me a reason to speak up that I couldn't find in ordinary conversation, 
            and once there was something concrete to argue about, I stopped being the quiet one.
            Volleyball did the same thing from the other direction.
          </p>
        </AboutRow>

        <AboutRow index={2}>
          <p>
            I've played a lot of sports — basketball, table tennis, bowling, tennis, football, frisbee — but volleyball is the one that stuck. 
            It's the most genuinely collective sport I've tried: you physically cannot score alone, 
            every point runs through at least two other people. 
            I now play for the University of Manchester Volleyball Club men's 2 team. 
            It turns out the thing I like about a good team on court is the same thing I like about a good codebase — everything only works because someone else set it up for you.
          </p>
        </AboutRow>

        <p className="about-outro">
          If any of that sounds like your kind of problem, the{" "}
          <a href="/contact">contact page</a> is one click away.
        </p>
      </article>
    </main>
  );
}
