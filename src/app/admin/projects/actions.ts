"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@prisma/client";

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

export type ProjectFormState = { error?: string } | undefined;

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const desc = String(formData.get("desc") ?? "").trim();
  const status = String(formData.get("status") ?? "IN_PROGRESS") as ProjectStatus;
  const liveUrl = String(formData.get("liveUrl") ?? "").trim() || null;
  const repoUrl = String(formData.get("repoUrl") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const enabled = formData.get("enabled") === "on";
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);

  if (!name || !desc || !slug) {
    return { error: "Name and description are required." };
  }

  const count = await prisma.project.count();

  await prisma.project.create({
    data: {
      slug,
      name,
      desc,
      status,
      liveUrl,
      repoUrl,
      imageUrl,
      enabled,
      order: count,
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function updateProject(
  id: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const desc = String(formData.get("desc") ?? "").trim();
  const status = String(formData.get("status") ?? "IN_PROGRESS") as ProjectStatus;
  const liveUrl = String(formData.get("liveUrl") ?? "").trim() || null;
  const repoUrl = String(formData.get("repoUrl") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const enabled = formData.get("enabled") === "on";
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);

  if (!name || !desc || !slug) {
    return { error: "Name and description are required." };
  }

  await prisma.project.update({
    where: { id },
    data: { slug, name, desc, status, liveUrl, repoUrl, imageUrl, enabled },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function toggleProjectEnabled(id: string, enabled: boolean) {
  await requireAdmin();
  const project = await prisma.project.update({
    where: { id },
    data: { enabled },
  });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/");
}
