import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEnabledToolBySlug, incrementToolDownloadCount } from "@/lib/tools";

async function checkAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }

  const [subscription, license] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.license.findUnique({ where: { userId: session.user.id } }),
  ]);
  const isActive = subscription?.status === "ACTIVE" && license?.active;
  if (!isActive) {
    return { error: NextResponse.json({ error: "Subscription required" }, { status: 403 }) } as const;
  }

  return { userId: session.user.id } as const;
}

// GET performs the actual gated redirect to the file — the client never
// sees the raw downloadUrl, so access is re-checked on every download.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const access = await checkAccess();
  if ("error" in access) return access.error;

  const { slug } = await params;
  const tool = await getEnabledToolBySlug(slug);
  if (!tool?.downloadUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await incrementToolDownloadCount(slug, access.userId);
  return NextResponse.redirect(tool.downloadUrl);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const access = await checkAccess();
  if ("error" in access) return access.error;

  const { slug } = await params;
  const ok = await incrementToolDownloadCount(slug, access.userId);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
