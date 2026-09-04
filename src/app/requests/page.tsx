import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ButtonLink } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { auth } from "@/lib/auth";
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

export default async function RequestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const requests = await prisma.quoteRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
              Your quote requests
            </h1>
            <ButtonLink href="/requests/new" size="sm">
              New request
            </ButtonLink>
          </div>

          {requests.length === 0 ? (
            <p className="mt-10 border-t border-hairline pt-8 text-sm text-paper-dim">
              You haven&apos;t requested a quote yet. Tell us about a tool or project idea and
              our AI will draft a detailed estimate.
            </p>
          ) : (
            <ul className="mt-8 border-t border-hairline">
              {requests.map((request) => (
                <li key={request.id} className="border-b border-hairline py-4">
                  <Link
                    href={`/requests/${request.id}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h2 className="truncate font-medium text-paper">{request.title}</h2>
                      <p className="mt-1 text-xs uppercase tracking-wide text-paper-dim">
                        {request.kind}
                      </p>
                    </div>
                    <StatusIndicator
                      lit={STATUS_LIT[request.status]}
                      label={STATUS_LABELS[request.status]}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
