import { prisma } from "@/lib/prisma";
import type { Tool, ToolCategory, ToolStatus } from "@prisma/client";

export { stripMarkdown } from "@/lib/markdown";
export type { Tool, ToolCategory, ToolStatus };

export const TOOL_STATUS_LABELS: Record<ToolStatus, string> = {
  IN_DEVELOPMENT: "In development",
  AVAILABLE: "Available",
};

export const TOOL_STATUS_LIT: Record<ToolStatus, boolean> = {
  IN_DEVELOPMENT: false,
  AVAILABLE: true,
};

export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  SHOPIFY_THEMES: "Shopify Themes",
  SHOPIFY_APPS: "Shopify Apps",
  MARKETING: "Marketing",
  OTHER: "Other",
};

export const TOOL_CATEGORY_ORDER: ToolCategory[] = [
  "SHOPIFY_THEMES",
  "SHOPIFY_APPS",
  "MARKETING",
  "OTHER",
];

export function groupToolsByCategory(tools: Tool[]) {
  const groups = new Map<ToolCategory, Tool[]>();
  for (const tool of tools) {
    const bucket = groups.get(tool.category);
    if (bucket) bucket.push(tool);
    else groups.set(tool.category, [tool]);
  }
  return TOOL_CATEGORY_ORDER.filter((category) => groups.has(category)).map(
    (category) => ({
      category,
      label: TOOL_CATEGORY_LABELS[category],
      tools: groups.get(category)!,
    }),
  );
}

export function listTools() {
  return prisma.tool.findMany({ orderBy: { order: "asc" } });
}

export function listEnabledTools() {
  return prisma.tool.findMany({
    where: { enabled: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
  });
}

export function getToolBySlug(slug: string) {
  return prisma.tool.findUnique({ where: { slug } });
}

export function getEnabledToolBySlug(slug: string) {
  return prisma.tool.findFirst({ where: { slug, enabled: true } });
}

export async function incrementToolDownloadCount(slug: string, userId: string) {
  const tool = await prisma.tool.findFirst({ where: { slug, enabled: true } });
  if (!tool) return false;

  await prisma.$transaction([
    prisma.tool.update({
      where: { id: tool.id },
      data: { downloadCount: { increment: 1 } },
    }),
    prisma.toolDownload.upsert({
      where: { userId_toolId: { userId, toolId: tool.id } },
      create: { userId, toolId: tool.id, count: 1 },
      update: { count: { increment: 1 }, lastDownloadedAt: new Date() },
    }),
  ]);

  return true;
}
