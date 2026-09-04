import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Modal } from "@/components/modal";
import { ButtonLink } from "@/components/ui/button";
import { ToolDownloadLink } from "@/components/tool-download-link";
import { ToolStatusBadge } from "@/components/tool-status-badge";
import { auth } from "@/lib/auth";
import { getUserEntitlements } from "@/lib/entitlements";
import { getEnabledToolBySlug } from "@/lib/tools";

export default async function ToolModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = await getEnabledToolBySlug(slug);
  if (!tool) notFound();

  const session = await auth();
  const { isActive } = await getUserEntitlements(session?.user?.id);

  return (
    <Modal>
      <div className="max-h-[85vh] overflow-y-auto p-6">
        {tool.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.imageUrl}
            alt={tool.name}
            className="-mt-6 -mx-6 mb-1 h-auto w-[calc(100%+3rem)] border-b border-hairline bg-ink-raised"
          />
        )}
        <div className="mt-4 flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tight text-paper">
            {tool.name}
            {tool.version && (
              <span className="ml-2 font-mono text-xs font-normal text-paper-dim">
                {tool.version}
              </span>
            )}
          </h2>
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

        {tool.requiresLicenseKey && (
          <div className="mt-6 rounded-sm border border-gold-dim bg-ink-raised p-4 text-sm text-paper-dim">
            This tool requires a valid license key to activate. Your license
            key is issued with your active subscription.
          </div>
        )}

        {(tool.downloadUrl || !isActive) && (
          <div className="mt-6 border-t border-hairline pt-5">
            {!isActive ? (
              <div className="flex flex-wrap items-center gap-3">
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
          </div>
        )}

        <a
          href={`/tools/${tool.slug}`}
          className="mt-6 inline-block text-xs text-paper-dim underline transition-colors hover:text-gold-bright"
        >
          View full page →
        </a>
      </div>
    </Modal>
  );
}
