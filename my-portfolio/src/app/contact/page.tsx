/**
 * REPLACED — /contact.
 *
 * Was a copy of the home-page scaffold (same h1, same Prisma featured query,
 * and a heading that read "About Me").
 *
 * Now: the four contact details, nothing more. The brief asked for it to be
 * designed "fairly for the empty spaces" — the answer here is to stop fighting
 * the emptiness. The page is a two-column split: a large statement on the left
 * that earns the whitespace, and the four details as generously-spaced rows on
 * the right, each one a full-width hover target rather than a small link.
 * Below 820px it stacks.
 *
 * Server Component, no database call. NOTE: this is a contact *card*, not a
 * contact *form*. The form (Zod + /api/contact + Resend) is Phase 3 in the
 * roadmap and needs the database working first.
 *
 * The location line uses <LocalTime />, which takes an IANA time ZONE and
 * derives the offset at view time. Never hard-code "UTC+1" here: Europe/London
 * is UTC+1 (BST) in summer and UTC+0 (GMT) in winter, and the changeover dates
 * move every year. See src/lib/timezone.ts.
 */

import LocalTime from "@/components/local_time";
import { FloatingSprites } from "@/components/pixel_sprites";

/** IANA zone, not an offset — that is the whole point. */
const TIME_ZONE = "Europe/London";
const PLACE = "Manchester, United Kingdom";

const DETAILS = [
  {
    label: "Email",
    value: "temuulenwang@gmail.com",
    href: "mailto:temuulenwang@gmail.com",
  },
  {
    label: "GitHub",
    value: "github.com/TWWT-ai",
    href: "https://github.com/TWWT-ai",
  },
  {
    label: "LinkedIn",
    value: "in/temuulen-wang",
    href: "https://www.linkedin.com/in/temuulen-wang/",
  },
  {
    label: "Mobile",
    value: "+44 7756 903026",
    href: "tel:+447756903026",
  },
];

export const metadata = {
  title: "Contact — Temuulen Wang",
  description: "Email, GitHub, LinkedIn and phone.",
};

export default function ContactPage() {
  return (
    <main className="page contact-page">
      <FloatingSprites set="contact" />

      <div className="contact-split">
        <div className="contact-statement">
          <span className="page-eyebrow">04 — Contact</span>
          <h1 className="contact-headline">
            Let&apos;s build
            <br />
            something.
          </h1>
          <p className="contact-sub">
            Open to internships and junior full-stack roles, freelance work, and
            interesting problems generally. I reply to everything.
          </p>
          <LocalTime timeZone={TIME_ZONE} place={PLACE} />
        </div>

        <ul className="contact-list">
          {DETAILS.map((d, i) => (
            <li key={d.label}>
              <a
                href={d.href}
                target={d.href.startsWith("http") ? "_blank" : undefined}
                rel={d.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="contact-row card-animate"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <span className="contact-label">{d.label}</span>
                <span className="contact-value">{d.value}</span>
                <span className="contact-arrow" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M5 13L13 5M13 5H6M13 5V12"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
