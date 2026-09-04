import { NextResponse } from "next/server";
import { findToolByApiKey } from "@/lib/tool-api-keys";
import { verifyLicenseKey } from "@/lib/license-verify";
import { checkAndIncrementUsage } from "@/lib/tool-usage";

/**
 * Server-to-server endpoint for external tools to verify a subscriber's
 * Devcom license key. Auth is a per-tool API key (issued in the admin
 * tools screen), not a user session/cookie.
 */
export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }

  const tool = await findToolByApiKey(apiKey);
  if (!tool) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const key = (body as { key?: unknown })?.key;
  if (typeof key !== "string" || !key.trim()) {
    return NextResponse.json({ error: "Missing license key" }, { status: 400 });
  }

  const result = await verifyLicenseKey(key.trim());
  if (!result.valid) {
    return NextResponse.json(result);
  }

  const usage = await checkAndIncrementUsage(result.userId, tool.id);
  return NextResponse.json({ ...result, ...usage });
}
