import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createVerificationToken(email: string) {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const rawToken = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashToken(rawToken),
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

export async function consumeVerificationToken(email: string, rawToken: string) {
  const hashed = hashToken(rawToken);
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: hashed } },
  });

  if (!record) return false;

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token: hashed } },
  });

  if (record.expires < new Date()) return false;

  return true;
}
