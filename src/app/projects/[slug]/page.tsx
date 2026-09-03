import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Navbar } from "@/components/navbar";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { getEnabledProjectBySlug, stripMarkdown } from "@/lib/projects";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getEnabledProjectBySlug(slug);
  if (!project) return {};

  const description = stripMarkdown(project.desc).slice(0, 160);
  return {
    title: project.name,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      url: `/projects/${project.slug}`,
      title: `${project.name} | Devcom Digital`,
      description,
      images: project.imageUrl ? [project.imageUrl] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getEnabledProjectBySlug(slug);
  if (!project) notFound();

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: stripMarkdown(project.desc).slice(0, 300),
    url: `${SITE_URL}/projects/${project.slug}`,
    image: project.imageUrl || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/projects"
            className="text-sm text-paper-dim transition-colors hover:text-gold-bright"
          >
            ← Back to projects
          </Link>

          {project.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.imageUrl}
              alt={project.name}
              loading="lazy"
              className="mt-4 h-56 w-full rounded-sm border border-hairline bg-ink-raised object-cover"
            />
          )}

          <div className="mt-6 flex items-start justify-between gap-3 border-t border-hairline pt-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
              {project.name}
            </h1>
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

          <div className="mt-8 flex flex-wrap gap-4 border-t border-hairline pt-6">
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
        </div>
      </main>
    </>
  );
}
