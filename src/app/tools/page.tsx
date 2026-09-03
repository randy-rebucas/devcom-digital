import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listEnabledTools, stripMarkdown, TOOL_STATUS_LABELS } from "@/lib/tools";
import type { ToolStatus } from "@prisma/client";

const STATUS_STYLES: Record<ToolStatus, string> = {
  IN_DEVELOPMENT: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  AVAILABLE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export default async function ToolsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [subscription, license, tools] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.license.findUnique({ where: { userId: session.user.id } }),
    listEnabledTools(),
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
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold">Tools suite</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Licensed to {session.user.email}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="overflow-hidden rounded-lg border border-neutral-200 transition hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
              >
                {tool.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tool.imageUrl}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-medium">{tool.name}</h2>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[tool.status]}`}
                    >
                      {TOOL_STATUS_LABELS[tool.status]}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {stripMarkdown(tool.desc)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
