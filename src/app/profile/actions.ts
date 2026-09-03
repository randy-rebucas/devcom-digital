"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { unlink, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export type ProfileFormState = { error?: string; success?: string } | undefined;

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const userId = await requireUserId();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Name is required." };
  }
  if (name.length > 100) {
    return { error: "Name must be 100 characters or fewer." };
  }

  await prisma.user.update({ where: { id: userId }, data: { name } });
  revalidatePath("/profile");
  return { success: "Profile updated." };
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function sniffImageExtension(bytes: Buffer): string | null {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function uploadAvatar(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const userId = await requireUserId();

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }

  if (!ALLOWED_AVATAR_TYPES[file.type]) {
    return { error: "Only PNG, JPEG, or WebP images are allowed." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "Image must be 2MB or smaller." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniffImageExtension(bytes);
  if (!ext) {
    return { error: "That file doesn't look like a valid PNG, JPEG, or WebP image." };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${userId}-${Date.now()}.${ext}`;
  await writeFile(path.join(uploadDir, filename), bytes);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { image: true } });
  const publicPath = `/uploads/avatars/${filename}`;

  await prisma.user.update({ where: { id: userId }, data: { image: publicPath } });

  if (user?.image?.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(process.cwd(), "public", user.image);
    await unlink(oldPath).catch(() => {});
  }

  revalidatePath("/profile");
  return { success: "Avatar updated." };
}

export async function changePassword(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const userId = await requireUserId();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password) {
    return { error: "This account has no password set." };
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return { error: "Current password is incorrect." };
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed, currentSessionId: null },
  });

  await signOut({ redirectTo: "/login?passwordChanged=1" });
}
