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
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        loading="lazy"
                        className="-mt-6 -mx-6 mb-1 h-32 w-[calc(100%+3rem)] border-b border-hairline bg-ink object-cover"
                      />
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-mono text-xs text-gold-dim">
                        No. {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <ProjectStatusBadge status={project.status} className="shrink-0" />
                    </div>
                    <h2 className="font-display text-xl font-bold tracking-tight text-paper group-hover:text-gold-bright">
                      {project.name}
                    </h2>
                    <p className="line-clamp-2 text-sm text-paper-dim">
                      {stripMarkdown(project.desc)}
                    </p>
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
