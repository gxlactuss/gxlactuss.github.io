"use client";

import { useEffect, useRef, useState } from "react";
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
  const tablist = useRef<HTMLDivElement>(null);
  /** Where the sliding pill sits, in px within the tablist. Null until measured. */
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  // Derived rather than trusted: `selected` can name a platform this project
  // doesn't have if the state survives a navigation between two project pages.
  const active = available.find((p) => p.id === selected) ?? available[0];
  const demo = active && project.demos?.[active.id];
  const aspect = demo?.aspect ?? active?.aspect ?? 9 / 16;
  const wide = aspect >= 1;

  // Measured after paint rather than in a layout effect: this component is
  // prerendered at build time and useLayoutEffect warns when it runs there. The
  // cost is that the pill lands one frame late, which is why it fades in.
  useEffect(() => {
    const node = active ? tabs.current[active.id] : null;
    const list = tablist.current;
    if (!node || !list) {
      setPill(null);
      return;
    }
    const measure = () => setPill({ x: node.offsetLeft, w: node.offsetWidth });
    measure();
    // The labels are a webfont, so their widths change once it loads, and the
    // row rewraps with the column. Re-measure rather than trust the first read.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active?.id, available.length]);

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
          ? "mt-6"
          : "mt-6 grid gap-8 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:items-start"
      }
    >
      <div className={wide ? undefined : "md:sticky md:top-20"}>
        {/* One platform is a label, not a control — a lone tab that does nothing
            when you click it reads as broken. */}
        {available.length > 1 ? (
          <div
            ref={tablist}
            role="tablist"
            aria-label="Demo platform"
            onKeyDown={onKeyDown}
            className="relative mb-3 inline-flex rounded-md border border-border bg-bg-subtle/40 p-0.5 font-mono text-[11px]"
          >
            {/*
              The selected tab's background, as one element that moves rather
              than a colour that appears on one button and vanishes from
              another. Hidden until measured so it never flashes at the origin.

              Measured rather than split into even percentages because the
              labels are different lengths — "iPadOS" is half again the width of
              "iOS", so an even split would leave the pill wider than one label
              and narrower than another.

              Transform and width rather than `left`, to keep the slide off the
              layout path. Reduced motion needs nothing here: the blanket rule
              in globals.css already collapses the duration, so the pill jumps
              to the new tab instead of travelling to it.
            */}
            <span
              aria-hidden="true"
              className="absolute bottom-0.5 left-0 top-0.5 rounded bg-accent/15 transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                width: pill?.w ?? 0,
                transform: `translateX(${pill?.x ?? 0}px)`,
                opacity: pill ? 1 : 0,
              }}
            />
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
                  // `relative` so the label paints above the pill, which is
                  // absolutely positioned and would otherwise cover it.
                  className={`relative rounded px-2.5 py-1 transition-colors ${
                    current ? "text-accent" : "text-fg-muted hover:text-fg"
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
