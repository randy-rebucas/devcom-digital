import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/tools");

  const [toolCount, userCount, adminCount] = await Promise.all([
    prisma.tool.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  const cards = [
    { href: "/admin/tools", label: "Tools", value: toolCount, desc: "Manage the tools suite" },
    { href: "/admin/users", label: "Users", value: userCount, desc: `${adminCount} admin${adminCount === 1 ? "" : "s"}` },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Signed in as {session!.user.email}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-lg border border-neutral-200 p-5 transition hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="font-medium">{card.label}</h2>
                  <span className="text-2xl font-semibold">{card.value}</span>
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {card.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
