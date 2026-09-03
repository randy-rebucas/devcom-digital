"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { ToolStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/tools");
  return session!;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createTool(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const desc = String(formData.get("desc") ?? "").trim();
  const status = String(formData.get("status") ?? "IN_DEVELOPMENT") as ToolStatus;
  const guideUrl = String(formData.get("guideUrl") ?? "").trim() || null;
  const downloadUrl = String(formData.get("downloadUrl") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const requiresLicenseKey = formData.get("requiresLicenseKey") === "on";
  const enabled = formData.get("enabled") === "on";
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);

  if (!name || !desc || !slug) return;

  const count = await prisma.tool.count();

  await prisma.tool.create({
    data: {
      slug,
      name,
      desc,
      status,
      guideUrl,
      downloadUrl,
      imageUrl,
      requiresLicenseKey,
      enabled,
      order: count,
    },
  });

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  redirect("/admin/tools");
}

export async function updateTool(id: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const desc = String(formData.get("desc") ?? "").trim();
  const status = String(formData.get("status") ?? "IN_DEVELOPMENT") as ToolStatus;
  const guideUrl = String(formData.get("guideUrl") ?? "").trim() || null;
  const downloadUrl = String(formData.get("downloadUrl") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const requiresLicenseKey = formData.get("requiresLicenseKey") === "on";
  const enabled = formData.get("enabled") === "on";
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);

  if (!name || !desc || !slug) return;

  await prisma.tool.update({
    where: { id },
    data: { slug, name, desc, status, guideUrl, downloadUrl, imageUrl, requiresLicenseKey, enabled },
  });

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath(`/tools/${slug}`);
  redirect("/admin/tools");
}

export async function deleteTool(id: string) {
  await requireAdmin();
  await prisma.tool.delete({ where: { id } });
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
}

export async function toggleToolEnabled(id: string, enabled: boolean) {
  await requireAdmin();
  const tool = await prisma.tool.update({
    where: { id },
    data: { enabled },
  });
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath(`/tools/${tool.slug}`);
}
