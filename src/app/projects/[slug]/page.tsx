import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Highlight } from "@/components/highlight";
import { ProjectDemo } from "@/components/project-demo";
import { projects } from "@/lib/config";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    openGraph: { title: project.title, description: project.description, type: "article" },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <article className="py-10">
      <Link href="/#projects" className="font-mono text-xs text-fg-muted hover:text-accent">
        ← back
      </Link>

      <div className="mt-6 flex items-center gap-3">
        {project.logo && (
          <Image
            src={project.logo}
            alt=""
            width={96}
            height={96}
            className="size-12 shrink-0 rounded-[22%] border border-border"
          />
        )}
        <h1 className="text-2xl font-medium tracking-tight">{project.title}</h1>
      </div>

      {project.highlight && (
        <p className="mt-3 border-l-2 border-accent pl-3 font-mono text-xs text-fg">
          {project.highlight}
        </p>
      )}

      {/* The video and the copy sit side by side from `md` up and stack below
          it — a portrait phone recording next to a text column is unreadable on
          a narrow screen. ProjectDemo owns that layout because it depends on
          which platform's recording is showing. */}
      <ProjectDemo project={project}>
        <p className="leading-relaxed text-fg-muted">
          <Highlight text={project.description} terms={project.descriptionHighlights ?? []} />
        </p>

        {project.body?.map((paragraph) => (
          <p key={paragraph} className="mt-4 leading-relaxed text-fg-muted">
            {paragraph}
          </p>
        ))}

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-fg-muted"
            >
              {t}
            </li>
          ))}
        </ul>

        {(project.repo || project.demo) && (
          <div className="mt-6 flex gap-3 font-mono text-xs">
            {project.repo && (
              <a href={project.repo} rel="noopener" className="hover:text-accent">
                repo ↗
              </a>
            )}
            {project.demo && (
              <a href={project.demo} rel="noopener" className="hover:text-accent">
                demo ↗
              </a>
            )}
          </div>
        )}
      </ProjectDemo>
    </article>
  );
}
