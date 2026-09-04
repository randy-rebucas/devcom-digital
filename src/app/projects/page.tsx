import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { listEnabledProjects, stripMarkdown } from "@/lib/projects";
import { SITE_URL } from "@/lib/seo";

const DESCRIPTION = "A look at what Devcom Digital has built.";

export const metadata: Metadata = {
  title: "Projects",
  description: DESCRIPTION,
  alternates: { canonical: "/projects" },
  openGraph: {
    url: "/projects",
    title: "Projects | Devcom Digital",
    description: DESCRIPTION,
  },
};

export default async function ProjectsPage() {
  const projects = await listEnabledProjects();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects.map((project, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/projects/${project.slug}`,
      name: project.name,
    })),
  };

  return (
    <>
      {projects.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
            Projects
          </h1>
          <p className="mt-1 text-sm text-paper-dim">
            A look at what we&apos;ve built.
          </p>
          {projects.length === 0 ? (
            <p className="mt-10 border-t border-hairline pt-8 text-sm text-paper-dim">
              No projects are listed yet. Check back soon.
            </p>
          ) : (
            <ul className="mt-8 grid grid-cols-1 border-l border-t border-hairline sm:grid-cols-2">
              {projects.map((project, i) => (
                <li key={project.slug} className="border-b border-r border-hairline">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-ink-raised"
                  >
                    {project.imageUrl && (
                      <div className="relative -mt-6 -mx-6 mb-1 h-32 w-[calc(100%+3rem)] border-b border-hairline bg-ink">
                        <Image
                          src={project.imageUrl}
                          alt={project.name}
                          fill
                          sizes="(min-width: 640px) 50vw, 100vw"
                          loading={i === 0 ? "eager" : "lazy"}
                          priority={i === 0}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-mono text-xs text-gold-dim">
                        No. {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        {project.featured && (
                          <span className="rounded-sm border border-gold/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-bright">
                            Featured
                          </span>
                        )}
                        <ProjectStatusBadge status={project.status} />
                      </div>
                    </div>
                    <h2 className="font-display text-xl font-bold tracking-tight text-paper group-hover:text-gold-bright">
                      {project.name}
                    </h2>
                    <p className="line-clamp-2 text-sm text-paper-dim">
                      {project.tagline || stripMarkdown(project.desc)}
                    </p>
                    {project.tags.length > 0 && (
                      <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
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
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
