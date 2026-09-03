import Link from "next/link";
import { createProject } from "../actions";
import { ProjectForm } from "../project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/projects" className="text-sm text-paper-dim hover:text-gold-bright">
        ← Back to projects
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-paper">
        New project
      </h1>
      <ProjectForm action={createProject} submitLabel="Create project" />
    </div>
  );
}
