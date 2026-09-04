import { prisma } from "@/lib/prisma";

function resolvePeriodStart(subscriptionPeriodStart: Date | null, now: Date): Date {
  if (!subscriptionPeriodStart) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
  // Find the most recent monthly boundary, counting from the subscription's
  // period start, that is still at or before `now`.
  let period = new Date(subscriptionPeriodStart);
  for (;;) {
    const next = new Date(period);
    next.setUTCMonth(next.getUTCMonth() + 1);
    if (next.getTime() > now.getTime()) break;
    period = next;
  }
  return period;
}

export async function checkAndIncrementUsage(
  userId: string,
  toolId: string,
): Promise<{ allowed: boolean; remaining: number | null }> {
  const tool = await prisma.tool.findUnique({ where: { id: toolId }, select: { usageQuota: true } });
  if (!tool || tool.usageQuota == null) {
    return { allowed: true, remaining: null };
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const now = new Date();
  const periodStart = resolvePeriodStart(subscription?.currentPeriodStart ?? null, now);

  const usage = await prisma.toolUsage.findUnique({
    where: { userId_toolId_periodStart: { userId, toolId, periodStart } },
  });

  if (usage && usage.count >= tool.usageQuota) {
    return { allowed: false, remaining: 0 };
  }

  const updated = await prisma.toolUsage.upsert({
    where: { userId_toolId_periodStart: { userId, toolId, periodStart } },
    create: { userId, toolId, periodStart, count: 1 },
    update: { count: { increment: 1 } },
  });

  return { allowed: true, remaining: Math.max(0, tool.usageQuota - updated.count) };
}
