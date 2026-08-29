"use client";

import { useRef, useState } from "react";
import { ProjectStats } from "@/components/project-stats";
import { platforms, type Platform, type Project } from "@/lib/config";

/** Placeholder until video files are dropped in `public/videos/`. */
function EmptySlot({ title }: { title: string }) {
  return (
    <div className="m-2 grid aspect-[9/16] place-items-center rounded-md border border-dashed border-border bg-bg-subtle/40 p-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Video coming</p>
        <p className="mt-2 text-sm text-fg-muted">
          Add files to <code className="font-mono text-xs">public/videos/</code> and set{" "}
          <code className="font-mono text-xs">demos</code> on {title} in config.ts.
        </p>
      </div>
    </div>
  );
}

/**
 * The demo video and the write-up, laid out against each other.
 *
 * The copy comes in as `children` so it stays a Server Component — this file is
 * a client boundary only because the platform tabs need state.
 *
 * The layout follows the recording rather than the other way round: a phone
 * video sits in a narrow sticky column beside the text, while an iPad or Mac
 * recording takes the full column width with the text below it. A landscape
 * screencast squeezed into 260px is unwatchable, which is the whole reason this
 * switches shape at all.
 */
export function ProjectDemo({ project, children }: { project: Project; children: React.ReactNode }) {
  const available = platforms.filter((p) => project.demos?.[p.id]);
  const [selected, setSelected] = useState<Platform | undefined>(available[0]?.id);
  const tabs = useRef<Partial<Record<Platform, HTMLButtonElement | null>>>({});

  // Derived rather than trusted: `selected` can name a platform this project
  // doesn't have if the state survives a navigation between two project pages.
  const active = available.find((p) => p.id === selected) ?? available[0];
  const demo = active && project.demos?.[active.id];
  const aspect = demo?.aspect ?? active?.aspect ?? 9 / 16;
  const wide = aspect >= 1;

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step || !active) return;
    event.preventDefault();
    const from = available.indexOf(active);
    const next = available[(from + step + available.length) % available.length];
    setSelected(next.id);
    tabs.current[next.id]?.focus();
  }

  return (
    <div
      className={
        wide
          ? "mt-8"
          : "mt-8 grid gap-8 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:items-start"
      }
    >
      <div className={wide ? undefined : "md:sticky md:top-20"}>
        {/* One platform is a label, not a control — a lone tab that does nothing
            when you click it reads as broken. */}
        {available.length > 1 ? (
          <div
            role="tablist"
            aria-label="Demo platform"
            onKeyDown={onKeyDown}
            className="mb-3 inline-flex rounded-md border border-border bg-bg-subtle/40 p-0.5 font-mono text-[11px]"
          >
            {available.map((platform) => {
              const current = platform.id === active?.id;
              return (
                <button
                  key={platform.id}
                  ref={(node) => {
                    tabs.current[platform.id] = node;
                  }}
                  role="tab"
                  id={`demo-tab-${platform.id}`}
                  aria-selected={current}
                  aria-controls="demo-panel"
                  tabIndex={current ? 0 : -1}
                  onClick={() => setSelected(platform.id)}
                  className={`rounded px-2.5 py-1 transition-colors ${
                    current
                      ? "bg-accent/15 text-accent"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {platform.label}
                </button>
              );
            })}
          </div>
        ) : (
          active && (
            <p className="mb-3 font-mono text-[11px] text-fg-muted">{active.label}</p>
          )
        )}

        {/* Video and stats share one shell so the strip reads as the bottom of
            the player rather than a card that happens to sit under it. The
            placeholder takes the same shell, or the stats would float once a
            project has no recording yet. */}
        <div className="overflow-hidden rounded-lg border border-border">
          {active && demo ? (
            <div
              id="demo-panel"
              role={available.length > 1 ? "tabpanel" : undefined}
              aria-labelledby={available.length > 1 ? `demo-tab-${active.id}` : undefined}
            >
              <video
                // Remounts on switch: swapping the <source> under a live <video>
                // doesn't reload it, so without this the tabs do nothing.
                key={active.id}
                controls
                playsInline
                preload="metadata"
                poster={demo.poster}
                style={{ aspectRatio: aspect }}
                className="block w-full bg-bg-subtle"
              >
                <source src={demo.src} type="video/mp4" />
              </video>
            </div>
          ) : (
            <EmptySlot title={project.title} />
          )}

          <ProjectStats project={project} />
        </div>
      </div>

      <div className={wide ? "mt-8" : undefined}>{children}</div>
    </div>
  );
}
