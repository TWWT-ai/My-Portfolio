/**
 * ADDED — derive a UTC offset from an IANA time zone at a point in time.
 *
 * WHY THIS EXISTS: the contact page used to hard-code "UTC+8". Any hard-coded
 * offset is wrong for half the year in a zone that observes daylight saving —
 * the UK is UTC+0 in winter and UTC+1 in summer, and the switch dates move
 * every year. Storing the OFFSET is the bug; store the ZONE and compute the
 * offset when you render.
 *
 * Everything here goes through `Intl.DateTimeFormat`, which reads the IANA
 * time zone database bundled with the JS engine. That database already knows
 * every DST rule and historical change, so there is no table to maintain and
 * nothing to update when a government moves its clocks. Verified output:
 *
 *   Europe/London     15 Jan -> GMT+00:00 / "GMT"    15 Jul -> GMT+01:00 / "BST"
 *   America/New_York  15 Jan -> GMT-05:00 / "GMT-5"  15 Jul -> GMT-04:00 / "GMT-4"
 *   Asia/Ulaanbaatar  both    -> GMT+08:00           (Mongolia dropped DST in 2017)
 *
 * Note the asymmetry in the last column: `timeZoneName: "short"` only yields a
 * real abbreviation where the locale has one ("BST"). Elsewhere it just repeats
 * the offset, which is why zoneAbbreviation() returns null in that case rather
 * than rendering "GMT+8 (GMT+8)".
 *
 * Pure functions, no React — safe on the server or the client. But see
 * components/local_time.tsx for the rendering caveat: a statically rendered
 * page bakes the value at BUILD time, which goes stale at the next DST change.
 */

/** Read one formatted part out of Intl, or "" if the engine omits it. */
function part(
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
  type: Intl.DateTimeFormatPartTypes,
  at: Date,
): string {
  try {
    return (
      new Intl.DateTimeFormat("en-GB", { timeZone, ...options })
        .formatToParts(at)
        .find((p) => p.type === type)?.value ?? ""
    );
  } catch {
    // Invalid IANA identifier — fail soft rather than crash a page over a label.
    return "";
  }
}

/**
 * "UTC+1" in British Summer Time, "UTC+0" in winter, "UTC+5:30" for Kolkata.
 * Minutes are only shown when they are non-zero, so the common case stays tidy.
 */
export function utcOffsetLabel(timeZone: string, at: Date = new Date()): string {
  const raw = part(timeZone, { timeZoneName: "longOffset" }, "timeZoneName", at);

  // Some engines return a bare "GMT"/"UTC" at exactly zero offset instead of
  // "GMT+00:00", so treat that as +0 rather than falling through to the regex.
  if (raw === "GMT" || raw === "UTC" || raw === "") return "UTC+0";

  const m = /^(?:GMT|UTC)([+-])(\d{2}):(\d{2})$/.exec(raw);
  if (!m) return "UTC";

  const [, sign, hh, mm] = m;
  const hours = Number(hh);
  const minutes = Number(mm);
  return `UTC${sign}${hours}${minutes ? `:${mm}` : ""}`;
}

/**
 * "BST", "GMT", "EST" — or null where the zone has no letter abbreviation and
 * Intl would just hand back the offset again.
 */
export function zoneAbbreviation(
  timeZone: string,
  at: Date = new Date(),
): string | null {
  const raw = part(timeZone, { timeZoneName: "short" }, "timeZoneName", at);
  return /^[A-Za-z]{2,5}$/.test(raw) ? raw : null;
}

/** Current wall-clock time in that zone, 24h, e.g. "21:47". */
export function localTime(timeZone: string, at: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(at);
  } catch {
    return "";
  }
}

/**
 * Everything the contact line needs, in one call.
 * e.g. { time: "21:47", offset: "UTC+1", abbreviation: "BST" }
 */
export function zoneSummary(timeZone: string, at: Date = new Date()) {
  return {
    time: localTime(timeZone, at),
    offset: utcOffsetLabel(timeZone, at),
    abbreviation: zoneAbbreviation(timeZone, at),
  };
}
