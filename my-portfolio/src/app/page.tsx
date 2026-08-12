/**
 * REPLACED — the home page.
 *
 * Before: a plain scaffold page (h1 + three buttons + a "Featured Projects"
 * grid queried from Prisma).
 *
 * After: the hero design — a full-viewport split with the portrait and its
 * cursor-spotlight reveal on the right, and the headline, CTA and four
 * clickable section boxes down the left. All of that lives in `<Hero />`.
 *
 * This file stays a Server Component; `<Hero />` is the only client boundary.
 *
 * The Prisma "featured projects" query was removed because the new home page
 * has no project grid — the Projects box now sends visitors to /projects,
 * which owns that list. To bring a featured strip back, re-add:
 *
 *   const featured = await prisma.project.findMany({
 *     where: { featured: true, status: "PUBLISHED" },
 *     include: { tags: true },
 *     take: 3,
 *   });
 *
 * and make this component `async` again.
 */

import Hero from "@/components/hero";

// ISR: rebuild from the DB at most hourly. Kept from the previous version so
// the setting is already in place once this page reads content again.
export const revalidate = 3600;

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}
