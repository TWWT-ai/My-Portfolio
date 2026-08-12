import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 3600; // ISR: rebuild at most hourly

export default async function Home() {
  const featured = await prisma.project.findMany({
    where: { featured: true, status: "PUBLISHED" },
    include: { tags: true },
    take: 3,
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-5xl font-bold">Hi, I&apos;m ScrewDriver</h1>
      <p className="mt-4 text-xl text-gray-600">
        Projects
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="rounded bg-black px-6 py-3 text-white">
          Back to Home
        </Link>
        <Link href="/about" className="rounded bg-black px-6 py-3 text-white">
          About Me
        </Link>
        <Link href="/contact" className="rounded border px-6 py-3">
          Contact Me
        </Link>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {featured.map((p) => (
          <Link key={p.id} href={`/projects/${p.slug}`} className="rounded-lg border p-5 hover:shadow-md">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{p.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}