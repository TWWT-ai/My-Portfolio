"use client";

/**
 * ADDED — the "Ulaanbaatar, Mongolia · UTC+8" line on /contact, made live.
 *
 * WHY THIS IS A CLIENT COMPONENT, even though lib/timezone.ts is pure:
 *
 * /contact is statically rendered. If the offset were computed on the server it
 * would be frozen at BUILD time — deploy in January from a UK zone and the page
 * would still claim UTC+0 all through the summer, until something happened to
 * trigger a rebuild. That is exactly the bug the IANA lookup was meant to
 * remove, reintroduced one layer up.
 *
 * Computing in the browser instead means the value is correct on every view,
 * for as long as the deployment lives, with no revalidation and no cron.
 *
 * HYDRATION: the server has no idea what time it is where the visitor is, and
 * more to the point a build-time value and a render-time value can disagree
 * across a DST boundary — React would flag the mismatch. So the first paint
 * renders the place name alone, and the zone detail is filled in after mount.
 * `min-width` on the detail span reserves the space so nothing shifts.
 *
 * The interval re-reads the zone every 30s. That keeps the clock honest and
 * means a tab left open across 01:00 on a changeover night updates itself
 * rather than sitting on a stale offset.
 */

import { useEffect, useState } from "react";
import { zoneSummary } from "@/lib/timezone";

type Summary = ReturnType<typeof zoneSummary>;

export default function LocalTime({
  timeZone,
  place,
  showClock = true,
}: {
  /** IANA identifier — "Europe/London", "Asia/Ulaanbaatar". Never an offset. */
  timeZone: string;
  /** Human label shown before the zone detail. */
  place: string;
  /** Set false for just the offset, no running clock. */
  showClock?: boolean;
}) {
  const [zone, setZone] = useState<Summary | null>(null);

  useEffect(() => {
    const read = () => setZone(zoneSummary(timeZone));
    read();
    const id = setInterval(read, 30_000);
    return () => clearInterval(id);
  }, [timeZone]);

  return (
    <p className="contact-locale">
      {place}
      <span className="contact-zone" suppressHydrationWarning>
        {zone && (
          <>
            {" · "}
            {showClock && <>{zone.time} </>}
            {zone.offset}
            {zone.abbreviation && ` (${zone.abbreviation})`}
          </>
        )}
      </span>
    </p>
  );
}
