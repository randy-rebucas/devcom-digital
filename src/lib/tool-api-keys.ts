import { randomBytes, createHash, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const KEY_PREFIX = "devcom_tk_";

function hashKey(rawKey: string) {
  return createHash("sha256").update(rawKey).digest("hex");
}

/** Generates a new raw API key. Only returned to the caller once — never stored. */
function generateRawKey() {
  return `${KEY_PREFIX}${randomBytes(24).toString("base64url")}`;
}

export async function createToolApiKey(toolId: string, name?: string) {
  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, KEY_PREFIX.length + 6);

  const record = await prisma.toolApiKey.create({
    data: { toolId, name: name || null, keyHash, keyPrefix },
  });

  // rawKey is shown to the admin exactly once at creation time.
  return { record, rawKey };
}

export async function revokeToolApiKey(id: string) {
  return prisma.toolApiKey.update({
    where: { id },
    data: { active: false, revokedAt: new Date() },
  });
}

export async function listToolApiKeys(toolId: string) {
  return prisma.toolApiKey.findMany({
    where: { toolId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Looks up the tool an API key belongs to, verifying it in constant time.
 * Returns null if the key is unknown, malformed, or revoked.
 */
export async function findToolByApiKey(rawKey: string) {
  if (!rawKey || !rawKey.startsWith(KEY_PREFIX)) return null;

  const keyHash = hashKey(rawKey);
  const apiKey = await prisma.toolApiKey.findUnique({
    where: { keyHash },
    include: { tool: true },
  });
  if (!apiKey || !apiKey.active) return null;

  // Defense in depth: the DB lookup is already exact-match on the hash,
  // but compare in constant time to avoid timing side channels.
  const a = Buffer.from(apiKey.keyHash);
  const b = Buffer.from(keyHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  await prisma.toolApiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey.tool;
}
