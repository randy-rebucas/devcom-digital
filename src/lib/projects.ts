import { prisma } from "@/lib/prisma";
import type { Project, ProjectStatus } from "@prisma/client";

export type { Project, ProjectStatus };

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export const PROJECT_STATUS_LIT: Record<ProjectStatus, boolean> = {
  IN_PROGRESS: false,
  COMPLETED: true,
};

export function listProjects() {
  return prisma.project.findMany({ orderBy: { order: "asc" } });
}

export function listEnabledProjects() {
  return prisma.project.findMany({
    where: { enabled: true },
    orderBy: { order: "asc" },
  });
}

export function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({ where: { slug } });
}

export function getEnabledProjectBySlug(slug: string) {
  return prisma.project.findFirst({ where: { slug, enabled: true } });
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
