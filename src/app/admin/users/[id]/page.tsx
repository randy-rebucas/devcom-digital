import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { updateUserRole } from "../actions";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: true,
      license: true,
      toolDownloads: { include: { tool: true }, orderBy: { lastDownloadedAt: "desc" } },
      quoteRequests: { orderBy: { createdAt: "desc" }, select: { id: true, title: true, status: true, pipelineStage: true } },
    },
  });
  if (!user) notFound();

  const totalDownloads = user.toolDownloads.reduce((sum, d) => sum + d.count, 0);
  const subActive = user.subscription?.status === "ACTIVE";
  const isSelf = user.id === session!.user.id;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/users" className="text-sm text-paper-dim hover:text-gold-bright">
        ← Back to users
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold tracking-tight text-paper">
            {user.name ?? user.email}
          </h1>
          <p className="mt-1 text-sm text-paper-dim">{user.email}</p>
        </div>
        <form
          action={async (formData) => {
            "use server";
            const role = formData.get("role") as "ADMIN" | "MEMBER";
            await updateUserRole(user.id, role);
          }}
          className="flex shrink-0 items-center gap-2"
        >
          <Select name="role" defaultValue={user.role} disabled={isSelf} containerClassName="w-32">
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <Button type="submit" size="sm" disabled={isSelf}>
            Save
          </Button>
        </form>
      </div>

      <div className="mt-8 border-t border-hairline">
        <section className="border-b border-hairline py-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">Account</h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <StatusIndicator
              lit={subActive}
              label={user.subscription ? `Subscription: ${user.subscription.status}` : "No subscription"}
            />
            {user.license && (
              <StatusIndicator
                lit={user.license.active}
                label={user.license.active ? `License: ${user.license.key}` : "License revoked"}
              />
            )}
          </div>
          {user.lastLoginAt && (
            <p className="mt-2 text-xs text-paper-dim">
              Last login: {user.lastLoginAt.toLocaleString()}
              {user.lastLoginIp ? ` from ${user.lastLoginIp}` : ""}
            </p>
          )}
          <p className="mt-1 text-xs text-paper-dim">Joined {user.createdAt.toLocaleDateString()}</p>
        </section>

        <section className="border-b border-hairline py-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
            Downloads <span className="font-mono tabular-nums text-paper">{totalDownloads}</span>
          </h2>
          {user.toolDownloads.length === 0 ? (
            <p className="mt-2 text-sm text-paper-dim">No downloads yet</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {user.toolDownloads.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 text-sm text-paper-dim">
                  <span className="truncate">{d.tool.name}</span>
                  <span className="shrink-0 font-mono tabular-nums text-xs">
                    {d.count}× · {d.lastDownloadedAt.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="py-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
            Quote requests <span className="font-mono tabular-nums text-paper">{user.quoteRequests.length}</span>
          </h2>
          {user.quoteRequests.length === 0 ? (
            <p className="mt-2 text-sm text-paper-dim">No requests yet</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {user.quoteRequests.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/admin/requests/${r.id}`}
                    className="flex items-center justify-between gap-4 text-sm text-paper-dim hover:text-gold-bright"
                  >
                    <span className="truncate">{r.title}</span>
                    <span className="shrink-0 font-mono text-xs uppercase tracking-wide">
                      {r.status} · {r.pipelineStage}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
