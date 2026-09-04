import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paypal";
import { issueLicenseForUser, revokeLicenseForUser } from "@/lib/license";
import { sendSubscriptionReceiptEmail, sendPaymentReceivedEmail } from "@/lib/mail";

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

  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    return handlePaymentCaptured(resource);
  }

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
    const license = await issueLicenseForUser(subscription.userId);
    const user = await prisma.user.findUnique({
      where: { id: subscription.userId },
    });
    if (user) {
      try {
        await sendSubscriptionReceiptEmail(
          user.email,
          user.name ?? "there",
          license.key
        );
      } catch (err) {
        console.error("Failed to send subscription receipt email", err);
      }
    }
  } else if (eventType in INACTIVE_EVENTS) {
    await prisma.subscription.update({
      where: { paypalSubscriptionId },
      data: { status: INACTIVE_EVENTS[eventType] },
    });
    await revokeLicenseForUser(subscription.userId);
  }

  return NextResponse.json({ ok: true });
}

async function handlePaymentCaptured(resource: Record<string, unknown>) {
  const orderId = (resource?.supplementary_data as Record<string, unknown> | undefined)
    ?.related_ids as Record<string, unknown> | undefined;
  const paypalOrderId = orderId?.order_id as string | undefined;

  if (!paypalOrderId) {
    return NextResponse.json({ ok: true });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { paypalOrderId },
    include: { quoteRequest: { include: { user: { select: { email: true, name: true } } } } },
  });
  if (!invoice) {
    return NextResponse.json({ ok: true });
  }

  const isDepositOnly = Boolean(invoice.depositAmount) && !invoice.depositPaid;

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: isDepositOnly
      ? { depositPaid: true, status: "PARTIALLY_PAID" }
      : { balancePaid: true, status: "PAID", paidAt: new Date() },
  });

  const paidAmount = isDepositOnly ? invoice.depositAmount! : invoice.totalAmount - (invoice.depositAmount ?? 0);

  try {
    await sendPaymentReceivedEmail(
      invoice.quoteRequest.user.email,
      invoice.quoteRequest.user.name ?? "there",
      `$${(paidAmount / 100).toFixed(2)}`,
    );
  } catch (err) {
    console.error("Failed to send payment received email", err);
  }

  return NextResponse.json({ ok: true });
}
