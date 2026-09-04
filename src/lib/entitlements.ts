import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Dedupes subscription/license lookups across pages that render for the
// same user within a single request (tools, tool detail, dashboard).
export const getUserEntitlements = cache(async (userId: string | undefined) => {
  if (!userId) return { subscription: null, license: null, isActive: false };

  const [subscription, license] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.license.findUnique({ where: { userId } }),
  ]);

  const isActive = subscription?.status === "ACTIVE" && Boolean(license?.active);

  return { subscription, license, isActive };
});

// A subscriber's active status grants access to every AVAILABLE tool;
// IN_DEVELOPMENT tools stay locked even for active subscribers.
export function hasToolAccess(
  isActive: boolean,
  tool: { enabled: boolean; status: "IN_DEVELOPMENT" | "AVAILABLE" },
) {
  return isActive && tool.enabled && tool.status === "AVAILABLE";
}
