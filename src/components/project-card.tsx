"use client";

import { m, useInView, useMotionTemplate, useMotionValue, useReducedMotion, type Transition } from "motion/react";
import { useEffect, useRef } from "react";
import type { Project } from "@/lib/config";
import { Marquee } from "./marquee";
import { revealItem } from "./section";

/** Shared by the card and the sheet so every layoutId piece of the morph moves in step. */
export const morph: Transition = { type: "spring", bounce: 0.18, duration: 0.5 };

/** Paints only the 1px padding ring of the element it's on, i.e. the border. */
const borderOnly = {
  WebkitMask: "linear-gradient(black 0 0) content-box, linear-gradient(black 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(black 0 0) content-box exclude, linear-gradient(black 0 0)",
} as const;

export function StatusChip({ status }: { status: Project["status"] }) {
  const reduced = useReducedMotion();

  if (status === "shipped") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
        <span className="size-1.5 rounded-full bg-live" />
        Shipped
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[11px] text-accent">
      <span className="relative flex size-1.5">
        <m.span
          className="absolute inset-0 rounded-full bg-accent"
          initial={{ opacity: 0 }}
          animate={reduced ? undefined : { scale: [1, 2.6], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="relative size-1.5 rounded-full bg-accent" />
      </span>
      Building
    </span>
  );
}

export function TechChips({ tech }: { tech: string[] }) {
  return tech.map((t) => (
    <span key={t} className="rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-faint">
      {t}
    </span>
  ));
}

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const { slug } = project;
  const reduced = useReducedMotion();

  // Pointer position inside the card, for the spotlight on the border.
  const px = useMotionValue(-400);
  const py = useMotionValue(-400);
  const ring = useMotionTemplate`radial-gradient(220px circle at ${px}px ${py}px, var(--accent), transparent 70%)`;
  const glow = useMotionTemplate`radial-gradient(360px circle at ${px}px ${py}px, var(--accent-soft), transparent 70%)`;

  // The launch video plays only while it's on screen, and never under reduced motion.
  const video = useRef<HTMLVideoElement>(null);
  const videoInView = useInView(video, { amount: 0.5 });
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (videoInView && !reduced) {
      el.muted = true;
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [videoInView, reduced]);

  return (
    <m.div
      layoutId={`project-${slug}`}
      variants={revealItem}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-labelledby={`project-${slug}-card-title`}
      aria-describedby={project.summary ? `project-${slug}-card-summary` : undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
        e.preventDefault();
        onOpen();
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const box = e.currentTarget.getBoundingClientRect();
        px.set(e.clientX - box.left);
        py.set(e.clientY - box.top);
      }}
      whileHover={reduced ? undefined : { y: -3 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 380, damping: 26, layout: morph }}
      // Radius as a style, not a class, so motion can keep it round while the card scales into the sheet.
      style={{ borderRadius: 16 }}
      className="group relative min-w-0 border border-line bg-surface p-5 shadow-card"
    >
      {/* Spotlight. Tailwind's hover: only applies on devices that can hover. */}
      <m.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glow }}
      />
      <m.span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[inherit] p-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: ring, ...borderOnly }}
      />

      <div className="relative">
        <div className="flex items-start gap-3.5">
          <m.img
            layoutId={`project-${slug}-logo`}
            transition={morph}
            src={project.logo}
            alt=""
            width={44}
            height={44}
            style={{ borderRadius: 11 }}
            className="size-11 shrink-0 ring-1 ring-line"
          />
          <div className="min-w-0 flex-1">
            <m.h3
              id={`project-${slug}-card-title`}
              layoutId={`project-${slug}-title`}
              transition={morph}
              className="w-fit font-display text-2xl leading-tight text-ink"
            >
              {project.title}
            </m.h3>
            <p className="font-mono text-[11px] text-faint">{project.platforms}</p>
          </div>
          <StatusChip status={project.status} />
        </div>

        {project.summary && (
          <p id={`project-${slug}-card-summary`} className="mt-4 text-ink-2">
            {project.summary}
          </p>
        )}

        {project.video && (
          <m.div
            layoutId={`project-${slug}-video`}
            transition={morph}
            style={{ borderRadius: 12 }}
            className="mt-4 overflow-hidden bg-surface-2 ring-1 ring-line"
          >
            <video
              ref={video}
              src={project.video.src}
              poster={project.video.poster}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden
              className="aspect-video w-full object-cover"
            />
          </m.div>
        )}
        {project.features && (
          <div className="mt-4">
            <Marquee items={project.features} />
          </div>
        )}

        {/* A project with a moving row of features skips the static row of tech. */}
        {!project.features && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <TechChips tech={project.tech} />
          </div>
        )}
      </div>
    </m.div>
  );
}
