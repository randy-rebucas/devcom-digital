import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/verification";
import { sendWelcomeEmail } from "@/lib/mail";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?verified=0", origin));
  }

  const valid = await consumeVerificationToken(email, token);
  if (!valid) {
    return NextResponse.redirect(new URL("/login?verified=0", origin));
  }

  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  try {
    await sendWelcomeEmail(user.email, user.name ?? "there");
  } catch (err) {
    console.error("Failed to send welcome email", err);
  }

  return NextResponse.redirect(new URL("/login?verified=1", origin));
}
