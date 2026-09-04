import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listToolApiKeys } from "@/lib/tool-api-keys";
import { updateTool } from "../actions";
import { ToolForm } from "../tool-form";
import { ApiKeysPanel } from "./api-keys-panel";

export default async function EditToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [tool, apiKeys] = await Promise.all([
    prisma.tool.findUnique({ where: { id } }),
    listToolApiKeys(id),
  ]);
  if (!tool) notFound();

  const updateToolWithId = updateTool.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/tools" className="text-sm text-paper-dim hover:text-gold-bright">
        ← Back to tools
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-paper">
        Edit tool
      </h1>
      <ToolForm tool={tool} action={updateToolWithId} submitLabel="Save changes" />
      <ApiKeysPanel toolId={tool.id} keys={apiKeys} />
    </div>
  );
}
