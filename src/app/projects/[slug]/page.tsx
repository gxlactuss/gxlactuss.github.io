import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allProjects } from "@/lib/config";

export function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    openGraph: { title: project.title, description: project.description, type: "article" },
  };
}

/** Placeholder until a video file is dropped in `public/videos/`. */
function VideoSlot({ title }: { title: string }) {
  return (
    <div className="grid aspect-[9/16] place-items-center rounded-lg border border-dashed border-border bg-bg-subtle/40 p-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Video coming</p>
        <p className="mt-2 text-sm text-fg-muted">
          Add a file to <code className="font-mono text-xs">public/videos/</code> and set{" "}
          <code className="font-mono text-xs">video</code> on {title} in config.ts.
        </p>
      </div>
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <article className="py-16">
      <Link href="/#projects" className="font-mono text-xs text-fg-muted hover:text-accent">
        ← back
      </Link>

      <h1 className="mt-6 text-2xl font-medium tracking-tight">{project.title}</h1>

      {project.highlight && (
        <p className="mt-3 border-l-2 border-accent pl-3 font-mono text-xs text-fg">
          {project.highlight}
        </p>
      )}

      {/* Video and copy sit side by side from `md` up, and stack below it —
          a portrait phone recording next to a text column is unreadable on a
          narrow screen. */}
      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:items-start">
        <div className="md:sticky md:top-20">
          {project.video ? (
            <video
              controls
              playsInline
              preload="metadata"
              poster={project.poster}
              className="w-full rounded-lg border border-border"
            >
              <source src={project.video} type="video/mp4" />
            </video>
          ) : (
            <VideoSlot title={project.title} />
          )}
        </div>

        <div>
          <p className="leading-relaxed text-fg-muted">{project.description}</p>

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
        </div>
      </div>
    </article>
  );
}
