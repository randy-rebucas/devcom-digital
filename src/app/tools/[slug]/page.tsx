import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Navbar } from "@/components/navbar";
import { ButtonLink } from "@/components/ui/button";
import { ToolDownloadLink } from "@/components/tool-download-link";
import { ToolStatusBadge } from "@/components/tool-status-badge";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEnabledToolBySlug, stripMarkdown } from "@/lib/tools";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getEnabledToolBySlug(slug);
  if (!tool) return {};

  return {
    title: tool.name,
    description: stripMarkdown(tool.desc).slice(0, 160),
  };
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = await getEnabledToolBySlug(slug);
  if (!tool) notFound();

  const session = await auth();

  const [subscription, license] = await Promise.all([
    session?.user?.id
      ? prisma.subscription.findUnique({ where: { userId: session.user.id } })
      : null,
    session?.user?.id
      ? prisma.license.findUnique({ where: { userId: session.user.id } })
      : null,
  ]);

  const isActive = subscription?.status === "ACTIVE" && license?.active;

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/tools"
            className="text-sm text-paper-dim transition-colors hover:text-gold-bright"
          >
            ← Back to tools
          </Link>

          {tool.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tool.imageUrl}
              alt={tool.name}
              loading="lazy"
              className="mt-4 h-56 w-full rounded-sm border border-hairline bg-ink-raised object-cover"
            />
          )}

          <div className="mt-6 flex items-start justify-between gap-3 border-t border-hairline pt-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
              {tool.name}
              {tool.version && (
                <span className="ml-2 font-mono text-sm font-normal text-paper-dim">
                  {tool.version}
                </span>
              )}
            </h1>
            <ToolStatusBadge status={tool.status} className="mt-1" />
          </div>
          {tool.tagline && (
            <p className="mt-1 text-sm text-gold-dim">{tool.tagline}</p>
          )}
          {tool.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
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
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-paper-dim [&_a]:text-gold [&_a]:underline [&_code]:rounded-sm [&_code]:bg-ink [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-paper [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-paper [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-paper">
            <ReactMarkdown>{tool.desc}</ReactMarkdown>
          </div>

          {tool.screenshots.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-hairline pt-6 sm:grid-cols-3">
              {tool.screenshots.map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full rounded-sm border border-hairline bg-ink-raised object-cover transition-opacity hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          )}

          {tool.requiresLicenseKey && (
            <div className="mt-6 rounded-sm border border-gold-dim bg-ink-raised p-4 text-sm text-paper-dim">
              This tool requires a valid license key to activate. Your license
              key is issued with your active subscription.
            </div>
          )}

          {(tool.downloadUrl || !isActive) && (
            <div className="mt-8 border-t border-hairline">
              <section className="border-b border-hairline py-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                  Download
                </h2>
                {!isActive ? (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p className="text-sm text-paper-dim">
                      {session?.user?.id
                        ? "Subscribe to download this tool."
                        : "Log in and subscribe to download this tool."}
                    </p>
                    <ButtonLink
                      href={session?.user?.id ? "/pricing" : "/login"}
                      size="sm"
                    >
                      {session?.user?.id ? "Subscribe" : "Log in"}
                    </ButtonLink>
                  </div>
                ) : (
                  <ToolDownloadLink slug={tool.slug} />
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
