/**
 * ADDED — POST /api/resume, behind the "Get my resume" button.
 *
 * Does four things, in this order, and the order is deliberate:
 *   1. Validate (server-side — the browser's check is only a courtesy).
 *   2. Save a Message row.        <- best effort, NEVER fatal. See below.
 *   3. Email the requester a copy. <- CURRENTLY OFF, see EMAIL_THE_REQUESTER.
 *   4. Email YOU the notification, stating whether step 3 actually worked.
 * ...then return the resume URL so the BROWSER downloads it directly.
 *
 * STEP 3 IS DISABLED and step 4 is not. That split is deliberate: the copy to
 * the requester cannot work without a verified domain, but the notification to
 * me goes to my own address, which is the one address the sandbox sender IS
 * allowed to reach. So I still find out about every enquiry.
 *
 * 3 RUNS BEFORE 4 ON PURPOSE. The notification tells you whether to follow up
 * by hand, so it cannot be written before the thing it reports on has happened.
 *
 * WHY THE BROWSER DOWNLOAD IS THE PRIMARY DELIVERY PATH
 * Resend will only deliver to the account owner's own address until a domain
 * is verified, so the "here is my resume" email cannot reach a stranger yet.
 * Handing the file straight back to the browser sidesteps that completely: the
 * visitor gets the PDF immediately, from any address, with no DNS and no
 * deliverability risk. The email to them is a nice-to-have that starts working
 * on its own the day RESUME_FROM points at a verified domain — no code change.
 *
 * It is also just better UX. The person is sitting there having submitted a
 * form; a download now beats an inbox round-trip.
 *
 * THE GUARANTEE: once validation passes, the visitor ALWAYS gets the file.
 * Every email send and the database write are best-effort. A missing API key,
 * a Resend outage or a dead database degrade what *I* receive, never what
 * *they* receive. The only responses that withhold the download are 400
 * (malformed), 422 (invalid input) and 429 (rate limited).
 *
 * WHY THE DATABASE WRITE IS NON-FATAL
 * The Postgres connection is currently timing out (it is what fails the Vercel
 * build). If a failed insert rejected the request, every resume enquiry would
 * be lost while the DB is down — the exact opposite of why we store them. So
 * the insert is wrapped: if it throws we log it and carry on, and the visitor
 * still gets the resume. Once the DB is healthy this changes nothing; it just
 * stops an outage in the "nice to have" path from killing the "must work" one.
 *
 * NO SDK. Resend is called over plain HTTPS with fetch, so this needs no npm
 * install. `import { Resend } from "resend"` would read slightly nicer; it is
 * not worth a dependency and a lockfile change for one POST.
 *
 * ENV VARS (set these in Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY   required. Server-only — never prefix with NEXT_PUBLIC_.
 *   RESUME_FROM      e.g. "Temuulen Wang <hello@yourdomain.com>".
 *                    Must be a domain you have verified in Resend.
 *                    Falls back to Resend's shared test sender, which only
 *                    delivers to your OWN address — fine for development.
 *   RESUME_TO        where notifications go. Defaults to your Gmail.
 *   RESUME_URL       link to the PDF. Accepts an absolute URL, or a path
 *                    relative to the site root ("/resume/cv.pdf"); a relative
 *                    value is made absolute against the request origin, since
 *                    a bare path in an email body is unclickable. A leading
 *                    "/public/" is stripped — files in public/ are served from
 *                    the ROOT in Next.js, so "/public/x.pdf" always 404s.
 *                    Defaults to /resume.pdf.
 *   RESEND_ENDPOINT  test seam only. Point it at a local mock to exercise this
 *                    route without sending real email. Leave unset in prod.
 *
 * PREREQUISITE: public/resume.pdf must exist, or the link in the email 404s.
 */

import {
  escapeHtml,
  hasErrors,
  normaliseRequest,
  validateResumeRequest,
  type ResumeRequest,
} from "@/lib/resume_request";

// Must run per-request, never prerendered or cached.
export const dynamic = "force-dynamic";

const RESEND_ENDPOINT = process.env.RESEND_ENDPOINT ?? "https://api.resend.com/emails";

/**
 * Read an env var, treating BLANK as absent.
 *
 * `??` was the bug here. A declared-but-empty line in .env — `RESUME_TO=` —
 * yields "", and an empty string is neither null nor undefined, so `??` hands
 * back "" instead of the fallback. Resend then rejected the send with
 * `422 validation_error: Invalid 'to' field`, which reads like a formatting
 * problem in the address rather than a missing one.
 *
 * This matters because the config file positively encourages blank lines:
 * leaving RESUME_FROM empty is the documented way to fall back to
 * onboarding@resend.dev. "Present but empty" therefore has to mean "unset".
 */
