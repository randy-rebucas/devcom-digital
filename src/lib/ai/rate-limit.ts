import { prisma } from "@/lib/prisma";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const DAILY_REQUEST_LIMIT = envInt("AI_QUOTE_DAILY_REQUEST_LIMIT", 5);
export const COOLDOWN_SECONDS = envInt("AI_QUOTE_COOLDOWN_SECONDS", 60);
export const MAX_REGENERATIONS = envInt("AI_QUOTE_MAX_REGENERATIONS", 3);
export const MAX_TITLE_LENGTH = envInt("AI_QUOTE_MAX_TITLE_LENGTH", 150);
export const MAX_DESCRIPTION_LENGTH = envInt("AI_QUOTE_MAX_DESCRIPTION_LENGTH", 4000);

export type RateLimitResult = { ok: true } | { ok: false; error: string };

// Guards the "new quote request" AI call: caps how many fresh requests (each
// one an AI generation) a member can create per rolling 24h window, plus a
// short cooldown so a double-click or refresh can't fire the model twice.
export async function checkCreateRateLimit(userId: string): Promise<RateLimitResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [recentCount, mostRecent] = await Promise.all([
    prisma.quoteRequest.count({ where: { userId, createdAt: { gte: since } } }),
    prisma.quoteRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  if (mostRecent) {
    const secondsSinceLast = (Date.now() - mostRecent.createdAt.getTime()) / 1000;
    if (secondsSinceLast < COOLDOWN_SECONDS) {
      return {
        ok: false,
        error: `Please wait ${Math.ceil(COOLDOWN_SECONDS - secondsSinceLast)}s before submitting another request.`,
      };
    }
  }

  if (recentCount >= DAILY_REQUEST_LIMIT) {
    return {
      ok: false,
      error: `You've reached the limit of ${DAILY_REQUEST_LIMIT} quote requests per day. Please try again tomorrow.`,
    };
  }

  return { ok: true };
}

// Guards the "regenerate quote" AI call on a single request: caps revisions
// per request and applies the same short cooldown.
export function checkRegenerateRateLimit(request: {
  regenerationCount: number;
  updatedAt: Date;
}): RateLimitResult {
  const secondsSinceLast = (Date.now() - request.updatedAt.getTime()) / 1000;
  if (secondsSinceLast < COOLDOWN_SECONDS) {
    return {
      ok: false,
      error: `Please wait ${Math.ceil(COOLDOWN_SECONDS - secondsSinceLast)}s before requesting another revision.`,
    };
  }

  if (request.regenerationCount >= MAX_REGENERATIONS) {
    return {
      ok: false,
      error: `This request has reached the limit of ${MAX_REGENERATIONS} revisions. Please start a new request instead.`,
    };
  }

  return { ok: true };
}
