import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { updateTool } from "../actions";
import { ToolForm } from "../tool-form";

export default async function EditToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!isAdmin(session)) redirect("/tools");

  const tool = await prisma.tool.findUnique({ where: { id } });
  if (!tool) notFound();

  const updateToolWithId = updateTool.bind(null, id);

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
          <h1 className="mt-4 text-2xl font-semibold">Edit tool</h1>
          <ToolForm tool={tool} action={updateToolWithId} submitLabel="Save changes" />
        </div>
      </main>
    </>
  );
}
