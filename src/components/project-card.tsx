import Image from "next/image";
import Link from "next/link";
import { Highlight } from "@/components/highlight";
import type { Project } from "@/lib/config";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group rounded-lg border border-border bg-bg-subtle/40 transition-colors hover:border-accent/60">
      {/* The whole card is the link. External repo/demo links would nest inside
          it, so they live on the detail page instead. */}
      <Link href={`/projects/${project.slug}`} className="block p-4">
        <div className="flex items-center gap-3">
          {project.logo && (
            // Decorative: the title sits right beside it, and an alt here would
            // just make a screen reader say the name twice.
            <Image
              src={project.logo}
              alt=""
              width={80}
              height={80}
              className="size-10 shrink-0 rounded-[22%] border border-border"
            />
          )}
          <h3 className="min-w-0 font-medium group-hover:text-accent">{project.title}</h3>
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
