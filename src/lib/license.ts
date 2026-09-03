import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

function randomSegment(length: number) {
  return randomBytes(length)
    .toString("base64url")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .slice(0, length);
}

export function generateLicenseKey() {
  const segments = Array.from({ length: 4 }, () => randomSegment(4));
  return `DEVCOM-${segments.join("-")}`;
}

export async function issueLicenseForUser(userId: string) {
  const existing = await prisma.license.findUnique({ where: { userId } });
  if (existing) {
    return prisma.license.update({
      where: { userId },
      data: { active: true, revokedAt: null },
    });
  }

  let key = generateLicenseKey();
  // Guard against the astronomically unlikely collision.
  while (await prisma.license.findUnique({ where: { key } })) {
    key = generateLicenseKey();
  }

  return prisma.license.create({
    data: { userId, key, active: true },
  });
}

export async function revokeLicenseForUser(userId: string) {
  const existing = await prisma.license.findUnique({ where: { userId } });
  if (!existing) return null;
  return prisma.license.update({
    where: { userId },
    data: { active: false, revokedAt: new Date() },
  });
}
