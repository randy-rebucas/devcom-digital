import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paypal";
import { issueLicenseForUser, revokeLicenseForUser } from "@/lib/license";

const ACTIVE_EVENTS = new Set([
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.RE-ACTIVATED",
]);

const INACTIVE_EVENTS: Record<string, "CANCELLED" | "SUSPENDED" | "EXPIRED"> = {
  "BILLING.SUBSCRIPTION.CANCELLED": "CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED": "SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED": "EXPIRED",
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  const event = JSON.parse(rawBody);

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const headers = req.headers;
  try {
    const verified = await verifyWebhookSignature({
      transmissionId: headers.get("paypal-transmission-id") ?? "",
      transmissionTime: headers.get("paypal-transmission-time") ?? "",
      certUrl: headers.get("paypal-cert-url") ?? "",
      authAlgo: headers.get("paypal-auth-algo") ?? "",
      transmissionSig: headers.get("paypal-transmission-sig") ?? "",
      webhookId,
      webhookEvent: event,
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch {
    return NextResponse.json(
      { error: "Signature verification failed" },
      { status: 400 }
    );
  }

  const eventType = event.event_type as string;
  const resource = event.resource ?? {};
  const paypalSubscriptionId = resource.id as string | undefined;

  if (!paypalSubscriptionId) {
    return NextResponse.json({ ok: true });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { paypalSubscriptionId },
  });

  if (!subscription) {
    return NextResponse.json({ ok: true });
  }

  if (ACTIVE_EVENTS.has(eventType)) {
    await prisma.subscription.update({
      where: { paypalSubscriptionId },
      data: { status: "ACTIVE" },
    });
    await issueLicenseForUser(subscription.userId);
  } else if (eventType in INACTIVE_EVENTS) {
    await prisma.subscription.update({
      where: { paypalSubscriptionId },
      data: { status: INACTIVE_EVENTS[eventType] },
    });
    await revokeLicenseForUser(subscription.userId);
  }

  return NextResponse.json({ ok: true });
}
