import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [subscription, license] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.license.findUnique({ where: { userId: session.user.id } }),
  ]);

  const isActive = subscription?.status === "ACTIVE" && license?.active;

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold">Your dashboard</h1>

          <section className="mt-8 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
            <h2 className="font-medium">Subscription</h2>
            {subscription ? (
              <p className="mt-2 text-sm">
                Status:{" "}
                <span
                  className={
                    isActive
                      ? "font-medium text-green-600"
                      : "font-medium text-amber-600"
                  }
                >
                  {subscription.status}
                </span>
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  You don&apos;t have an active subscription yet.
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  View plans
                </Link>
              </>
            )}
          </section>

          <section className="mt-6 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
            <h2 className="font-medium">License key</h2>
            {license && isActive ? (
              <>
                <p className="mt-2 select-all rounded-md bg-neutral-100 px-3 py-2 font-mono text-sm dark:bg-neutral-900">
                  {license.key}
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Keep this key private &mdash; it unlocks the digital tools
                  suite for your account.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                A license key is issued automatically once your subscription
                is active.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
            <h2 className="font-medium">Tools</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {isActive
                ? "Your license is active. Access the tools suite below."
                : "Unlock the tools suite by subscribing."}
            </p>
            <Link
              href="/tools"
              className="mt-4 inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-indigo-600 hover:text-indigo-600 dark:border-neutral-700"
            >
              Go to tools
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