function envOr(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

const OWNER_EMAIL = envOr(process.env.RESUME_TO, "temuulenwang@gmail.com");
// Resend's shared onboarding sender. Works with no DNS setup but will only
// deliver to the account owner's own address.
const FROM = envOr(
  process.env.RESUME_FROM,
  "Temuulen Wang <onboarding@resend.dev>",
);

/**
 * Crude per-IP throttle. In-memory, so it resets on redeploy and is per-instance
 * — genuinely not enough for a popular site, where this belongs in Redis or the
 * database. It is enough to stop one bot hammering the endpoint, which is the
 * realistic threat for a portfolio.
 */
const RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 5 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude memory bound
  return recent.length > RATE_LIMIT.max;
}

/**
 * Turn RESUME_URL into something an email client can actually open.
 *
 * Two failure modes this exists to absorb:
 *  - A RELATIVE path. Fine in a web page, useless in an email — there is no
 *    document base to resolve it against, so the link is dead.
 *  - A leading "/public/". Next.js serves public/ from the site ROOT, so
 *    public/resume/cv.pdf is "/resume/cv.pdf". Writing the folder name into
 *    the URL is the most common way to get a 404 here.
 */
function resolveResumeUrl(origin: string): string {
  const raw = process.env.RESUME_URL?.trim();
  if (!raw) return `${origin}/resume.pdf`;
  if (/^https?:\/\//i.test(raw)) return raw;
  const path = raw.replace(/^\/?public\//i, "/").replace(/^\/?/, "/");
  return `${origin}${path}`;
}

async function sendEmail(payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}

export async function POST(request: Request) {
  // --- rate limit -------------------------------------------------------
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      { ok: false, message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  // --- parse + validate -------------------------------------------------
  let body: Partial<ResumeRequest>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const errors = validateResumeRequest(body);
  if (hasErrors(errors)) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  const data = normaliseRequest(body as ResumeRequest);
  const wantsInterview = data.interview === "yes";

  // No API key is NOT a failure any more. The visitor's download does not
  // depend on email, so the only consequence is that no mail goes out.
  const canSendEmail = Boolean(process.env.RESEND_API_KEY);
  if (!canSendEmail) {
    console.warn("[resume] RESEND_API_KEY not set — serving the download, sending no email.");
  }

  const origin = new URL(request.url).origin;
  const resumeUrl = resolveResumeUrl(origin);

  // --- 1. store (best effort) -------------------------------------------
  // Prisma is imported LAZILY, inside the try. A top-level import would run at
  // module load, so a missing or broken generated client would 500 the whole
  // route before validation even ran — which is precisely the coupling this
  // "best effort" write is supposed to avoid.
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.message.create({
      data: {
        name: data.name,
        email: data.email,
        subject: `Resume request — ${data.position}`,
        body: [
          `Name / Company: ${data.name}`,
          `Position: ${data.position}`,
          `Email: ${data.email}`,
          `Interested in an interview: ${wantsInterview ? "Yes" : "No"}`,
        ].join("\n"),
      },
    });
  } catch (err) {
    // Deliberately swallowed — see the header comment. Covers a failed insert
    // AND a client that will not even load.
    console.error("[resume] DB write skipped/failed, continuing to send:", err);
  }

  const safe = {
    name: escapeHtml(data.name),
    position: escapeHtml(data.position),
    email: escapeHtml(data.email),
  };

  /**
   * Is the configured sender Resend's shared SANDBOX address?
   *
   * onboarding@resend.dev will only deliver to the address that owns the Resend
   * account. Every other recipient comes back:
   *
   *   403 "You can only send testing emails to your own email address
   *        (you@example.com). To send emails to other recipients, please verify
   *        a domain at resend.com/domains, and change the `from` address to an
   *        email using this domain."
   *
   * That is Resend's own documented rule, not a bug and not something any code
   * here can work around. Detected from the FROM address rather than hard-coded
   * so it clears itself the moment a real domain is configured.
   */
  const SANDBOX_SENDER = /@resend\.dev>?\s*$/i.test(FROM);

  /**
   * THE COPY-TO-REQUESTER EMAIL IS OFF while the sandbox sender is in use.
   *
   * Turned off deliberately after testing: with no verified domain it could
   * never reach anyone except me, so every attempt was a guaranteed 403 that
   * cost a round-trip and produced a scary-looking error for a situation that
   * is entirely expected. The visitor is not affected — the PDF has always come
   * from the browser download below, which is the primary path and works for
   * every address, including ones that do not exist.
   *
   * IT SWITCHES BACK ON BY ITSELF. Verify a domain in Resend, set
   *   RESUME_FROM="Temuulen Wang <hello@yourdomain.com>"
   * and this becomes true again on the next boot. No code change, no flag to
   * remember — which is the point of deriving it instead of hard-coding false.
   */
  const EMAIL_THE_REQUESTER = !SANDBOX_SENDER;

  /* --- 3. email THEM a copy, if that is possible at all -------------------
   *
   * ORDER: this runs BEFORE the owner notification. It used to run after, which
   * meant the notification had to *assume* the copy went out and said so in the
   * body — "Your resume has already been sent to them automatically." In
   * sandbox mode that sentence was false in every single email, and it is the
   * one line that decides whether I follow up by hand.
   *
   * Skipping or failing here is never fatal. They already have the file, and
   * their details are in the notification below.
   */
  let emailedRequester = false;
  let requesterError: string | null = null;
  try {
    if (!canSendEmail) throw new Error("no RESEND_API_KEY");
    if (!EMAIL_THE_REQUESTER) {
      // Not an error — a disabled feature. Worded for whoever reads this in a
      // log in six months having forgotten why.
      throw new Error(
        `disabled: sender ${FROM} is Resend's sandbox and can only deliver to ${OWNER_EMAIL}. Verify a domain and set RESUME_FROM to re-enable.`,
      );
    }
    await sendEmail({
      from: FROM,
      to: [data.email],
      reply_to: OWNER_EMAIL,
      subject: "My resume — Temuulen Wang",
      html: `
        <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6;color:#111">
          <p>Hi ${safe.name},</p>
          <p>Thanks for your interest — my resume is here:</p>
          <p style="margin:24px 0">
            <a href="${resumeUrl}" style="background:#111;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;display:inline-block">
              Download my resume
            </a>
          </p>
          ${
            wantsInterview
              ? "<p>You mentioned you'd like to arrange an interview — I'll follow up personally within a day or two. If it's urgent, just reply to this email.</p>"
              : "<p>If you'd like to talk, just reply to this email.</p>"
          }
          <p style="margin-top:28px">Best,<br/>Temuulen Wang</p>
          <p style="font-size:12px;color:#6b6b6b;margin-top:24px">
            You received this because someone requested my resume using ${safe.email} at my portfolio site.
          </p>
        </div>`,
      text: [
        `Hi ${data.name},`,
        "",
        "Thanks for your interest — my resume is here:",
        resumeUrl,
        "",
        wantsInterview
          ? "You mentioned you'd like to arrange an interview — I'll follow up personally within a day or two."
          : "If you'd like to talk, just reply to this email.",
        "",
        "Best,",
        "Temuulen Wang",
      ].join("\n"),
    });
    emailedRequester = true;
  } catch (err) {
    // Not an error condition. Logged so "domain not verified yet" is
    // distinguishable from a genuine Resend outage.
    requesterError = err instanceof Error ? err.message : String(err);
    console.warn("[resume] copy to requester not sent:", requesterError);
  }

  // --- 4. notify you — the send that actually matters --------------------
  // The follow-up line now states the real outcome. When the copy did not go
  // out this is the only thing standing between a lead and silence, so it is
  // styled as a warning rather than a footnote.
  const followUpHtml = emailedRequester
    ? `<p style="margin:20px 0 0;font-size:13px;color:#6b6b6b">
         A copy of your resume was emailed to them. Reply to this email to reach them directly.
       </p>`
    : `<p style="margin:20px 0 0;padding:12px 14px;border-left:3px solid #d97706;background:#fffbeb;font-size:13px;color:#7c4a03">
         <strong>They were NOT emailed a copy.</strong> They did download the PDF from the site.
         Reply to this email if you want to reach them.
         ${SANDBOX_SENDER ? "<br/>Reason: no verified domain yet, so sending is limited to your own address." : ""}
       </p>`;

  const followUpText = emailedRequester
    ? "A copy of your resume was emailed to them."
    : "NOT emailed a copy — they downloaded the PDF from the site. Reply here to reach them.";

  let notifiedOwner = false;
  let notifyError: string | null = null;
  try {
    if (!canSendEmail) throw new Error("no RESEND_API_KEY");
    await sendEmail({
      from: FROM,
      to: [OWNER_EMAIL],
      // reply_to is what makes this useful: hitting reply in Gmail goes
      // straight to the requester rather than back to your own send address.
      reply_to: data.email,
      subject: `Resume request — ${data.name}${wantsInterview ? " (wants an interview)" : ""}`,
      html: `
        <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6;color:#111">
          <h2 style="margin:0 0 16px;font-size:18px">New resume request</h2>
          <table style="border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 16px 6px 0;color:#6b6b6b">Name / Company</td><td style="padding:6px 0"><strong>${safe.name}</strong></td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#6b6b6b">Position</td><td style="padding:6px 0">${safe.position}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#6b6b6b">Email</td><td style="padding:6px 0"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#6b6b6b">Interview</td><td style="padding:6px 0"><strong>${wantsInterview ? "Yes" : "No"}</strong></td></tr>
          </table>
          ${followUpHtml}
        </div>`,
      text: [
        "New resume request",
        "",
        `Name / Company: ${data.name}`,
        `Position: ${data.position}`,
        `Email: ${data.email}`,
        `Interview: ${wantsInterview ? "Yes" : "No"}`,
        "",
        followUpText,
      ].join("\n"),
    });
    notifiedOwner = true;
  } catch (err) {
    // Deliberately NOT fatal. Blocking here would deny the visitor their
    // download because of a problem on my side, and would not recover the
    // lead either — the DB row above is the durable record. Logged loudly so
    // a real Resend outage is visible in the Vercel logs.
    notifyError = err instanceof Error ? err.message : String(err);
    console.error("[resume] OWNER NOTIFICATION FAILED — check Resend:", err);
  }

  // The client uses resumeUrl to start the download immediately.
  return Response.json({
    ok: true,
    resumeUrl,
    emailed: emailedRequester,
    notified: notifiedOwner,
    // Development only — never leak internal error text to real visitors.
    ...(process.env.NODE_ENV !== "production"
      ? {
          debug: {
            notifyError,
            requesterError,
            from: FROM,
            to: OWNER_EMAIL,
            requester: data.email,
            sandboxSender: SANDBOX_SENDER,
          },
        }
      : {}),
    message: emailedRequester
      ? wantsInterview
        ? "Your download is starting — a copy is in your inbox too. I'll be in touch about an interview shortly."
        : "Your download is starting — a copy is in your inbox too."
      : wantsInterview
        ? "Your download is starting. I'll be in touch about an interview shortly."
        : "Your download is starting.",
  });
}

/**
 * GET /api/resume — configuration self-test. DEVELOPMENT ONLY.
 *
 * Added because "the email didn't arrive" has half a dozen possible causes and
 * the server log is the only place they are visible. Open this in a browser and
 * it answers, in order:
 *   - is the key actually loaded into THIS running process? (catches "I edited
 *     .env but did not restart", which is invisible from the outside)
 *   - does Resend accept the key at all?
 *   - what exactly does Resend say when we try to send to RESUME_TO?
 *
 * The last one is the important one. Without a verified domain Resend refuses
 * any recipient other than the address that OWNS the Resend account — and if
 * your account was created under a different address than RESUME_TO, the
 * notification is rejected with a clear message that otherwise only ever
 * appears in the terminal.
 *
 * Returns 404 in production so it cannot be probed on the live site.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const key = process.env.RESEND_API_KEY ?? "";
  const origin = new URL(request.url).origin;

  const config = {
    keyLoadedInThisProcess: Boolean(key),
    keyPrefix: key ? `${key.slice(0, 6)}…` : null,
    keyLooksWellFormed: /^re_[A-Za-z0-9_]+$/.test(key),
    keyHasStrayQuotes: key.includes('"') || key.includes("'"),
    from: FROM,
    notificationsGoTo: OWNER_EMAIL,
    resolvedResumeUrl: resolveResumeUrl(origin),
  };

  if (!config.keyLoadedInThisProcess) {
    return Response.json({
      config,
      verdict:
        "No API key in this process. Either it is missing from .env, or the dev server was not restarted after you added it.",
    });
  }

  // Does Resend accept the key at all?
  let keyValid: boolean | null = null;
  let keyCheck = "";
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });
    keyValid = res.ok;
    keyCheck = `${res.status} ${res.ok ? "OK" : await res.text()}`;
  } catch (err) {
    keyCheck = `network error: ${err instanceof Error ? err.message : String(err)}`;
  }

  // What happens on a real send to yourself?
  let sendStatus = "";
  try {
    await sendEmail({
      from: FROM,
      to: [OWNER_EMAIL],
      subject: "Resend self-test — portfolio",
      text: "If this arrived, sending to your own address works. Delete this email.",
    });
    sendStatus = "ACCEPTED — check your inbox, and Promotions/Spam.";
  } catch (err) {
    sendStatus = err instanceof Error ? err.message : String(err);
  }

  return Response.json({
    config,
    keyValid,
    keyCheck,
    testSendToYourself: sendStatus,
    hint:
      "A 403 mentioning 'testing emails' means your Resend account is registered under a DIFFERENT address than notificationsGoTo. Set RESUME_TO to the address you signed up to Resend with.",
  });
}
