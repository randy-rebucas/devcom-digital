import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserRole } from "./actions";

export default async function AdminUsersPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      subscription: true,
      toolDownloads: {
        include: { tool: true },
        orderBy: { lastDownloadedAt: "desc" },
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin" className="text-sm text-paper-dim hover:text-gold-bright">
        ← Back to admin
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-paper">
        Users
      </h1>
      <p className="mt-1 text-sm text-paper-dim">
        {users.length} user{users.length === 1 ? "" : "s"}
      </p>

      <ul className="mt-8 border-t border-hairline">
        {users.map((user) => {
          const totalDownloads = user.toolDownloads.reduce((sum, d) => sum + d.count, 0);
          const subActive = user.subscription?.status === "ACTIVE";

          return (
            <li key={user.id} className="border-b border-hairline py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-paper">{user.name ?? user.email}</p>
                  <p className="truncate text-sm text-paper-dim">{user.email}</p>
                </div>
                <form
                  action={async (formData) => {
                    "use server";
                    const role = formData.get("role") as "ADMIN" | "MEMBER";
                    await updateUserRole(user.id, role);
                  }}
                  className="flex shrink-0 items-center gap-2"
                >
                  <Select
                    name="role"
                    defaultValue={user.role}
                    disabled={user.id === session!.user.id}
                    containerClassName="w-32"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </Select>
                  <Button type="submit" size="sm" disabled={user.id === session!.user.id}>
                    Save
                  </Button>
                </form>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                <StatusIndicator
                  lit={subActive}
                  label={
                    user.subscription
                      ? `Subscription: ${user.subscription.status}`
                      : "No subscription"
                  }
                />
                {user.lastLoginAt && (
                  <span className="text-xs text-paper-dim">
                    Last login: {user.lastLoginAt.toLocaleString()}
                    {user.lastLoginIp ? ` from ${user.lastLoginIp}` : ""}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                  Downloads{" "}
                  <span className="font-mono tabular-nums text-paper">
                    {totalDownloads}
                  </span>
                </h3>
                {user.toolDownloads.length === 0 ? (
                  <p className="mt-1.5 text-xs text-paper-dim">No downloads yet</p>
                ) : (
                  <ul className="mt-1.5 space-y-1">
                    {user.toolDownloads.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-4 text-xs text-paper-dim"
                      >
                        <span className="truncate">{d.tool.name}</span>
                        <span className="shrink-0 font-mono tabular-nums">
                          {d.count}× · {d.lastDownloadedAt.toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
