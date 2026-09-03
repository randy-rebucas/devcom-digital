import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ButtonLink } from "@/components/ui/button";
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
            Your dashboard
          </h1>

          <div className="mt-10 border-t border-hairline">
            <section className="border-b border-hairline py-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                Subscription
              </h2>
              {subscription ? (
                <div className="mt-3">
                  <StatusIndicator lit={Boolean(isActive)} label={subscription.status} />
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm text-paper-dim">
                    You don&apos;t have an active subscription yet.
                  </p>
                  <ButtonLink href="/pricing" size="sm" className="mt-4">
                    View plans
                  </ButtonLink>
                </>
              )}
            </section>

            <section className="border-b border-hairline py-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                License key
              </h2>
              {license && isActive ? (
                <>
                  <p className="mt-3 select-all border border-hairline bg-ink-raised px-3 py-2 font-mono text-sm tabular-nums text-gold-bright">
                    {license.key}
                  </p>
                  <p className="mt-2 text-xs text-paper-dim">
                    Keep this key private &mdash; it unlocks the digital tools
                    suite for your account.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-paper-dim">
                  A license key is issued automatically once your subscription
                  is active.
                </p>
              )}
            </section>

            <section className="border-b border-hairline py-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                Tools
              </h2>
              <div className="mt-3">
                <StatusIndicator
                  lit={Boolean(isActive)}
                  label={
                    isActive
                      ? "License active — tools suite unlocked"
                      : "Unlock the tools suite by subscribing"
                  }
                />
              </div>
              <ButtonLink href="/tools" variant="secondary" size="sm" className="mt-4">
                Go to tools
              </ButtonLink>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
