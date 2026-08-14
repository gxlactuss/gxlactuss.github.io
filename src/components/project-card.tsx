import type { Project } from "@/lib/config";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-lg border border-border bg-bg-subtle/40 p-4 transition-colors hover:border-fg-muted/50">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-medium">{project.title}</h3>
        {(project.repo || project.demo) && (
          <div className="flex gap-3 font-mono text-xs text-fg-muted">
            {project.repo && (
              <a href={project.repo} className="hover:text-accent" rel="noopener">
                repo ↗
              </a>
            )}
            {project.demo && (
              <a href={project.demo} className="hover:text-accent" rel="noopener">
                demo ↗
              </a>
            )}
          </div>
        )}
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
    </article>
  );
}
