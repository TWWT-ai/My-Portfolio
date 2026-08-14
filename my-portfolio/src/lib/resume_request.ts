/**
 * ADDED — validation for the "Get my resume" form.
 *
 * NO NEW DEPENDENCIES ON PURPOSE. The roadmap calls for Zod, and Zod would be
 * the better long-term choice, but neither `zod` nor `resend` is in
 * package.json today and adding them means an npm install before anything on
 * the site works again. This is ~150 lines of plain TypeScript with no imports,
 * so the feature runs the moment the files land. Swapping to Zod later is a
 * drop-in: keep `validateResumeRequest`'s signature and change its body.
 *
 * Shared by the client form and the API route — the SAME function runs in both
 * places. Client-side validation is a courtesy that gives instant feedback;
 * server-side validation is the one that counts, because anyone can POST to the
 * route directly with curl. Never rely on the browser having checked.
 */

export type InterviewAnswer = "yes" | "no";

export type ResumeRequest = {
  /** Person's name, or the company's. */
  name: string;
  position: string;
  email: string;
  interview: InterviewAnswer;
  /** Honeypot — must stay empty. Real users never see this field. */
  website?: string;
};

export type FieldErrors = Partial<Record<keyof ResumeRequest, string>>;

/* ------------------------------------------------------------------ *
 * Email
 * ------------------------------------------------------------------ */

/**
 * Pragmatic address check. Deliberately NOT the RFC 5322 grammar — that
 * monster accepts things no mail server will, and rejecting a valid address is
 * worse than accepting a weird one. This enforces the shape that matters:
 * one @, something before it, a dotted domain, a 2+ letter TLD.
 */
const EMAIL_RE = /^[^\s@,;:<>()[\]\\]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/**
 * Throwaway inbox providers. Someone using one is not a recruiter who wants a
 * reply — the resume auto-reply would go into a mailbox that expires in ten
 * minutes. Not exhaustive and never will be; it stops the lazy majority.
 */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "throwawaymail.com", "yopmail.com", "trashmail.com",
  "sharklasers.com", "getnada.com", "dispostable.com", "maildrop.cc",
  "fakeinbox.com", "tempinbox.com", "mintemail.com", "spamgourmet.com",
  "mohmal.com", "emailondeck.com", "mailnesia.com", "tempr.email",
]);

/** Addresses nobody reads — an auto-reply here is guaranteed to be wasted. */
const ROLE_PREFIXES = new Set([
  "noreply", "no-reply", "donotreply", "do-not-reply", "postmaster",
  "mailer-daemon", "bounce", "bounces",
]);

/* ------------------------------------------------------------------ *
 * Content
 * ------------------------------------------------------------------ */

/**
 * Blocked terms, matched on WORD BOUNDARIES against a normalised string.
 *
 * Substring matching is the classic mistake here — it is how filters end up
 * rejecting "Scunthorpe", "Essex", "analysis" and "class". Every entry below is
 * matched as a whole word only.
 *
 * Two categories, kept separate because they exist for different reasons:
 *   - spam: the vocabulary of bulk commercial mail, which is what actually
 *     arrives at a public form.
 *   - abuse: slurs and sexual content, so the notification email stays safe to
 *     open in front of anyone.
 */
const BLOCKED_WORDS = [
  // spam / SEO outreach
  "viagra", "cialis", "casino", "porn", "porno", "xxx", "crypto",
  "bitcoin", "forex", "seo services", "backlinks", "guest post",
  "loan", "payday", "escort", "escorts", "sexcam", "webcam girls",
  "make money fast", "work from home", "click here", "buy now",
  "limited offer", "risk free", "winner", "lottery", "prize",
  "nigerian prince", "inheritance", "wire transfer", "cheap meds",
  // abuse
  "fuck", "fucking", "shit", "bitch", "cunt", "bastard", "asshole",
  "nigger", "faggot", "retard", "rape", "whore", "slut",
];

/**
 * Collapse the tricks people use to slip words past a filter:
 * leetspeak digits, and separators inserted between letters (f.u.c.k, v-i-a-g-r-a).
 */
function normalise(input: string): string {
  const leet = input
    .toLowerCase()
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t");
  // Strip separators between single letters so "f.u.c.k" becomes "fuck",
  // while leaving ordinary spacing between real words intact.
  return leet.replace(/(?<=\b\w)[\s._\-*]+(?=\w\b)/g, "");
}

function containsBlockedWord(value: string): string | null {
  const text = normalise(value);
  for (const word of BLOCKED_WORDS) {
    const pattern = new RegExp(`\\b${word.replace(/\s+/g, "\\s*")}\\b`, "i");
    if (pattern.test(text)) return word;
  }
  return null;
}

/** Links in a name or job title are always spam. */
const URL_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|cn|xyz|top|info)\b)/i;

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

export const LIMITS = {
  name: { min: 2, max: 80 },
  position: { min: 2, max: 80 },
  email: { max: 254 }, // RFC 5321 maximum path length
} as const;

/**
 * Returns {} when the payload is good. Run on the client for feedback and on
 * the server for enforcement.
 */
export function validateResumeRequest(input: Partial<ResumeRequest>): FieldErrors {
  const errors: FieldErrors = {};

  const name = (input.name ?? "").trim();
  const position = (input.position ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  const interview = input.interview;

  // Honeypot. A bot fills every field it finds; a human never sees this one.
  // Reported against `name` so an automated client cannot learn which field
  // gave it away.
  if ((input.website ?? "").trim() !== "") {
    errors.name = "Something went wrong. Please try again.";
    return errors;
  }

  // --- name ---
  if (name.length < LIMITS.name.min) {
    errors.name = "Please enter your name or your company's name.";
  } else if (name.length > LIMITS.name.max) {
    errors.name = `Please keep this under ${LIMITS.name.max} characters.`;
  } else if (URL_RE.test(name)) {
    errors.name = "Links aren't allowed here.";
  } else if (containsBlockedWord(name)) {
    errors.name = "Please keep this professional.";
  }

  // --- position ---
  if (position.length < LIMITS.position.min) {
    errors.position = "Please enter a position or role.";
  } else if (position.length > LIMITS.position.max) {
    errors.position = `Please keep this under ${LIMITS.position.max} characters.`;
  } else if (URL_RE.test(position)) {
    errors.position = "Links aren't allowed here.";
  } else if (containsBlockedWord(position)) {
    errors.position = "Please keep this professional.";
  }

  // --- email ---
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (email.length > LIMITS.email.max || !EMAIL_RE.test(email)) {
    errors.email = "That doesn't look like a valid email address.";
  } else {
    const [local, domain] = email.split("@");
    if (DISPOSABLE_DOMAINS.has(domain)) {
      errors.email = "Please use a permanent email address.";
    } else if (ROLE_PREFIXES.has(local)) {
      errors.email = "Please use an address that can receive replies.";
    } else if (containsBlockedWord(email)) {
      errors.email = "That address isn't accepted.";
    }
  }

  // --- interview ---
  if (interview !== "yes" && interview !== "no") {
    errors.interview = "Please choose yes or no.";
  }

  return errors;
}

export const hasErrors = (errors: FieldErrors): boolean =>
  Object.keys(errors).length > 0;

/** Trim and lowercase the email, ready for storage or sending. */
export function normaliseRequest(input: ResumeRequest): ResumeRequest {
  return {
    name: input.name.trim(),
    position: input.position.trim(),
    email: input.email.trim().toLowerCase(),
    interview: input.interview,
  };
}

/** Escape before interpolating user input into an HTML email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
