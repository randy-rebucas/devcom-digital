import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEnabledToolBySlug, TOOL_STATUS_LABELS } from "@/lib/tools";
import type { ToolStatus } from "@prisma/client";

const STATUS_STYLES: Record<ToolStatus, string> = {
  IN_DEVELOPMENT: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  AVAILABLE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = await getEnabledToolBySlug(slug);
  if (!tool) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [subscription, license] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.license.findUnique({ where: { userId: session.user.id } }),
  ]);

  const isActive = subscription?.status === "ACTIVE" && license?.active;

  if (!isActive) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6 py-20">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold">Subscription required</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              A valid license key is needed to access the tools suite.
            </p>
            <Link
              href="/pricing"
              className="mt-6 inline-block rounded-md bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
            >
              Subscribe now
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/tools"
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            ← Back to tools
          </Link>

          {tool.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tool.imageUrl}
              alt={tool.name}
              className="mt-4 h-56 w-full rounded-lg object-cover"
            />
          )}

          <div className="mt-4 flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold">{tool.name}</h1>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[tool.status]}`}
            >
              {TOOL_STATUS_LABELS[tool.status]}
            </span>
          </div>
          <div className="mt-2 space-y-3 text-sm leading-relaxed text-neutral-600 [&_a]:text-indigo-600 [&_a]:underline [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-neutral-900 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-neutral-900 dark:text-neutral-400 dark:[&_code]:bg-neutral-800 dark:[&_h1]:text-neutral-100 dark:[&_h2]:text-neutral-100 dark:[&_strong]:text-neutral-100">
            <ReactMarkdown>{tool.desc}</ReactMarkdown>
          </div>

          {tool.requiresLicenseKey && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
              This tool requires a valid license key to activate. Your license
              key is issued with your active subscription.
            </div>
          )}

          <div className="mt-8 space-y-4">
            <div className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
              <h2 className="font-medium">Download</h2>
              {tool.downloadUrl ? (
                <a
                  href={tool.downloadUrl}
                  className="mt-2 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Download tool
                </a>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">
                  A download link will be available once this tool ships.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
              <h2 className="font-medium">Guide</h2>
              {tool.guideUrl ? (
                <a
                  href={tool.guideUrl}
                  className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Read the setup guide →
                </a>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">
                  Setup guide coming soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
