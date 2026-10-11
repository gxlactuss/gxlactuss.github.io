"use client";

import { animate, m, useMotionValue, useMotionValueEvent, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/lib/config";
import { Marquee } from "./marquee";
import { morph, StatusChip, TechChips } from "./project-card";

const desktopQuery = "(min-width: 640px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// The body waits for the morph to mostly finish, so text never shows mid-stretch.
const body: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.06 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const bodyItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
};

const fadeLate = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

/**
 * The expanded project. Shares its layoutId with the card, so the card grows
 * into it and shrinks back on close. A centered panel from sm up, a bottom
 * sheet below that, which can be dragged down by its header to dismiss.
 */
export function ProjectSheet({ project, onClose }: { project: Project; onClose: () => void }) {
  const { slug } = project;
  // Only ever rendered on the client (after a click), so there's no server snapshot to match.
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia(desktopQuery).matches, () => true);
  const reduced = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);

  // The drag offset goes on a plain div, not an m.div. Motion strips its own
  // transforms when it measures, so a dragged m.div would snap back up before
  // morphing into the card; a plain div's transform is kept in the measurement.
  const shift = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);
  useMotionValueEvent(dragY, "change", (y) => {
    if (shift.current) shift.current.style.transform = `translateY(${y}px)`;
  });

  // Lock page scroll, move focus in, and hand it back to the card on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    // Pad by the scrollbar's width so the page doesn't shift sideways when it goes.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    panel.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      opener?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <>
      <m.div
        aria-hidden
        className="fixed inset-0 z-[70] bg-bg/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.25 } }}
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
        <div ref={shift} className="w-full sm:max-w-[640px]">
          <m.div
            ref={panel}
            layoutId={`project-${slug}`}
            transition={{ layout: morph }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`project-${slug}-title`}
            tabIndex={-1}
            style={
              desktop
                ? { borderRadius: 16 }
                : { borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
            }
            className="pointer-events-auto flex max-h-[90dvh] flex-col overflow-hidden border border-line bg-surface shadow-float outline-none max-sm:border-b-0 sm:max-h-[85vh]"
          >
            <m.div
              className="shrink-0 px-5 pt-2 pb-4 max-sm:touch-none sm:px-6 sm:pt-6"
              onPan={(_, info) => !desktop && dragY.set(Math.max(0, info.offset.y))}
              onPanEnd={(_, info) => {
                if (desktop) return;
                if (info.offset.y > 120 || info.velocity.y > 500) onClose();
                else animate(dragY, 0, { type: "spring", stiffness: 500, damping: 40 });
              }}
            >
              <m.div {...fadeLate} className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong sm:hidden" />
              <div className="flex items-start gap-3.5">
                <m.img
                  layoutId={`project-${slug}-logo`}
                  transition={morph}
                  src={project.logo}
                  alt=""
                  width={52}
                  height={52}
                  style={{ borderRadius: 13 }}
                  className="size-13 shrink-0 ring-1 ring-line"
                />
                <div className="min-w-0 flex-1">
                  <m.h2
                    id={`project-${slug}-title`}
                    layoutId={`project-${slug}-title`}
                    transition={morph}
                    className="w-fit font-display text-3xl leading-tight text-ink"
                  >
                    {project.title}
                  </m.h2>
                  <m.div {...fadeLate} className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <StatusChip status={project.status} />
                    <span className="font-mono text-[11px] text-faint">{project.platforms}</span>
                  </m.div>
                </div>
                <m.button
                  {...fadeLate}
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </m.button>
              </div>
            </m.div>

            <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
              {project.video && (
                <m.div
                  layoutId={`project-${slug}-video`}
                  transition={morph}
                  style={{ borderRadius: 12 }}
                  className="overflow-hidden bg-surface-2 ring-1 ring-line"
                >
                  <video
                    src={project.video.src}
                    poster={project.video.poster}
                    muted
                    loop
                    playsInline
                    controls
                    autoPlay={!reduced}
                    preload="metadata"
                    className="aspect-video w-full object-cover"
                  />
                </m.div>
              )}

              <m.div variants={body} initial="hidden" animate="show" exit="exit">
                {project.features && (
                  <m.div variants={bodyItem}>
                    <Marquee items={project.features} />
                  </m.div>
                )}
                {project.body.map((paragraph) => (
                  <m.p key={paragraph} variants={bodyItem} className="mt-4 text-ink-2">
                    {paragraph}
                  </m.p>
                ))}
                <m.div variants={bodyItem} className="mt-5 flex flex-wrap gap-1.5">
                  <TechChips tech={project.tech} />
                </m.div>
                {project.repo && (
                  <m.div variants={bodyItem} className="mt-5">
                    <m.a
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      whileHover="hover"
                      className="inline-flex min-h-11 items-center gap-1.5 text-accent"
                    >
                      View on GitHub
                      <m.span aria-hidden variants={{ hover: { x: 3 } }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                        →
                      </m.span>
                    </m.a>
                  </m.div>
                )}
                {project.status === "building" && (
                  <m.p variants={bodyItem} className="mt-5 font-mono text-[11px] text-faint">
                    In development. More soon.
                  </m.p>
                )}
              </m.div>
            </div>
          </m.div>
        </div>
      </div>
    </>,
    document.body,
  );
}
