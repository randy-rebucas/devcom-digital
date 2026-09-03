"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { deleteFeatureImageIfBlob, uploadFeatureImage } from "@/lib/image-upload";
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

export type ToolFormState = { error?: string } | undefined;

export async function createTool(
  _prevState: ToolFormState,
  formData: FormData,
): Promise<ToolFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const desc = String(formData.get("desc") ?? "").trim();
  const status = String(formData.get("status") ?? "IN_DEVELOPMENT") as ToolStatus;
  const guideUrl = String(formData.get("guideUrl") ?? "").trim() || null;
  const downloadUrl = String(formData.get("downloadUrl") ?? "").trim() || null;
  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const requiresLicenseKey = formData.get("requiresLicenseKey") === "on";
  const enabled = formData.get("enabled") === "on";
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);

  if (!name || !desc || !slug) {
    return { error: "Name and description are required." };
  }

  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    const result = await uploadFeatureImage(imageFile, "tools");
    if ("error" in result) return { error: result.error };
    imageUrl = result.url;
  }

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

export async function updateTool(
  id: string,
  _prevState: ToolFormState,
  formData: FormData,
): Promise<ToolFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const desc = String(formData.get("desc") ?? "").trim();
  const status = String(formData.get("status") ?? "IN_DEVELOPMENT") as ToolStatus;
  const guideUrl = String(formData.get("guideUrl") ?? "").trim() || null;
  const downloadUrl = String(formData.get("downloadUrl") ?? "").trim() || null;
  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const requiresLicenseKey = formData.get("requiresLicenseKey") === "on";
  const enabled = formData.get("enabled") === "on";
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);

  if (!name || !desc || !slug) {
    return { error: "Name and description are required." };
  }

  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    const result = await uploadFeatureImage(imageFile, "tools");
    if ("error" in result) return { error: result.error };
    const existing = await prisma.tool.findUnique({ where: { id }, select: { imageUrl: true } });
    await deleteFeatureImageIfBlob(existing?.imageUrl);
    imageUrl = result.url;
  }

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
