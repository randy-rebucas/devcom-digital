import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TOOLS = [
  { name: "SEO & Keyword Toolkit", desc: "Rank tracking and on-page audits." },
  { name: "Social Content Scheduler", desc: "Cross-platform post planning." },
  { name: "Campaign Analytics", desc: "Unified ad spend and ROI dashboards." },
  { name: "Ad Creative Generator", desc: "On-brand copy and creative drafts." },
];

export default async function ToolsPage() {
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
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold">Tools suite</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Licensed to {session.user.email}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <div
                key={tool.name}
                className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
              >
                <h2 className="font-medium">{tool.name}</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {tool.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
