import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { incrementToolDownloadCount } from "@/lib/tools";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [subscription, license] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.license.findUnique({ where: { userId: session.user.id } }),
  ]);
  const isActive = subscription?.status === "ACTIVE" && license?.active;
  if (!isActive) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const { slug } = await params;
  const ok = await incrementToolDownloadCount(slug, session.user.id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
