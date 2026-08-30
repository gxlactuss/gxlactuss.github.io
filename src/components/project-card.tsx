import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { Highlight } from "@/components/highlight";
import type { Project } from "@/lib/config";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group rounded-lg border border-border bg-bg-subtle/40 transition-colors hover:border-accent/60">
      {/* The whole card is the link. External repo/demo links would nest inside
          it, so they live on the detail page instead. */}
      <Link href={`/projects/${project.slug}`} className="block p-4">
        <div className="flex items-center gap-3">
          {/* The logo and the title carry `name`s that the project page repeats,
              so on navigation the browser moves these two out of the card and
              into the page header instead of crossfading a new pair in. React
              renders no wrapper for a <ViewTransition>, so the flex row is
              unaffected. `default="none"` keeps them still during any
              transition their partner isn't part of. */}
          {project.logo && (
            <ViewTransition name={`project-logo-${project.slug}`} share="morph" default="none">
              {/* Decorative: the title sits right beside it, and an alt here
                  would just make a screen reader say the name twice. */}
              <Image
                src={project.logo}
                alt=""
                width={80}
                height={80}
                className="size-10 shrink-0 rounded-[22%] border border-border"
              />
            </ViewTransition>
          )}
          <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
            <h3 className="min-w-0 font-medium group-hover:text-accent">{project.title}</h3>
          </ViewTransition>
          <span className="ml-auto shrink-0 font-mono text-xs text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
            →
          </span>
        </div>

        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
          <Highlight text={project.description} terms={project.descriptionHighlights ?? []} />
        </p>

        {project.highlight && (
          <p className="mt-2 border-l-2 border-accent pl-3 font-mono text-xs text-fg">
            {project.highlight}
          </p>
        )}

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-fg-muted"
            >
              {t}
            </li>
          ))}
        </ul>
      </Link>
    </article>
  );
}
