import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { listTools, TOOL_STATUS_LABELS } from "@/lib/tools";
import { deleteTool, toggleToolEnabled } from "./actions";

export default async function AdminToolsPage() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/tools");

  const tools = await listTools();

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Manage tools</h1>
              <p className="mt-1 text-sm text-neutral-500">
                {tools.length} tool{tools.length === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              href="/admin/tools/new"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              New tool
            </Link>
          </div>

          <div className="mt-8 space-y-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-medium">{tool.name}</h2>
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {TOOL_STATUS_LABELS[tool.status]}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        tool.enabled
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                      }`}
                    >
                      {tool.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <p className="truncate text-sm text-neutral-500">/tools/{tool.slug}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <form
                    action={async () => {
                      "use server";
                      await toggleToolEnabled(tool.id, !tool.enabled);
                    }}
                  >
                    <button className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200">
                      {tool.enabled ? "Disable" : "Enable"}
                    </button>
                  </form>
                  <Link
                    href={`/admin/tools/${tool.id}`}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    Edit
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteTool(tool.id);
                    }}
                  >
                    <button className="text-red-600 hover:text-red-500 dark:text-red-400">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {tools.length === 0 && (
              <p className="text-sm text-neutral-500">No tools yet.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
