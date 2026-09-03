import Link from "next/link";
import { createTool } from "../actions";
import { ToolForm } from "../tool-form";

export default function NewToolPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/tools" className="text-sm text-paper-dim hover:text-gold-bright">
        ← Back to tools
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-paper">
        New tool
      </h1>
      <ToolForm action={createTool} submitLabel="Create tool" />
    </div>
  );
}
