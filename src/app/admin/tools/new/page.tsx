import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { createTool } from "../actions";
import { ToolForm } from "../tool-form";

export default async function NewToolPage() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/tools");

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/admin/tools"
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            ← Back to tools
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">New tool</h1>
          <ToolForm action={createTool} submitLabel="Create tool" />
        </div>
      </main>
    </>
  );
}
