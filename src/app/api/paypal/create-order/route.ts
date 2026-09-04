import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/lib/paypal";
import { sendInvoiceEmail } from "@/lib/mail";

const schema = z.object({
  quoteRequestId: z.string().min(1),
  totalAmountCents: z.number().int().positive(),
  depositAmountCents: z.number().int().positive().optional(),
});

// Admin-triggered: creates (or replaces) the Invoice row for a won
// quote request and opens a PayPal order for the deposit-or-full amount.
export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { quoteRequestId, totalAmountCents, depositAmountCents } = parsed.data;

  const request = await prisma.quoteRequest.findUnique({
    where: { id: quoteRequestId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (request.pipelineStage !== "WON") {
    return NextResponse.json({ error: "Request must be marked WON before invoicing" }, { status: 400 });
  }

  const amountToCharge = depositAmountCents ?? totalAmountCents;

  const invoice = await prisma.invoice.upsert({
    where: { quoteRequestId },
    create: {
      quoteRequestId,
      totalAmount: totalAmountCents,
      depositAmount: depositAmountCents ?? null,
      status: "DRAFT",
    },
    update: {
      totalAmount: totalAmountCents,
      depositAmount: depositAmountCents ?? null,
      status: "DRAFT",
    },
  });

  const order = await createOrder({
    amountCents: amountToCharge,
    currency: invoice.currency,
    referenceId: quoteRequestId,
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { paypalOrderId: order.id, status: "SENT" },
  });

  const approveUrl = (order.links as Array<{ rel: string; href: string }> | undefined)?.find(
    (l) => l.rel === "approve",
  )?.href;

  try {
    await sendInvoiceEmail(
      request.user.email,
      request.user.name ?? "there",
      approveUrl ?? `${process.env.NEXTAUTH_URL ?? ""}/requests/${quoteRequestId}`,
      `$${(amountToCharge / 100).toFixed(2)}`,
    );
  } catch (err) {
    console.error("Failed to send invoice email", err);
  }

  return NextResponse.json({ ok: true, orderId: order.id, approveUrl });
}
