"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { deleteFeatureImageIfBlob, uploadFeatureImage } from "@/lib/image-upload";
import { createToolApiKey, revokeToolApiKey } from "@/lib/tool-api-keys";
import type { ToolCategory, ToolStatus } from "@prisma/client";

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

function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseScreenshotUrls(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
}

async function uploadScreenshots(
  formData: FormData,
): Promise<{ urls: string[] } | { error: string }> {
  const files = formData.getAll("screenshotFiles").filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  for (const file of files) {
    const result = await uploadFeatureImage(file, "tools/screenshots");
    if ("error" in result) return { error: result.error };
    urls.push(result.url);
  }
  return { urls };
}

export type ToolFormState = { error?: string } | undefined;

export async function createTool(
  _prevState: ToolFormState,
  formData: FormData,
): Promise<ToolFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim() || null;
  const desc = String(formData.get("desc") ?? "").trim();
  const status = String(formData.get("status") ?? "IN_DEVELOPMENT") as ToolStatus;
  const category = String(formData.get("category") ?? "OTHER") as ToolCategory;
  const guideUrl = String(formData.get("guideUrl") ?? "").trim() || null;
  const downloadUrl = String(formData.get("downloadUrl") ?? "").trim() || null;
  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const tags = parseTags(formData.get("tags"));
  const version = String(formData.get("version") ?? "").trim() || null;
  const requiresLicenseKey = formData.get("requiresLicenseKey") === "on";
  const enabled = formData.get("enabled") === "on";
  const featured = formData.get("featured") === "on";
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

  const screenshotResult = await uploadScreenshots(formData);
  if ("error" in screenshotResult) return { error: screenshotResult.error };
  const screenshots = [...parseScreenshotUrls(formData.get("screenshotUrls")), ...screenshotResult.urls];

  const count = await prisma.tool.count();

  await prisma.tool.create({
    data: {
      slug,
      name,
      tagline,
      desc,
      status,
      category,
      guideUrl,
      downloadUrl,
      imageUrl,
      screenshots,
      tags,
      version,
      requiresLicenseKey,
      enabled,
      featured,
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
  const tagline = String(formData.get("tagline") ?? "").trim() || null;
  const desc = String(formData.get("desc") ?? "").trim();
  const status = String(formData.get("status") ?? "IN_DEVELOPMENT") as ToolStatus;
  const category = String(formData.get("category") ?? "OTHER") as ToolCategory;
  const guideUrl = String(formData.get("guideUrl") ?? "").trim() || null;
  const downloadUrl = String(formData.get("downloadUrl") ?? "").trim() || null;
  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const tags = parseTags(formData.get("tags"));
  const version = String(formData.get("version") ?? "").trim() || null;
  const requiresLicenseKey = formData.get("requiresLicenseKey") === "on";
  const enabled = formData.get("enabled") === "on";
  const featured = formData.get("featured") === "on";
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

  const screenshotResult = await uploadScreenshots(formData);
  if ("error" in screenshotResult) return { error: screenshotResult.error };
  const screenshots = [...parseScreenshotUrls(formData.get("screenshotUrls")), ...screenshotResult.urls];

  await prisma.tool.update({
    where: { id },
    data: {
      slug,
      name,
      tagline,
      desc,
      status,
      category,
      guideUrl,
      downloadUrl,
      imageUrl,
      screenshots,
      tags,
      version,
      requiresLicenseKey,
      enabled,
      featured,
    },
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

export async function createToolApiKeyAction(toolId: string, name?: string) {
  await requireAdmin();
  const { rawKey } = await createToolApiKey(toolId, name);
  revalidatePath(`/admin/tools/${toolId}`);
  // Returned once to the admin UI so it can be shown to the user; never persisted in plaintext.
  return rawKey;
}

export async function revokeToolApiKeyAction(toolId: string, keyId: string) {
  await requireAdmin();
  await revokeToolApiKey(keyId);
  revalidatePath(`/admin/tools/${toolId}`);
}
