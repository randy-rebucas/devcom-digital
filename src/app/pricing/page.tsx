import { Navbar } from "@/components/navbar";
import { PaypalSubscribeButton } from "@/components/paypal-subscribe-button";
import { auth } from "@/lib/auth";

export default async function PricingPage() {
  const session = await auth();
  const planId = process.env.PAYPAL_PLAN_ID ?? "";
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  const notConfigured = !planId || !clientId;

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-20">
        <div className="mx-auto max-w-md">
          <h1 className="text-center text-3xl font-semibold">Pro Toolkit</h1>
          <p className="mt-2 text-center text-neutral-600 dark:text-neutral-400">
            Full access to every tool in the Devcom Digital suite.
          </p>

          <div className="mt-10 rounded-xl border border-neutral-200 p-8 dark:border-neutral-800">
            <p className="text-4xl font-bold">
              $29<span className="text-base font-normal text-neutral-500">/mo</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>✓ Full digital tools suite</li>
              <li>✓ Personal license key</li>
              <li>✓ Cancel anytime via PayPal</li>
            </ul>
            <div className="mt-8">
              {notConfigured ? (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  PayPal is not configured yet. Set PAYPAL_PLAN_ID and
                  NEXT_PUBLIC_PAYPAL_CLIENT_ID in your environment.
                </p>
              ) : (
                <PaypalSubscribeButton
                  planId={planId}
                  clientId={clientId}
                  isLoggedIn={Boolean(session?.user)}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
