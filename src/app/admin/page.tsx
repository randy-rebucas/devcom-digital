import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const session = await auth();

  const [toolCount, projectCount, userCount, adminCount, requestCount] = await Promise.all([
    prisma.tool.count(),
    prisma.project.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.quoteRequest.count(),
  ]);

  const cards = [
    { href: "/admin/tools", label: "Tools", value: toolCount, desc: "Manage the tools suite" },
    { href: "/admin/projects", label: "Projects", value: projectCount, desc: "Manage the projects section" },
    { href: "/admin/requests", label: "Requests", value: requestCount, desc: "Member quote requests" },
    { href: "/admin/users", label: "Users", value: userCount, desc: `${adminCount} admin${adminCount === 1 ? "" : "s"}` },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
        Admin
      </h1>
      <p className="mt-1 text-sm text-paper-dim">
        Signed in as {session!.user.email}
      </p>

      <div className="mt-8 grid grid-cols-1 border-l border-t border-hairline sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border-b border-r border-hairline p-5 transition-colors hover:bg-ink-raised"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                {card.label}
              </h2>
              <span className="font-mono text-2xl font-bold tabular-nums text-paper">
                {card.value}
              </span>
            </div>
            <p className="mt-2 text-sm text-paper-dim">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
