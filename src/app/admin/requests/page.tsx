import Link from "next/link";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { prisma } from "@/lib/prisma";

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

export default async function AdminRequestsPage() {
  const requests = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
        Quote requests
      </h1>
      <p className="mt-1 text-sm text-paper-dim">
        {requests.length} request{requests.length === 1 ? "" : "s"}
      </p>

      {requests.length === 0 ? (
        <p className="mt-10 border-t border-hairline pt-8 text-sm text-paper-dim">
          No quote requests yet.
        </p>
      ) : (
        <ul className="mt-8 border-t border-hairline">
          {requests.map((request) => (
            <li key={request.id} className="border-b border-hairline py-4">
              <Link
                href={`/admin/requests/${request.id}`}
                className="flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h2 className="truncate font-medium text-paper">{request.title}</h2>
                  <p className="mt-1 text-sm text-paper-dim">
                    {request.user.name ?? request.user.email} &middot;{" "}
                    <span className="uppercase tracking-wide">{request.kind}</span> &middot;{" "}
                    <span className="uppercase tracking-wide text-gold-dim">{request.pipelineStage}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <StatusIndicator
                    lit={STATUS_LIT[request.status]}
                    label={STATUS_LABELS[request.status]}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
