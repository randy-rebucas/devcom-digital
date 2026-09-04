import Link from "next/link";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { subscription: true },
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
          const subActive = user.subscription?.status === "ACTIVE";

          return (
            <li key={user.id} className="border-b border-hairline">
              <Link
                href={`/admin/users/${user.id}`}
                className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-ink-raised"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-paper">{user.name ?? user.email}</p>
                  <p className="truncate text-sm text-paper-dim">{user.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="rounded-sm border border-hairline px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-paper-dim">
                    {user.role}
                  </span>
                  <StatusIndicator
                    lit={subActive}
                    label={user.subscription ? user.subscription.status : "No subscription"}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
