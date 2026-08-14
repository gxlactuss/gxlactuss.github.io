import Link from "next/link";
import type { Project } from "@/lib/config";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group rounded-lg border border-border bg-bg-subtle/40 transition-colors hover:border-accent/60">
      {/* The whole card is the link. External repo/demo links would nest inside
          it, so they live on the detail page instead. */}
      <Link href={`/projects/${project.slug}`} className="block p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-medium group-hover:text-accent">{project.title}</h3>
          <span className="shrink-0 font-mono text-xs text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
            →
          </span>
        </div>

        <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{project.description}</p>

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
