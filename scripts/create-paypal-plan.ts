/**
 * One-off setup script: creates a PayPal Product + monthly billing Plan
 * in whichever environment PAYPAL_ENV points to, and prints the plan_id
 * to put in PAYPAL_PLAN_ID.
 *
 * Usage: npx tsx scripts/create-paypal-plan.ts
 */
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../.env.local") });

const PAYPAL_API =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not set");
  }
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

async function paypalFetch(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${PAYPAL_API}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `${path}-${Date.now()}`,
    },
  });
  return res;
}

async function main() {
  const token = await getAccessToken();
  console.log(`Using PayPal API: ${PAYPAL_API}`);

  const productRes = await paypalFetch(token, "/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({
      name: "Devcom Digital Pro Toolkit",
      description: "Full access to the Devcom Digital tools suite.",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });

  if (!productRes.ok) {
    throw new Error(
      `Failed to create product: ${productRes.status} ${await productRes.text()}`
    );
  }
  const product = await productRes.json();
  console.log(`Created product: ${product.id}`);

  const planRes = await paypalFetch(token, "/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: product.id,
      name: "Pro Toolkit Monthly",
      description: "Monthly subscription to the Devcom Digital Pro Toolkit.",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: "29.00", currency_code: "USD" },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });

  if (!planRes.ok) {
    throw new Error(
      `Failed to create plan: ${planRes.status} ${await planRes.text()}`
    );
  }
  const plan = await planRes.json();
  console.log(`Created plan: ${plan.id} (status: ${plan.status})`);
  console.log(`\nSet this in your .env.local:\nPAYPAL_PLAN_ID="${plan.id}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
