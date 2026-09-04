import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ButtonLink } from "@/components/ui/button";
import { ToolStatusBadge } from "@/components/tool-status-badge";
import { auth } from "@/lib/auth";
import { getUserEntitlements } from "@/lib/entitlements";
import { groupToolsByCategory, listEnabledTools, stripMarkdown } from "@/lib/tools";

const DESCRIPTION = "SEO, social scheduling, campaign analytics, and ad creative tools included with your subscription.";

export const metadata: Metadata = {
  title: "Tools",
  description: DESCRIPTION,
  alternates: { canonical: "/tools" },
  openGraph: {
    url: "/tools",
    title: "Tools | Devcom Digital",
    description: DESCRIPTION,
  },
};

export default async function ToolsPage() {
  const session = await auth();

  const [{ isActive }, tools] = await Promise.all([
    getUserEntitlements(session?.user?.id),
    listEnabledTools(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
            Tools suite
          </h1>
          {session?.user?.email ? (
            <p className="mt-1 text-sm text-paper-dim">
              Licensed to {session.user.email}
            </p>
          ) : (
            <p className="mt-1 text-sm text-paper-dim">
              Browse the tools below. Log in with an active subscription to
              download.
            </p>
          )}
          {!isActive && (
            <div className="mt-6 flex flex-wrap items-center gap-3 border border-hairline bg-ink-raised px-4 py-3 text-sm text-paper-dim">
              <span>
                {session?.user?.id
                  ? "A subscription is required to download tools."
                  : "Log in and subscribe to download tools."}
              </span>
              <ButtonLink
                href={session?.user?.id ? "/pricing" : "/login"}
                size="sm"
              >
                {session?.user?.id ? "Subscribe" : "Log in"}
              </ButtonLink>
            </div>
          )}
          {tools.length === 0 ? (
            <p className="mt-10 border-t border-hairline pt-8 text-sm text-paper-dim">
              No tools are available yet. Check back soon.
            </p>
          ) : (
            <div className="mt-8 space-y-12">
              {groupToolsByCategory(tools).map(({ category, label, tools: groupTools }, sectionIndex) => (
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
                            <div className="relative -mt-6 -mx-6 mb-1 h-32 w-[calc(100%+3rem)] border-b border-hairline bg-ink">
                              <Image
                                src={tool.imageUrl}
                                alt=""
                                fill
                                sizes="(min-width: 640px) 50vw, 100vw"
                                loading={sectionIndex === 0 && i === 0 ? "eager" : "lazy"}
                                priority={sectionIndex === 0 && i === 0}
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-mono text-xs text-gold-dim">
                              No. {(i + 1).toString().padStart(2, "0")}
                            </span>
                            <div className="flex shrink-0 items-center gap-2">
                              {tool.featured && (
                                <span className="rounded-sm border border-gold/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-bright">
                                  Featured
                                </span>
                              )}
                              <ToolStatusBadge status={tool.status} />
                            </div>
                          </div>
                          <h3 className="font-display text-xl font-bold tracking-tight text-paper group-hover:text-gold-bright">
                            {tool.name}
                            {tool.version && (
                              <span className="ml-2 font-mono text-xs font-normal text-paper-dim">
                                {tool.version}
                              </span>
                            )}
                          </h3>
                          <p className="line-clamp-2 text-sm text-paper-dim">
                            {tool.tagline || stripMarkdown(tool.desc)}
                          </p>
                          {tool.tags.length > 0 && (
                            <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
                              {tool.tags.map((tag) => (
                                <li
                                  key={tag}
                                  className="rounded-sm border border-hairline px-1.5 py-0.5 text-[10px] text-paper-dim"
                                >
                                  {tag}
                                </li>
                              ))}
                            </ul>
                          )}
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
