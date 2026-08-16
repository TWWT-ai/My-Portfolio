"use client";

/**
 * ADDED — home page hero.
 *
 * What this does:
 *  - Plays a one-off splash intro (five accent blocks splitting top/bottom).
 *  - Renders TWO stacked image layers inside `.hero-media`:
 *      * `#hero-base-img`   — a PLACEHOLDER (public/base-placeholder.svg).
 *                             Swap this for a real photo; it is sized to the
 *                             same 900x1072 box as the avatar so the reveal
 *                             lines up without any repositioning.
 *      * `#hero-reveal-img` — the real avatar (public/avatar.jpg), painted on
 *                             top and masked so it is only visible inside a
 *                             soft circle that follows the cursor.
 *  - Renders the headline, the "Get my resume" CTA (which opens
 *    the resume PDF directly), and the four clickable section cards down the
 *    left-hand side. Cards come from `src/lib/sections.ts`, the same array the
 *    burger menu uses, so the two navigations always match.
 *
 * Why it is a Client Component: the spotlight needs `useEffect`, a
 * `requestAnimationFrame` loop and live pointer coordinates. Everything else on
 * the home page stays a Server Component.
 *
 * SPOTLIGHT — REWRITTEN FOR COST. Read this before changing it back.
 *
 * The first version drew the mask into an off-screen <canvas> and applied it
 * with `mask-image: url(canvas.toDataURL())`, refreshed every frame. That call
 * PNG-encodes the whole canvas: measured at 9.35ms for a 1440x848 hero, which
 * is 56% of a 60fps frame budget spent producing a soft circle. The page ran at
 * roughly 30fps as a result, and Lighthouse reported 1.9s of main-thread work
 * on a page that has almost no JavaScript.
 *
 * It is now a plain CSS radial-gradient mask whose centre is two custom
 * properties, --spot-x / --spot-y (see .hero-reveal-img in globals.css). Per
 * frame the work is two setProperty calls instead of an image encode.
 *
 * Two other things this version does:
 *  - PARKS THE LOOP. Once the eased position has caught up with a stationary
 *    cursor the rAF stops entirely, and a mousemove restarts it. The old loop
 *    ran forever, encoding a PNG 60 times a second at an empty desk.
 *  - BATCHES LAYOUT READS. getBoundingClientRect runs at the top of a frame and
 *    only when resize/scroll flagged it stale, rather than inside the scroll
 *    handler — that interleaving of reads and writes is what a "Forced reflow"
 *    warning in a trace is pointing at.
 *
 * Coordinates are relative to the REVEAL LAYER itself, not the media box. The
 * old code measured the media box and then stretched the mask over a layer that
 * is 4% shorter on desktop, so the spotlight sat slightly below the cursor.
 *
 * On touch devices (`hover: none`) and under `prefers-reduced-motion` none of
 * this runs and the class is never added, so the avatar is simply fully
 * visible. Without that, phones show a permanently half-revealed image.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SECTIONS } from "@/lib/sections";

/**
 * The resume, served straight from public/.
 *
 * Files in public/ are served from the SITE ROOT, so public/resume/x.pdf is
 * "/resume/x.pdf" — the "/public/" prefix is the classic way to 404 this.
 */
const RESUME_URL = "/resume/Temuulen_Wang_CV_SWE.pdf";

/**
 * How wide the hero image box actually is, so next/image picks a sensible
 * entry from the srcset instead of assuming full-viewport.
 *
 * Below 900px the media box spans the screen. Above it the portrait occupies
 * roughly the right-hand half, and the image is height-constrained anyway
 * (900x1072 portrait in a landscape box), so 55vw is a deliberate slight
 * over-estimate — too small would upscale and look soft, and softness on the
 * one photo of your face is a worse outcome than a few extra kilobytes.
 */
const HERO_IMAGE_SIZES = "(min-width: 900px) 55vw, 100vw";

/**
 * Above the default 75 because both hero images are PIXEL ART.
 *
 * Lossy codecs are tuned for photographs — they spend the bit budget on smooth
 * gradients and discard hard, high-contrast edges first, which is precisely
 * what pixel art is made of. At quality 75 the block edges pick up visible
 * ringing. 92 keeps them clean and still lands far, far under the original
 * file. Must also be listed in `images.qualities` in next.config.ts, or Next
 * rejects the value.
 */
const HERO_IMAGE_QUALITY = 92;

/* The reveal radius now lives in CSS as --spot-r on .hero-reveal-img, because
   that is where the gradient that uses it lives. Keeping a duplicate constant
   here would just be a second place to forget to update. */
/** 0–1: how quickly the spotlight catches up to the cursor. Lower = smoother. */
const SPOTLIGHT_EASING = 0.1;

