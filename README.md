# My Portfolio

My personal site — Temuulen Wang, Computer Science at the University of Manchester.

It's a home screen and four pages: who I am, what I've built, where I've worked, and how to reach me. This README describes how it's put together, mostly so I remember my own decisions in six months. It isn't a template and isn't meant to be reused, so there's no setup guide beyond the basics at the bottom.

---

## Built with

| | |
|---|---|
| **Next.js 16** | App Router, React Server Components, Turbopack |
| **React 19** | with the React Compiler enabled |
| **TypeScript** | strict |
| **Tailwind CSS v4** | via PostCSS — layout scaffolding only |
| **Plain CSS** | `globals.css` — everything visual, hand-written |
| **Prisma 7 + PostgreSQL** | Neon, over the `@prisma/adapter-pg` driver adapter |
| **Resend** | transactional email for the resume form |
| **Vercel** | hosting and deploys |

Fonts are Inter (UI) plus Geist and Geist Mono, all self-hosted through `next/font` — no render-blocking request to Google, no layout shift on load.

**Why so little Tailwind.** Tailwind handles the boring structural bits: flex, min-height, spacing on the shell. Everything with a personality — the spotlight, the card hover choreography, the theme swapping, the sprites — is hand-written in `globals.css`, because those are long multi-step animations and utility classes make them unreadable. The split is deliberate rather than accidental.

---

## The pages

**Home** — a full-viewport split. On the left: my name, a one-line intro, a *Get my resume* button, and four boxes linking to the other pages. On the right: my portrait behind a cursor spotlight. Two image layers are stacked, and the top one is masked to a soft circle that follows the mouse, so the pixel-art avatar is only revealed where you point. It's a `<canvas>` drawn off-screen each frame, exported as a data URL and applied as a CSS `mask-image`. On touch devices, and for anyone with reduced-motion turned on, the loop never starts and the portrait is simply visible.

Before all that, a short splash intro plays — accent blocks splitting away from the middle. It lives in the hero component rather than the layout, so it only fires on a fresh visit to the home page and not on every client-side navigation.

**About** — one centred column of prose with 16px pixel characters drifting around it. The sprites are inline SVG rather than image files, so they can inherit colour and be animated individually without a sprite sheet.

**Projects** and **Experience** — the same pattern: cards three to a row inside a bounded rectangle. Hovering a card repaints the *whole page* in that entry's theme colour or image, and expands a short description with the skills used. The repaint works by writing CSS custom properties (`--page-bg`, `--page-ink`, `--page-image`) onto `<html>`, which is what lets the fixed header and footer change along with it instead of staying stubbornly the old colour. Projects sort by creation date, newest first, so I never reorder anything by hand.

**Contact** — email, GitHub, LinkedIn, phone, and a lot of deliberate empty space. The local time is live and works out British Summer Time by itself from the IANA database rather than a hard-coded offset, so it doesn't quietly go an hour wrong every October.

Every page shares a fixed header with the same four links plus a burger menu. Both read from one array in `src/lib/sections.ts`, so the menu and the home-page boxes can't drift out of sync.

---

## Structure

```
src/
  app/
    layout.tsx           root shell — fonts, metadata, header + footer
    page.tsx             home (renders <Hero />)
    about/page.tsx
    projects/page.tsx
    experience/page.tsx
    contact/page.tsx
    globals.css          all the real styling
    api/resume/route.ts  the resume form endpoint
  components/
    hero.tsx             splash, spotlight, headline, section boxes
    nav_bar.tsx          fixed header + burger menu
    footer.tsx
    entry_grid.tsx       shared card grid for projects + experience
    pixel_sprites.tsx    inline SVG sprites for /about
    local_time.tsx       live clock with DST handling
    resume_modal.tsx     the "Get my resume" dialog
  lib/
    sections.ts          the four nav links
    projects.ts          project entries
    experience.ts        experience entries
    timezone.ts          IANA offset + abbreviation lookup
    resume_request.ts    form validation, shared client + server
    prisma.ts            database client
prisma/schema.prisma     database schema
public/                  avatar, placeholder art, resume PDF
```

Almost everything is a Server Component. There are only five client boundaries in the whole site — the hero (needs pointer coordinates), the nav (menu state), the card grid (hover state), the clock (needs the visitor's real current time, not the build's), and the resume modal. Every page shell, and all of `/about`, renders on the server and ships no JavaScript.

**On the database.** There's a full Prisma schema — projects, tags, skills, experience, messages, page views — but the site doesn't read from it yet. The pages render from typed arrays in `src/lib/`, and the only thing touching Postgres is the resume endpoint, which saves a row per enquiry. That's on purpose: the pages used to query Prisma at build time, and a database timeout would fail the entire deploy, which is a silly way to lose a static page about myself. The schema is where this is going; the arrays are where it is.

---

## The resume form

Clicking *Get my resume* opens a dialog asking for name or company, position, email, and whether they'd like an interview. Submitting it does four things:

1. **Validates.** The same function runs in the browser for instant feedback and again on the server, because anyone can POST straight to the endpoint. It checks the email shape, rejects disposable inboxes and no-reply addresses, and filters spam and abuse on word boundaries — so *Scunthorpe* and *analysis* survive, which is the classic way these filters embarrass themselves. There's also a hidden honeypot field that bots fill in and people never see.
2. **Saves** the enquiry to the database.
3. **Emails me** the details, with reply-to set to them, so hitting reply in Gmail goes to the right place.
4. **Starts the PDF downloading** in the browser.

Step 4 is the one that matters. The download is the delivery path, not the email — it's immediate, it works for any address, and it doesn't depend on anything else staying up. Every other step is best-effort: a dead database or an email outage degrades what *I* get, never what the visitor gets. Once validation passes, they always end up with the file.

Emailing a copy to the requester is currently switched off. Resend's shared sender can only deliver to my own address until I verify a domain, so that send could never succeed and there's no point pretending otherwise. It re-enables itself once `RESUME_FROM` points at a verified domain — the code derives that rather than reading a flag I'd forget to flip.

There's also a `GET /api/resume` self-test that reports whether the API key is loaded, whether Resend accepts it, and what happens on a real send. It returns 404 in production.

---

## Running it

```bash
npm install
npm run dev
```

Environment variables live in `.env`, which is gitignored: `DATABASE_URL` and `RESEND_API_KEY`, plus optional `RESUME_TO`, `RESUME_FROM` and `RESUME_URL` — those three fall back to sensible defaults if left blank.

---

## Still to do

- Point the projects and experience pages at the database instead of the arrays
- Verify a domain so resume emails can reach people who aren't me
- Real content for a couple of the project entries
- Analytics — the `PageView` model exists but nothing writes to it yet

---

Built by Temuulen Wang. Not open for reuse, but happy to talk about any of it.