import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from "@/lib/ai/rate-limit";
import { QuoteRequestForm } from "./quote-request-form";

export default async function NewRequestPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [tools, projects] = await Promise.all([
    prisma.tool.findMany({ where: { enabled: true }, select: { id: true, name: true }, orderBy: { order: "asc" } }),
    prisma.project.findMany({ where: { enabled: true }, select: { id: true, name: true }, orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link href="/requests" className="text-sm text-paper-dim hover:text-gold-bright">
            ← Back to requests
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-paper">
            Request a quote
          </h1>
          <p className="mt-1 text-sm text-paper-dim">
            Our AI, acting as a senior full-stack engineer, will draft a detailed quotation —
            scope, timeline, and price — for you to review.
          </p>
          <QuoteRequestForm
            tools={tools}
            projects={projects}
            maxTitleLength={MAX_TITLE_LENGTH}
            maxDescriptionLength={MAX_DESCRIPTION_LENGTH}
          />
        </div>
      </main>
    </>
  );
}
