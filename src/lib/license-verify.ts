import { prisma } from "@/lib/prisma";

export type LicenseVerifyResult =
  | { valid: true; status: "ACTIVE"; userId: string }
  | { valid: false; reason: "not_found" | "revoked" | "subscription_inactive" };

/**
 * Single source of truth for "is this license key currently entitled to
 * use the suite". Shared by the public verify endpoint; the in-app
 * download route still has its own inline check for now (left alone
 * deliberately — see docs/license-sdk-plan.md phase 1 notes).
 */
export async function verifyLicenseKey(key: string): Promise<LicenseVerifyResult> {
  const license = await prisma.license.findUnique({
    where: { key },
    include: { user: { include: { subscription: true } } },
  });

  if (!license) return { valid: false, reason: "not_found" };
  if (!license.active) return { valid: false, reason: "revoked" };
  if (license.user.subscription?.status !== "ACTIVE") {
    return { valid: false, reason: "subscription_inactive" };
  }

  return { valid: true, status: "ACTIVE", userId: license.userId };
}
