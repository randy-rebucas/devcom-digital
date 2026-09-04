import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { SubscriptionRequired } from "@/components/subscription-required";
import { ToolStatusBadge } from "@/components/tool-status-badge";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupToolsByCategory, listEnabledTools, stripMarkdown } from "@/lib/tools";

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
        <SubscriptionRequired />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
            Tools suite
          </h1>
          <p className="mt-1 text-sm text-paper-dim">
            Licensed to {session.user.email}
          </p>
          {tools.length === 0 ? (
            <p className="mt-10 border-t border-hairline pt-8 text-sm text-paper-dim">
              No tools are available yet. Check back soon.
            </p>
          ) : (
            <div className="mt-8 space-y-12">
              {groupToolsByCategory(tools).map(({ category, label, tools: groupTools }) => (
                <section key={category}>
                  <h2 className="font-display text-lg font-bold tracking-tight text-paper">
                    {label}
                  </h2>
                  <ul className="mt-4 grid grid-cols-1 border-l border-t border-hairline sm:grid-cols-2">
                    {groupTools.map((tool, i) => (
                      <li key={tool.slug} className="border-b border-r border-hairline">
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-ink-raised"
                        >
                          {tool.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={tool.imageUrl}
                              alt=""
                              loading="lazy"
                              className="-mt-6 -mx-6 mb-1 h-32 w-[calc(100%+3rem)] border-b border-hairline bg-ink object-cover"
                            />
                          )}
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-mono text-xs text-gold-dim">
                              No. {(i + 1).toString().padStart(2, "0")}
                            </span>
                            <ToolStatusBadge status={tool.status} className="shrink-0" />
                          </div>
                          <h3 className="font-display text-xl font-bold tracking-tight text-paper group-hover:text-gold-bright">
                            {tool.name}
                          </h3>
                          <p className="line-clamp-2 text-sm text-paper-dim">
                            {stripMarkdown(tool.desc)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
