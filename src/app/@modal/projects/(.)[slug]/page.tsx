import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Modal } from "@/components/modal";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { getEnabledProjectBySlug } from "@/lib/projects";

export default async function ProjectModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getEnabledProjectBySlug(slug);
  if (!project) notFound();

  return (
    <Modal>
      <div className="max-h-[85vh] overflow-y-auto p-6">
        {project.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl}
            alt={project.name}
            className="-mt-6 -mx-6 mb-1 h-auto w-[calc(100%+3rem)] border-b border-hairline bg-ink-raised"
          />
        )}
        <div className="mt-4 flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tight text-paper">
            {project.name}
          </h2>
          <ProjectStatusBadge status={project.status} className="mt-1" />
        </div>
        {project.tagline && (
          <p className="mt-1 text-sm text-gold-dim">{project.tagline}</p>
        )}
        {project.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-sm border border-hairline px-1.5 py-0.5 text-[10px] text-paper-dim"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-paper-dim [&_a]:text-gold [&_a]:underline [&_code]:rounded-sm [&_code]:bg-ink [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-paper [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-paper [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-paper">
          <ReactMarkdown>{project.desc}</ReactMarkdown>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 border-t border-hairline pt-5">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright"
            >
              View live
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-gold hover:text-gold-bright"
            >
              View repository →
            </a>
          )}
        </div>

        <a
          href={`/projects/${project.slug}`}
          className="mt-6 inline-block text-xs text-paper-dim underline transition-colors hover:text-gold-bright"
        >
          View full page →
        </a>
      </div>
    </Modal>
  );
}
