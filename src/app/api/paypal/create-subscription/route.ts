import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionDetails } from "@/lib/paypal";
import { issueLicenseForUser } from "@/lib/license";

const schema = z.object({
  subscriptionId: z.string().min(1),
});

// Called by the client right after the PayPal button reports approval.
// The webhook is the source of truth for lifecycle changes; this just
// links the subscription to the account and reflects its current state.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const details = await getSubscriptionDetails(parsed.data.subscriptionId);

  const status = String(details.status ?? "PENDING").toUpperCase();
  const mappedStatus =
    status === "ACTIVE"
      ? "ACTIVE"
      : status === "CANCELLED"
        ? "CANCELLED"
        : status === "SUSPENDED"
          ? "SUSPENDED"
          : status === "EXPIRED"
            ? "EXPIRED"
            : "PENDING";

  const subscription = await prisma.subscription.upsert({
    where: { paypalSubscriptionId: details.id },
    create: {
      userId: session.user.id,
      paypalSubscriptionId: details.id,
      paypalPlanId: details.plan_id,
      status: mappedStatus,
      currentPeriodStart: details.start_time
        ? new Date(details.start_time)
        : undefined,
    },
    update: {
      status: mappedStatus,
    },
  });

  if (mappedStatus === "ACTIVE") {
    await issueLicenseForUser(session.user.id);
  }

  return NextResponse.json({ ok: true, status: subscription.status });
}
