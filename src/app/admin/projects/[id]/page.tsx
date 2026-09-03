import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProject } from "../actions";
import { ProjectForm } from "../project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const updateProjectWithId = updateProject.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/projects" className="text-sm text-paper-dim hover:text-gold-bright">
        ← Back to projects
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-paper">
        Edit project
      </h1>
      <ProjectForm project={project} action={updateProjectWithId} submitLabel="Save changes" />
    </div>
  );
}
