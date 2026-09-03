import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { LicenseKeyReveal } from "@/components/license-key-reveal";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ButtonLink } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [subscription, license, user] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.license.findUnique({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastLoginAt: true, lastLoginIp: true },
    }),
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
                  <LicenseKeyReveal licenseKey={license.key} />
                  <p className="mt-2 text-xs text-paper-dim">
                    Keep this key private &mdash; sharing it, or your login,
                    lets someone else use your subscription. Logging in
                    elsewhere signs this session out automatically.
                  </p>
                  {user?.lastLoginAt && (
                    <p className="mt-2 text-xs text-paper-dim">
                      Last login: {user.lastLoginAt.toLocaleString()}
                      {user.lastLoginIp ? ` from ${user.lastLoginIp}` : ""}
                    </p>
                  )}
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
