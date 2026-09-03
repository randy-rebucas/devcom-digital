import { prisma } from "@/lib/prisma";
import type { Tool, ToolStatus } from "@prisma/client";

export type { Tool, ToolStatus };

export const TOOL_STATUS_LABELS: Record<ToolStatus, string> = {
  IN_DEVELOPMENT: "In development",
  AVAILABLE: "Available",
};

export const TOOL_STATUS_LIT: Record<ToolStatus, boolean> = {
  IN_DEVELOPMENT: false,
  AVAILABLE: true,
};

export function listTools() {
  return prisma.tool.findMany({ orderBy: { order: "asc" } });
}

export function listEnabledTools() {
  return prisma.tool.findMany({
    where: { enabled: true },
    orderBy: { order: "asc" },
  });
}

export function getToolBySlug(slug: string) {
  return prisma.tool.findUnique({ where: { slug } });
}

export function getEnabledToolBySlug(slug: string) {
  return prisma.tool.findFirst({ where: { slug, enabled: true } });
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
