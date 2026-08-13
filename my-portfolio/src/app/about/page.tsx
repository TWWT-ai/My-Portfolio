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
 * THE PROSE BELOW IS PLACEHOLDER. Replace it with your own; the layout is
 * built for roughly this much text (5–7 paragraphs), and the sprite positions
 * are percentages so they hold as the column grows or shrinks.
 */

import { FloatingSprites } from "@/components/pixel_sprites";

export const metadata = {
  title: "About — Temuulen Wang",
  description:
    "Background, the tools I reach for, and what I'm looking for next.",
};

export default function AboutPage() {
  return (
    <main className="page about-page">
      <FloatingSprites />

      <div className="page-head">
        <span className="page-eyebrow">01 — About</span>
        <h1 className="page-title">About Me</h1>
      </div>

      <article className="about-prose">
        <p className="about-lead">
          I&apos;m Temuulen — a full-stack developer who likes the unglamorous
          half of the job: the data model, the failure cases, the part where you
          find out what actually happens when the network is slow.
        </p>

        <p>
          Placeholder. This is where your story goes. Start with how you got
          here rather than what you know — the stack is already on the projects
          page, and a recruiter reading this one is trying to work out what
          you&apos;re like to work with. Two or three paragraphs on what drew
          you to building things, and what kind of problem you find yourself
          drifting back to, does more than a list of frameworks.
        </p>

        <p>
          Placeholder. Say something concrete about how you work. Do you
          prototype fast and throw it away, or think it through on paper first?
          Do you reach for tests early or late? Nobody expects a manifesto, but
          specifics here are memorable in a way that &quot;passionate about
          clean code&quot; is not.
        </p>

        <p>
          Placeholder. This is a good place for the honest bit — what
          you&apos;re still learning, what you got wrong once and what it
          taught you. It reads as confidence rather than weakness, and it gives
          an interviewer something real to ask about.
        </p>

        <p>
          Placeholder. Then close on direction: what you&apos;re looking for
          next, the kind of team or problem you want to be near, and whether
          you&apos;re open to work right now. Be specific enough that someone
          reading it knows whether to get in touch.
        </p>

        <p className="about-outro">
          If any of that sounds like your kind of problem, the{" "}
          <a href="/contact">contact page</a> is one click away.
        </p>
      </article>
    </main>
  );
}