export default function Hero() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const revealLayer = revealRef.current;
    if (!revealLayer) return;

    // Skip the whole effect for touch input and reduced-motion users; the
    // reveal layer then just renders normally (unmasked, fully visible).
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reducedMotion) return;

    // Turn the CSS mask on. Off by default so the portrait is fully visible if
    // this effect never runs (touch, reduced motion, JS disabled).
    revealLayer.classList.add("spotlight-on");

    const box = { left: 0, top: 0 };
    let needsMeasure = true;
    const markStale = () => { needsMeasure = true; };
    window.addEventListener("resize", markStale);
    window.addEventListener("scroll", markStale, { passive: true });

    // Start off-screen so nothing is revealed until the cursor actually moves.
    const target = { x: -9999, y: -9999 };
    const eased = { x: -9999, y: -9999 };
    let pointer = { x: -9999, y: -9999 };

    let frameId = 0;
    let running = false;

    const start = () => {
      if (running) return;
      running = true;
      frameId = requestAnimationFrame(loop);
    };

    const onMouseMove = (e: MouseEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      start();
    };
    window.addEventListener("mousemove", onMouseMove);

    function loop() {
      // READ FIRST, WRITE AFTER. Layout reads are batched to the top of the
      // frame and only happen when something invalidated them; doing this
      // inside the scroll handler instead is what "Forced reflow" in a
      // Lighthouse trace means.
      if (needsMeasure) {
        const rect = revealLayer!.getBoundingClientRect();
        box.left = rect.left;
        box.top = rect.top;
        needsMeasure = false;
      }

      target.x = pointer.x - box.left;
      target.y = pointer.y - box.top;

      eased.x += (target.x - eased.x) * SPOTLIGHT_EASING;
      eased.y += (target.y - eased.y) * SPOTLIGHT_EASING;

      revealLayer!.style.setProperty("--spot-x", `${eased.x.toFixed(1)}px`);
      revealLayer!.style.setProperty("--spot-y", `${eased.y.toFixed(1)}px`);

      // PARK THE LOOP once the spotlight has caught up with a stationary
      // cursor. A rAF that never stops keeps the compositor and the CPU awake
      // for as long as the tab is open, which on a laptop is measurable
      // battery for zero visible change. Any mousemove restarts it.
      if (Math.abs(target.x - eased.x) < 0.3 && Math.abs(target.y - eased.y) < 0.3) {
        running = false;
        return;
      }
      frameId = requestAnimationFrame(loop);
    }

    start();

    return () => {
      cancelAnimationFrame(frameId);
      running = false;
      window.removeEventListener("resize", markStale);
      window.removeEventListener("scroll", markStale);
      window.removeEventListener("mousemove", onMouseMove);
      revealLayer.classList.remove("spotlight-on");
    };
  }, []);

  return (
    <>
      {/* Splash intro — lives in the hero (not the layout) so it only plays on
          the home page, not on every client-side navigation. */}
      <div className="splash" aria-hidden="true">
        <div className="splash-row splash-row-top">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="splash-box" />
          ))}
        </div>
        <div className="splash-row splash-row-bottom">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="splash-box" />
          ))}
        </div>
      </div>

      <section className="hero">
        <div className="hero-media" ref={mediaRef}>
          {/* Oversized word sitting behind the portrait. */}
          <div className="hero-big-text creator-text-animate" aria-hidden="true">
            <h2>Developer</h2>
          </div>

          {/* PERFORMANCE — both layers used to be CSS `background-image`, which
              cost 526 KB and a 5.3s LCP. Two separate problems, both fixed by
              moving to next/image:

              1. BYTES. penguin.png alone was 417 KB over the wire. next/image
                 re-encodes to AVIF (or WebP) and emits a srcset, so a phone
                 downloads a phone-sized image instead of the full 900x1072.

              2. DISCOVERY — the bigger of the two. A background-image is only
                 found once the CSS has been fetched AND parsed AND the element
                 matched, so the browser's preload scanner never sees it. These
                 are the largest element on the page, so that late start was the
                 LCP almost by itself. `priority` emits a <link rel=preload> in
                 the document head, which moves the request to the very front.

              Both are priority because both are above the fold: the base layer
              is what you see on desktop, and on touch (no spotlight) the avatar
              is unmasked and covers it — so either can be the LCP element
              depending on the device.

              GEOMETRY IS UNCHANGED. See .hero-layer / .hero-img in globals.css:
              object-fit and object-position reproduce the old background-size
              and background-position exactly. */}
          <div
            id="hero-base-img"
            className="hero-layer hero-base-img hero-image-animate"
            aria-hidden="true"
          >
            <Image
              src="/penguin.png"
              alt=""
              fill
              priority
              quality={HERO_IMAGE_QUALITY}
              sizes={HERO_IMAGE_SIZES}
              className="hero-img"
            />
          </div>

          {/* Real avatar, revealed through the cursor spotlight. The mask is set
              on this wrapper, and a mask clips its children, so the <Image>
              inside is revealed exactly as the background used to be. */}
          <div
            id="hero-reveal-img"
            className="hero-layer hero-reveal-img hero-image-animate"
            ref={revealRef}
          >
            <Image
              src="/avatar.jpg"
              alt="Pixel-art portrait of Temuulen Wang"
              fill
              priority
              quality={HERO_IMAGE_QUALITY}
              sizes={HERO_IMAGE_SIZES}
              className="hero-img"
            />
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-headline">
              {"Temuulen Wang".split(" ").map((word, i) => (
                <span
                  key={word}
                  className="word-reveal"
                  style={{ animationDelay: `${1 + i * 0.08}s` }}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p className="hero-sub">
              Full-stack developer building fast, data-driven products with
              TypeScript, Next.js and PostgreSQL.
            </p>

            {/* Resume CTA.

                NOW A PLAIN LINK, not a button. The dialog that collected a
                name, company and email is gone — clicking this downloads the
                PDF and nothing else happens. An <a download> is the right
                element for that: it works with middle-click and "Save link
                as", it needs no JavaScript, and screen readers announce it as
                a link rather than promising an action that never comes.

                Trade-off, recorded so it is a choice rather than a surprise:
                there is no longer any record of who took the resume. If that
                turns out to matter, the pieces are still in the repo —
                components/resume_modal.tsx and app/api/resume/route.ts — and
                re-wiring is a one-line change back to a <button>.

                COLLAPSE-AND-REVEAL: at rest it is a white pill
                reading "Get my resume"; on hover the pill collapses to nothing
                and uncovers the accent field underneath, which reads
                "Download" with a downward arrow. The up-right arrow and its
                circle are gone.

                THREE CHILDREN, and the first one is the interesting part:

                  .cta-sizer  — an invisible copy of the label that nothing
                                ever animates. It is what gives the button its
                                width. Without it the button would shrink as
                                the label collapsed, because a grid track sizes
                                itself to its contents — the whole thing would
                                concertina inward instead of staying put while
                                the label slides away. Measuring the text this
                                way rather than hard-coding a pixel width means
                                it survives a font change or a longer label.

                  .cta-label  — the visible white pill. Positioned absolutely
                                so it is OUT of the grid's sizing calculation,
                                which is what lets its width animate to 0
                                without moving anything else.

                  .cta-reveal — sits in the grid alongside the sizer, so if
                                "Download" were ever the wider of the two the
                                button would size to that instead.

                aria-hidden on the sizer and the reveal: both are visual
                duplicates of an action the accessible name already describes,
                and a screen reader announcing "Get my resume Get my resume
                Download" would be nonsense. The link's name stays "Get my
                resume" in every state. */}
            <a
              href={RESUME_URL}
              download
              className="cta-btn cta-animate"
            >
              <span className="cta-sizer" aria-hidden="true">
                Get my resume
              </span>

              <span className="cta-reveal" aria-hidden="true">
                Download
                <DownloadArrow />
              </span>

              <span className="cta-label">
                <span className="cta-label-text">Get my resume</span>
              </span>
            </a>

            {/* The four redirecting boxes. Each is a full <Link> to its own
                page — the pages themselves are separate files and were left
                exactly as they were. */}
            <nav className="section-cards" aria-label="Site sections">
              {SECTIONS.map((section, i) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="section-card card-animate"
                  style={{ animationDelay: `${1.35 + i * 0.1}s` }}
                >
                  {/* Hover choreography (see .section-card in globals.css):
                      the circle floods the card in the accent blue, arr-1
                      exits right, arr-2 enters from the left, and sc-content
                      slides right to make room for it. Order matters only for
                      z-index stacking: circle 0, content 1, arrows 9. */}
                  <span className="sc-circle" aria-hidden="true" />
                  <ArrowIcon size={18} className="sc-arr sc-arr-1" />
                  <ArrowIcon size={18} className="sc-arr sc-arr-2" />

                  <span className="sc-content">
                    <span className="sc-index">{section.index}</span>
                    <span className="sc-title">{section.title}</span>
                    <span className="sc-desc">{section.description}</span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * The downward arrow revealed under the resume CTA on hover.
 *
 * Drawn to the same recipe as ArrowIcon below — 18x18 box, 2px stroke, round
 * caps and joins — so the two read as one icon family rather than one being
 * borrowed from somewhere else. `currentColor` so it inherits the reveal's ink
 * and needs no separate colour rule.
 *
 * The shaft is a touch longer than a strict arrow glyph would be. At 16px the
 * head alone is ambiguous — it can read as a chevron or a caret — and this is
 * the one control on the page where "down" has to mean "download".
 */
function DownloadArrow() {
  return (
    <svg
      className="cta-arrow"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 3V13M9 13L4.5 8.5M9 13L13.5 8.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Small shared up-right arrow. Used by every section card — the resume CTA no
 * longer has one; it reveals <DownloadArrow /> on hover instead.
 * `className` is passed through so the cards can position two of them
 * (.sc-arr-1 / .sc-arr-2) for the hover swap.
 */
function ArrowIcon({
  size = 18,
  stroke,
  className,
}: {
  size?: number;
  stroke?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 13L13 5M13 5H6M13 5V12"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
