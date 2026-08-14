/**
 * ADDED — POST /api/resume, behind the "Get my resume" button.
 *
 * Does three things, in this order, and the order is deliberate:
 *   1. Validate (server-side — the browser's check is only a courtesy).
 *   2. Save a Message row.        <- best effort, NEVER fatal. See below.
 *   3. Send two emails via Resend: a notification to you, and the resume to
 *      the requester.
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
 *   RESUME_URL       public link to the PDF. Defaults to /resume.pdf on the
 *                    current deployment.
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
const OWNER_EMAIL = process.env.RESUME_TO ?? "temuulenwang@gmail.com";
// Resend's shared onboarding sender. Works with no DNS setup but will only
// deliver to the account owner's own address.
const FROM = process.env.RESUME_FROM ?? "Temuulen Wang <onboarding@resend.dev>";

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

  if (!process.env.RESEND_API_KEY) {
    console.error("[resume] RESEND_API_KEY is not set — cannot send.");
    return Response.json(
      { ok: false, message: "Email isn't configured yet. Please email me directly." },
      { status: 503 },
    );
  }

  const origin = new URL(request.url).origin;
  const resumeUrl = process.env.RESUME_URL ?? `${origin}/resume.pdf`;

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

  // --- 2. notify you ----------------------------------------------------
  const safe = {
    name: escapeHtml(data.name),
    position: escapeHtml(data.position),
    email: escapeHtml(data.email),
  };

  try {
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
          <p style="margin:20px 0 0;font-size:13px;color:#6b6b6b">
            Your resume has already been sent to them automatically. Reply to this email to reach them directly.
          </p>
        </div>`,
      text: [
        "New resume request",
        "",
        `Name / Company: ${data.name}`,
        `Position: ${data.position}`,
        `Email: ${data.email}`,
        `Interview: ${wantsInterview ? "Yes" : "No"}`,
        "",
        "Your resume has already been sent to them automatically.",
      ].join("\n"),
    });
  } catch (err) {
    console.error("[resume] notification failed:", err);
    return Response.json(
      { ok: false, message: "Couldn't send that right now. Please email me directly." },
      { status: 502 },
    );
  }

  // --- 3. send the resume to them ---------------------------------------
  // Failing here must not report failure to the visitor: you already have their
  // details from step 2 and can follow up by hand.
  try {
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
  } catch (err) {
    console.error("[resume] resume delivery failed:", err);
    return Response.json({
      ok: true,
      message:
        "Got it. There was a hiccup emailing the file — I'll send it to you personally.",
    });
  }

  return Response.json({
    ok: true,
    message: wantsInterview
      ? "Sent. Check your inbox for my resume — I'll be in touch about an interview shortly."
      : "Sent. Check your inbox for my resume.",
  });
}
