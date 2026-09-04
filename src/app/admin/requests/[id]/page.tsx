import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { prisma } from "@/lib/prisma";
import { PipelineControls } from "./pipeline-controls";
import { NotesPanel } from "./notes-panel";
import { AdminCommentThread } from "./admin-comment-thread";
import { DeliverableUpload } from "./deliverable-upload";
import { InvoicePanel } from "./invoice-panel";

const STATUS_LABELS = {
  PENDING: "Generating quote…",
  QUOTED: "Quote ready",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  FAILED: "Quote failed",
} as const;

const STATUS_LIT = {
  PENDING: false,
  QUOTED: true,
  ACCEPTED: true,
  DECLINED: false,
  FAILED: false,
} as const;

type ScopePhase = { phase: string; deliverables: string[]; estimateNote: string };

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      tool: { select: { name: true, slug: true } },
      project: { select: { name: true, slug: true } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
      comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
      deliverables: { orderBy: { createdAt: "desc" } },
      invoice: true,
    },
  });
  if (!request) notFound();

  const scope = Array.isArray(request.quoteScope) ? (request.quoteScope as unknown as ScopePhase[]) : [];
  const assumptions: string[] = (() => {
    if (!request.quoteRaw) return [];
    try {
      const raw = JSON.parse(request.quoteRaw);
      return Array.isArray(raw?.assumptions) ? raw.assumptions : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/requests" className="text-sm text-paper-dim hover:text-gold-bright">
        ← Back to requests
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-paper">{request.title}</h1>
        <StatusIndicator lit={STATUS_LIT[request.status]} label={STATUS_LABELS[request.status]} />
      </div>

      <p className="mt-1 text-sm text-paper-dim">
        {request.user.name ?? request.user.email} &middot; {request.user.email}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-paper-dim sm:grid-cols-4">
        <div>
          <dt className="uppercase tracking-wide">Kind</dt>
          <dd className="mt-0.5 text-paper">{request.kind}</dd>
        </div>
        {request.tool && (
          <div>
            <dt className="uppercase tracking-wide">Tool</dt>
            <dd className="mt-0.5">
              <Link href={`/tools/${request.tool.slug}`} className="text-gold underline">
                {request.tool.name}
              </Link>
            </dd>
          </div>
        )}
        {request.project && (
          <div>
            <dt className="uppercase tracking-wide">Project</dt>
            <dd className="mt-0.5">
              <Link href={`/projects/${request.project.slug}`} className="text-gold underline">
                {request.project.name}
              </Link>
            </dd>
          </div>
        )}
        <div>
          <dt className="uppercase tracking-wide">Submitted</dt>
          <dd className="mt-0.5 text-paper">{new Date(request.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Revisions</dt>
          <dd className="mt-0.5 text-paper">{request.regenerationCount}</dd>
        </div>
      </dl>

      <div className="mt-8 grid grid-cols-1 gap-x-10 lg:grid-cols-3">
        <div className="border-t border-hairline lg:col-span-2">
          <section className="border-b border-hairline py-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
              Client description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-paper">{request.description}</p>
          </section>

          {request.status === "FAILED" && request.errorMessage && (
            <section className="border-b border-hairline py-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                Quote generation error
              </h2>
              <p className="mt-3 text-sm text-red-400">{request.errorMessage}</p>
            </section>
          )}

          {request.quoteSummary && (
            <section className="border-b border-hairline py-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">Summary</h2>
              <p className="mt-3 text-sm text-paper">{request.quoteSummary}</p>
            </section>
          )}

          {scope.length > 0 && (
            <section className="border-b border-hairline py-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">Scope</h2>
              <div className="mt-3 space-y-4">
                {scope.map((phase, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-semibold text-paper">{phase.phase}</h3>
                    <ul className="mt-1 list-inside list-disc text-sm text-paper-dim">
                      {phase.deliverables.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                    {phase.estimateNote && (
                      <p className="mt-1 text-xs text-paper-dim">{phase.estimateNote}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(request.quoteTimeline || request.quoteEstimate) && (
            <section className="border-b border-hairline py-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                Timeline &amp; price
              </h2>
              {request.quoteTimeline && <p className="mt-3 text-sm text-paper">{request.quoteTimeline}</p>}
              {request.quoteEstimate && (
                <p className="mt-1 font-display text-lg font-bold text-gold-bright">{request.quoteEstimate}</p>
              )}
            </section>
          )}

          {assumptions.length > 0 && (
            <section className="border-b border-hairline py-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">Assumptions</h2>
              <ul className="mt-3 list-inside list-disc text-sm text-paper-dim">
                {assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="border-t border-hairline lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-10">
          <section className="border-b border-hairline py-6 lg:pt-0">
            <PipelineControls id={request.id} stage={request.pipelineStage} followUpAt={request.followUpAt} />
          </section>

          {request.pipelineStage === "WON" && (
            <InvoicePanel id={request.id} invoice={request.invoice} />
          )}

          <DeliverableUpload id={request.id} deliverables={request.deliverables} />
          <AdminCommentThread id={request.id} comments={request.comments} />
          <NotesPanel id={request.id} notes={request.notes} />
        </aside>
      </div>
    </div>
  );
}
