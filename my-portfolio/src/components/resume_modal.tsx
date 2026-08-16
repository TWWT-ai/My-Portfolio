"use client";

/**
 * ADDED — the "Get my resume" dialog, opened from the home-page CTA.
 *
 * Collects: name / company, position, email, and whether they want an
 * interview. Posts to /api/resume, which stores the request, emails Temuulen,
 * and returns the resume URL.
 *
 * DELIVERY: the download starts in the browser as soon as the POST succeeds.
 * That is the primary path — Resend cannot email a stranger until a domain is
 * verified, and waiting on an inbox is worse UX anyway. The success screen
 * also shows a manual download link, because a programmatic click can be
 * blocked and a dead end here would be the worst possible moment for one.
 *
 * Validation runs through the SAME `validateResumeRequest` the API route uses
 * (src/lib/resume_request.ts). The client pass is a courtesy for instant
 * feedback; the server pass is the one that enforces anything, because the
 * route can be hit directly. Errors returned by the server are merged back in,
 * so a rule the client somehow missed still surfaces on the right field.
 *
 * Accessibility, since this is a modal and they are easy to get wrong:
 *  - role="dialog" + aria-modal, labelled by the heading.
 *  - Focus moves to the first field on open and returns to the trigger on
 *    close, so keyboard users are not dumped at the top of the document.
 *  - Tab is trapped inside while open; Escape closes.
 *  - Background scroll is locked.
 *  - Errors are tied to inputs with aria-describedby and aria-invalid.
 *
 * The honeypot `website` field is visually hidden but present in the DOM. Bots
 * fill every input they find; humans never see it. It is not a CAPTCHA, it just
 * removes the cheapest bots for free.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  hasErrors,
  validateResumeRequest,
  type FieldErrors,
  type InterviewAnswer,
} from "@/lib/resume_request";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Start the download without navigating away from the dialog.
 * `download` only takes effect same-origin, which /resume/*.pdf is; for an
 * off-site RESUME_URL the target="_blank" fallback opens it instead.
 */
function triggerDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function ResumeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [interview, setInterview] = useState<InterviewAnswer | "">("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  /**
   * Dev-only. The API includes a `debug` block outside production; its presence
   * is how the client knows it is safe to show. Surfaced in the UI because
   * "the email did not arrive" is otherwise only diagnosable from the terminal,
   * and Resend's rejection message names the exact cause.
   */
  const [devNote, setDevNote] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    onClose();
    // Hand focus back to whatever opened the dialog.
    returnFocusRef.current?.focus();
  }, [onClose]);

  // Remember the trigger, focus the first field, lock background scroll.
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Escape to close, Tab trapped within the panel.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const reset = () => {
    setName("");
    setPosition("");
    setEmail("");
    setInterview("");
    setWebsite("");
    setErrors({});
    setStatus("idle");
    setMessage("");
    setResumeUrl(null);
    setDevNote(null);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name,
      position,
      email,
      interview: interview as InterviewAnswer,
      website,
    };

    const clientErrors = validateResumeRequest(payload);
    if (hasErrors(clientErrors)) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        // 422 carries per-field errors; everything else is a single message.
        if (json.errors) setErrors(json.errors as FieldErrors);
        setStatus("error");
        setMessage(json.message ?? "Please check the fields above.");
        return;
      }

      setStatus("sent");
      setMessage(json.message ?? "Your download is starting.");

      // Dev diagnostics. Reports BOTH sends separately — the first version only
      // showed the owner notification, which made "the requester never got it"
      // look like a silent failure when it is in fact a documented sandbox limit.
      if (json.debug) {
        const d = json.debug;
        const lines = [
          d.notifyError
            ? `✗ Notification to ${d.to} FAILED\n  ${d.notifyError}`
            : `✓ Notification accepted by Resend for ${d.to}.`,
          d.requesterError
            ? `${d.requesterError.startsWith("disabled:") ? "⊘" : "✗"} Copy to ${d.requester} not sent\n  ${d.requesterError}`
            : `✓ Copy accepted by Resend for ${d.requester}.`,
        ];
        if (d.sandboxSender) {
          lines.push(
            `ℹ Sending from ${d.from} — Resend sandbox. Delivery is limited to ${d.to} until a domain is verified.`,
          );
        }
        setDevNote(lines.join("\n\n"));
      }

      if (json.resumeUrl) {
        setResumeUrl(json.resumeUrl as string);
        triggerDownload(json.resumeUrl as string);
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again, or email me directly.");
    }
  }

  if (!open) return null;

  const fieldError = (key: keyof FieldErrors) =>
    errors[key] ? (
      <span className="rm-error" id={`rm-${key}-error`} role="alert">
        {errors[key]}
      </span>
    ) : null;

  return (
    <div
      className="rm-backdrop"
      onMouseDown={(e) => {
        // Only a click on the backdrop itself closes — not a drag that started
        // inside the panel and happened to end out here.
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="rm-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rm-title"
      >
        <button
          type="button"
          className="rm-close"
          onClick={close}
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {status === "sent" ? (
          <div className="rm-done">
            <span className="rm-eyebrow">Done</span>
            <h2 id="rm-title" className="rm-title">
              Here it is.
            </h2>
            <p className="rm-sub">{message}</p>

            {/* Manual fallback: a blocked programmatic click must not leave
                them with nothing. */}
            {resumeUrl && (
              <p className="rm-manual">
                Didn&apos;t start?{" "}
                <a href={resumeUrl} download target="_blank" rel="noopener noreferrer">
                  Download it here
                </a>
                .
              </p>
            )}

            {devNote && (
              <pre className="rm-devnote" aria-label="Development diagnostic">
                {devNote}
              </pre>
            )}

            <button
              type="button"
              className="rm-submit"
              onClick={() => {
                reset();
                close();
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <span className="rm-eyebrow">Resume</span>
            <h2 id="rm-title" className="rm-title">
              Get my resume
            </h2>
            {/* COPY CHANGED — this used to read "…and I'll send it straight to
                your inbox", which promised an email that does not go out while
                the requester copy is disabled. Never promise delivery on a
                channel that is switched off; the download is what actually
                happens, so that is what it says. */}
            <p className="rm-sub">
              Tell me who you are and the download will start straight away.
            </p>

            <label className="rm-field">
              <span className="rm-label">Name / Company name</span>
              <input
                ref={firstFieldRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="organization"
                maxLength={80}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "rm-name-error" : undefined}
              />
              {fieldError("name")}
            </label>

            <label className="rm-field">
              <span className="rm-label">Position</span>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Engineering Manager, Recruiter"
                maxLength={80}
                aria-invalid={!!errors.position}
                aria-describedby={errors.position ? "rm-position-error" : undefined}
              />
              {fieldError("position")}
            </label>

            <label className="rm-field">
              <span className="rm-label">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "rm-email-error" : undefined}
              />
              {fieldError("email")}
            </label>

            <fieldset className="rm-field rm-fieldset">
              <legend className="rm-label">
                Would you like to arrange an interview?
              </legend>
              <div className="rm-choices">
                {(["yes", "no"] as const).map((value) => (
                  <label key={value} className="rm-choice">
                    <input
                      type="radio"
                      name="interview"
                      value={value}
                      checked={interview === value}
                      onChange={() => setInterview(value)}
                    />
                    <span>{value === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
              </div>
              {fieldError("interview")}
            </fieldset>

            {/* Honeypot — hidden from people, irresistible to bots. */}
            <div className="rm-hp" aria-hidden="true">
              <label htmlFor="rm-website">Website</label>
              <input
                id="rm-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {status === "error" && message && (
              <p className="rm-formerror" role="alert">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="rm-submit"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send me the resume"}
            </button>

            <p className="rm-fineprint">
              Your details are used only to send the resume and reply. Nothing
              else, no list.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
