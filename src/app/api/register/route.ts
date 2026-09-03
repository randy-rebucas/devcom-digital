import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { createVerificationToken } from "@/lib/verification";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = await createVerificationToken(email);
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await sendVerificationEmail(email, name, verifyUrl);
  } catch (err) {
    console.error("Failed to send verification email", err);
  }

  return NextResponse.json({ ok: true });
}
