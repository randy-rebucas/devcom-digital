import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_REGENERATIONS } from "@/lib/ai/rate-limit";
import { DecisionButtons } from "./decision-buttons";
import { RegenerateForm } from "./regenerate-form";
import { CommentThread } from "./comment-thread";
import { ProtectedText } from "@/components/ui/protected-text";

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

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const request = await prisma.quoteRequest.findFirst({
    where: { id, userId: session.user.id },
    include: {
      comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
      deliverables: { orderBy: { createdAt: "desc" } },
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
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link href="/requests" className="text-sm text-paper-dim hover:text-gold-bright">
            ← Back to requests
          </Link>

          <div className="mt-4 flex items-center justify-between gap-4">
            <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
              {request.title}
            </h1>
            <StatusIndicator lit={STATUS_LIT[request.status]} label={STATUS_LABELS[request.status]} />
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm text-paper-dim">{request.description}</p>

          <div className="mt-10 border-t border-hairline">
            {request.status === "PENDING" && (
              <p className="border-b border-hairline py-6 text-sm text-paper-dim">
                The AI is drafting your quotation. Refresh in a moment.
              </p>
            )}

            {request.status === "FAILED" && (
              <div className="border-b border-hairline py-6">
                <p className="text-sm text-red-400">
                  {request.errorMessage ?? "Something went wrong generating your quotation."}
                </p>
              </div>
            )}

            {(request.status === "QUOTED" || request.status === "ACCEPTED" || request.status === "DECLINED") && (
              <>
                <section className="border-b border-hairline py-6">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                    Summary
                  </h2>
                  <p className="mt-3 text-sm text-paper">{request.quoteSummary}</p>
                </section>

                <section className="border-b border-hairline py-6">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                    Scope
                  </h2>
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

                <section className="border-b border-hairline py-6">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                    Timeline &amp; price
                  </h2>
                  <p className="mt-3 text-sm text-paper">{request.quoteTimeline}</p>
                  <ProtectedText className="mt-1 block font-display text-lg font-bold text-gold-bright">
                    {request.quoteEstimate}
                  </ProtectedText>
                </section>

                <section className="border-b border-hairline py-6">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                    Assumptions
                  </h2>
                  <ul className="mt-3 list-inside list-disc text-sm text-paper-dim">
                    {assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </section>

                {request.status === "QUOTED" && (
                  <section className="py-6">
                    <DecisionButtons id={request.id} />
                    {request.regenerationCount < MAX_REGENERATIONS ? (
                      <RegenerateForm id={request.id} />
                    ) : (
                      <p className="mt-6 border-t border-hairline pt-6 text-sm text-paper-dim">
                        You&apos;ve used all {MAX_REGENERATIONS} revisions for this request. Start
                        a new request if you&apos;d like a different quotation.
                      </p>
                    )}
                  </section>
                )}
              </>
            )}

            {request.deliverables.length > 0 && (
              <section className="border-b border-hairline py-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                  Deliverables
                </h2>
                <ul className="mt-3 space-y-2">
                  {request.deliverables.map((file) => (
                    <li key={file.id}>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gold underline"
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <CommentThread id={request.id} comments={request.comments} />
          </div>
        </div>
      </main>
    </>
  );
}
