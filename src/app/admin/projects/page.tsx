import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { listProjects, PROJECT_STATUS_LABELS, PROJECT_STATUS_LIT } from "@/lib/projects";
import { deleteProject, toggleProjectEnabled } from "./actions";

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
            Manage projects
          </h1>
          <p className="mt-1 text-sm text-paper-dim">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </p>
        </div>
        <ButtonLink href="/admin/projects/new">New project</ButtonLink>
      </div>

      {projects.length === 0 ? (
        <p className="mt-10 border-t border-hairline pt-8 text-sm text-paper-dim">
          No projects yet. Create your first one to populate the section.
        </p>
      ) : (
        <ul className="mt-8 border-t border-hairline">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between gap-4 border-b border-hairline py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="truncate font-medium text-paper">{project.name}</h2>
                  <StatusIndicator
                    lit={PROJECT_STATUS_LIT[project.status]}
                    label={PROJECT_STATUS_LABELS[project.status]}
                  />
                  <StatusIndicator
                    lit={project.enabled}
                    label={project.enabled ? "Enabled" : "Disabled"}
                  />
                </div>
                <p className="truncate text-sm text-paper-dim">/projects/{project.slug}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <form
                  action={async () => {
                    "use server";
                    await toggleProjectEnabled(project.id, !project.enabled);
                  }}
                >
                  <button className="text-paper-dim hover:text-paper">
                    {project.enabled ? "Disable" : "Enable"}
                  </button>
                </form>
                <Link href={`/admin/projects/${project.id}`} className="text-gold hover:text-gold-bright">
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteProject(project.id);
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
