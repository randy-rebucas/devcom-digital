import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { listTools, TOOL_STATUS_LABELS, TOOL_STATUS_LIT } from "@/lib/tools";
import { deleteTool, toggleToolEnabled } from "./actions";

export default async function AdminToolsPage() {
  const tools = await listTools();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
            Manage tools
          </h1>
          <p className="mt-1 text-sm text-paper-dim">
            {tools.length} tool{tools.length === 1 ? "" : "s"}
          </p>
        </div>
        <ButtonLink href="/admin/tools/new">New tool</ButtonLink>
      </div>

      {tools.length === 0 ? (
        <p className="mt-10 border-t border-hairline pt-8 text-sm text-paper-dim">
          No tools yet. Create your first one to populate the suite.
        </p>
      ) : (
        <ul className="mt-8 border-t border-hairline">
          {tools.map((tool) => (
            <li
              key={tool.id}
              className="flex items-center justify-between gap-4 border-b border-hairline py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="truncate font-medium text-paper">{tool.name}</h2>
                  <StatusIndicator
                    lit={TOOL_STATUS_LIT[tool.status]}
                    label={TOOL_STATUS_LABELS[tool.status]}
                  />
                  <StatusIndicator
                    lit={tool.enabled}
                    label={tool.enabled ? "Enabled" : "Disabled"}
                  />
                  {tool.featured && (
                    <span className="rounded-sm border border-gold/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-bright">
                      Featured
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-paper-dim">
                  /tools/{tool.slug}
                  {tool.version ? ` · ${tool.version}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-paper-dim">
                  {tool.downloadCount} download{tool.downloadCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <form
                  action={async () => {
                    "use server";
                    await toggleToolEnabled(tool.id, !tool.enabled);
                  }}
                >
                  <button className="text-paper-dim hover:text-paper">
                    {tool.enabled ? "Disable" : "Enable"}
                  </button>
                </form>
                <Link href={`/admin/tools/${tool.id}`} className="text-gold hover:text-gold-bright">
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteTool(tool.id);
                  }}
                >
                  <button className="text-red-400 hover:text-red-300">Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
