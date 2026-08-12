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
 *  - Renders the headline, CTA, and the four clickable section cards down the
 *    left-hand side. Cards come from `src/lib/sections.ts`, the same array the
 *    burger menu uses, so the two navigations always match.
 *
 * Why it is a Client Component: the spotlight needs `useEffect`, a
 * `requestAnimationFrame` loop and live pointer coordinates. Everything else on
 * the home page stays a Server Component.
 *
 * Spotlight implementation notes (these differ from the original mockup):
 *  - The mask canvas is measured against the HERO MEDIA BOX, not the viewport.
 *    On mobile the media box is a `56vh` block in normal flow rather than a
 *    full-screen layer, and viewport-relative coordinates put the spotlight in
 *    the wrong place there.
 *  - On touch devices (`hover: none`) and under `prefers-reduced-motion` the
 *    loop never starts and no mask is applied, so the avatar is simply fully
 *    visible. Without this, phones show a permanently half-revealed image.
 *  - The generated data URL is compared against the previous frame and skipped
 *    when unchanged, so an idle cursor costs nothing.
 */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SECTIONS } from "@/lib/sections";

/** Radius of the reveal circle, in CSS pixels. */
const SPOTLIGHT_RADIUS = 260;
/** 0–1: how quickly the spotlight catches up to the cursor. Lower = smoother. */
const SPOTLIGHT_EASING = 0.1;

export default function Hero() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaBox = mediaRef.current;
    const revealLayer = revealRef.current;
    if (!mediaBox || !revealLayer) return;

    // Skip the whole effect for touch input and reduced-motion users; the
    // reveal layer then just renders normally (unmasked, fully visible).
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reducedMotion) return;

    // Off-DOM canvas — it is only ever read as a data URL, never displayed.
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const box = { left: 0, top: 0, width: 1, height: 1 };

    /** Re-read the media box so pointer coords can be made box-relative. */
    const measure = () => {
      const rect = mediaBox.getBoundingClientRect();
      box.left = rect.left;
      box.top = rect.top;
      box.width = Math.max(1, Math.round(rect.width));
      box.height = Math.max(1, Math.round(rect.height));
      if (canvas.width !== box.width) canvas.width = box.width;
      if (canvas.height !== box.height) canvas.height = box.height;
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });

    // Start off-screen so nothing is revealed until the cursor actually moves.
    const target = { x: -9999, y: -9999 };
    const eased = { x: -9999, y: -9999 };

    const onMouseMove = (e: MouseEvent) => {
      target.x = e.clientX - box.left;
      target.y = e.clientY - box.top;
    };
    window.addEventListener("mousemove", onMouseMove);

    let frameId = 0;
    let lastDataUrl = "";

    const loop = () => {
      eased.x += (target.x - eased.x) * SPOTLIGHT_EASING;
      eased.y += (target.y - eased.y) * SPOTLIGHT_EASING;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Opaque in the middle, feathering to transparent at the rim — the alpha
      // channel of this gradient becomes the mask.
      const gradient = ctx.createRadialGradient(
        eased.x, eased.y, 0,
        eased.x, eased.y, SPOTLIGHT_RADIUS,
      );
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.4, "rgba(255,255,255,1)");
      gradient.addColorStop(0.6, "rgba(255,255,255,0.75)");
      gradient.addColorStop(0.75, "rgba(255,255,255,0.4)");
      gradient.addColorStop(0.88, "rgba(255,255,255,0.12)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.beginPath();
      ctx.arc(eased.x, eased.y, SPOTLIGHT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      const dataUrl = canvas.toDataURL();
      if (dataUrl !== lastDataUrl) {
        lastDataUrl = dataUrl;
        const mask = `url(${dataUrl})`;
        revealLayer.style.webkitMaskImage = mask;
        revealLayer.style.maskImage = mask;
        revealLayer.style.webkitMaskSize = "100% 100%";
        revealLayer.style.maskSize = "100% 100%";
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("mousemove", onMouseMove);
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

          {/* PLACEHOLDER layer — replace public/base-placeholder.svg with a photo. */}
          <div id="hero-base-img" className="hero-layer hero-base-img hero-image-animate" />

          {/* Real avatar, revealed through the cursor spotlight. */}
          <div
            id="hero-reveal-img"
            className="hero-layer hero-reveal-img hero-image-animate"
            ref={revealRef}
            role="img"
            aria-label="Pixel-art portrait of Temuulen Wang"
          />
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

            <Link href="/contact" className="cta-btn cta-animate">
              <span className="cta-btn-bg" />
              <span className="cta-btn-text">Start a project now</span>
              <span className="cta-btn-circle">
                <ArrowIcon size={18} stroke="white" />
              </span>
            </Link>

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
                  <span className="sc-index">{section.index}</span>
                  <span className="sc-title">{section.title}</span>
                  <span className="sc-desc">{section.description}</span>
                  <span className="sc-arrow" aria-hidden="true">
                    <ArrowIcon size={14} />
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

/** Small shared up-right arrow used by the CTA and every section card. */
function ArrowIcon({ size = 18, stroke }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
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
