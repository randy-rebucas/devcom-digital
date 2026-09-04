const PAYPAL_API =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function paypalFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  return res;
}

export async function getSubscriptionDetails(subscriptionId: string) {
  const res = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}`);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch PayPal subscription: ${res.status} ${await res.text()}`
    );
  }
  return res.json();
}

export async function createOrder(params: {
  amountCents: number;
  currency: string;
  referenceId: string;
}) {
  const res = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referenceId,
          amount: {
            currency_code: params.currency,
            value: (params.amountCents / 100).toFixed(2),
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create PayPal order: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function captureOrder(orderId: string) {
  const res = await paypalFetch(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to capture PayPal order: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function getOrderDetails(orderId: string) {
  const res = await paypalFetch(`/v2/checkout/orders/${orderId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch PayPal order: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function verifyWebhookSignature(params: {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookId: string;
  webhookEvent: unknown;
}) {
  const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      transmission_id: params.transmissionId,
      transmission_time: params.transmissionTime,
      cert_url: params.certUrl,
      auth_algo: params.authAlgo,
      transmission_sig: params.transmissionSig,
      webhook_id: params.webhookId,
      webhook_event: params.webhookEvent,
    }),
  });

  if (!res.ok) {
    throw new Error(`Webhook verification request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
