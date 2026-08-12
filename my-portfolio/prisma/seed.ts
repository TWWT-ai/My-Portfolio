import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.skill.createMany({
    data: [
      { name: "TypeScript", category: "FRONTEND", yearsUsed: 2, order: 1 },
      { name: "Next.js", category: "FRONTEND", yearsUsed: 1.5, order: 2 },
      { name: "PostgreSQL", category: "DATABASE", yearsUsed: 1, order: 3 },
    ],
  });

  await prisma.project.create({
    data: {
      slug: "my-first-project",
      title: "My First Project",
      summary: "One-line pitch of what it does and for whom.",
      caseStudy: "## Problem\n...\n## Approach\n...\n## Result\n...",
      repoUrl: "https://github.com/you/project",
      featured: true,
      status: "PUBLISHED",
      tags: {
        connectOrCreate: [
          { where: { name: "Next.js" }, create: { name: "Next.js", category: "FRONTEND" } },
        ],
      },
    },
  });
}

main().finally(() => prisma.$disconnect());