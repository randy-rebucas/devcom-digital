import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { PaypalSubscribeButton } from "@/components/paypal-subscribe-button";
import { auth } from "@/lib/auth";
import { SITE_NAME } from "@/lib/seo";

const INCLUDED = [
  "Full digital tools suite",
  "Personal license key",
  "Cancel anytime via PayPal",
];

const DESCRIPTION =
  "One plan, $29/mo: full access to the Devcom Digital marketing tools suite with a personal license key, billed via PayPal.";

export const metadata: Metadata = {
  title: "Pricing",
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: {
    url: "/pricing",
    title: `Pricing | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Devcom Digital Pro Toolkit",
  description: DESCRIPTION,
  brand: { "@type": "Brand", name: SITE_NAME },
  offers: {
    "@type": "Offer",
    price: "29",
    priceCurrency: "USD",
    priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
    availability: "https://schema.org/InStock",
    url: "/pricing",
  },
};

export default async function PricingPage() {
  const session = await auth();
  const planId = process.env.PAYPAL_PLAN_ID ?? "";
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  const notConfigured = !planId || !clientId;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Navbar />
      <main className="flex-1 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-4xl font-bold tracking-tight text-paper">
            Pro Toolkit
          </h1>
          <p className="mt-3 text-paper-dim">
            Full access to every tool in the Devcom Digital suite.
          </p>

          <div className="mt-12 border-t border-hairline pt-8">
            <p className="font-mono text-5xl font-bold tabular-nums text-paper">
              $29<span className="text-lg font-normal text-paper-dim">/mo</span>
            </p>
            <ul className="mt-8 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-paper-dim">
                  <span className="status-dot status-dot--lit" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              {notConfigured ? (
                <p className="rounded-sm border border-hairline bg-ink-raised px-3 py-2 text-sm text-paper-dim">
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
