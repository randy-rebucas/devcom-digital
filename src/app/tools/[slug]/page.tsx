import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Navbar } from "@/components/navbar";
import { SubscriptionRequired } from "@/components/subscription-required";
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
        <SubscriptionRequired />
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
            </h1>
            <ToolStatusBadge status={tool.status} className="mt-1" />
          </div>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-paper-dim [&_a]:text-gold [&_a]:underline [&_code]:rounded-sm [&_code]:bg-ink [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-paper [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-paper [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-paper">
            <ReactMarkdown>{tool.desc}</ReactMarkdown>
          </div>

          {tool.requiresLicenseKey && (
            <div className="mt-6 rounded-sm border border-gold-dim bg-ink-raised p-4 text-sm text-paper-dim">
              This tool requires a valid license key to activate. Your license
              key is issued with your active subscription.
            </div>
          )}

          <div className="mt-8 border-t border-hairline">
            <section className="border-b border-hairline py-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                Download
              </h2>
              {tool.downloadUrl ? (
                <ToolDownloadLink slug={tool.slug} downloadUrl={tool.downloadUrl} />
              ) : (
                <p className="mt-3 text-sm text-paper-dim">
                  A download link will be available once this tool ships.
                </p>
              )}
            </section>

            <section className="border-b border-hairline py-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                Guide
              </h2>
              {tool.guideUrl ? (
                <a
                  href={tool.guideUrl}
                  className="mt-3 inline-block text-sm font-medium text-gold hover:text-gold-bright"
                >
                  Read the setup guide →
                </a>
              ) : (
                <p className="mt-3 text-sm text-paper-dim">
                  Setup guide coming soon.
                </p>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
