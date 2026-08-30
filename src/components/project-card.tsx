"use client";

import Image from "next/image";
import Link from "next/link";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { useRef, ViewTransition } from "react";
import { Highlight } from "@/components/highlight";
import type { Project } from "@/lib/config";

export function ProjectCard({ project }: { project: Project }) {
  // MotionConfig's `reducedMotion="user"` suppresses the *animation* but still
  // applies its end state, which for a hover lift means the card snaps up three
  // pixels with no motion at all — the jump without the point of it. The
  // gesture has to come off entirely, so it is dropped at the source.
  const reduced = useReducedMotion();

  // The glow is written straight onto the node rather than held in state: this
  // fires on every pointer move, and re-rendering a card at that rate to change
  // two numbers would be the most expensive thing on the page.
  const glow = useRef<HTMLSpanElement>(null);

  function trackGlow(event: React.PointerEvent<HTMLElement>) {
    // Coarse pointers have no hover, so the only time this would fire is
    // mid-tap, leaving the ring lit on a card the finger has already left.
    if (event.pointerType !== "mouse") return;
    const node = glow.current;
    if (!node) return;
    const box = event.currentTarget.getBoundingClientRect();
    node.style.setProperty("--glow-x", `${event.clientX - box.left}px`);
    node.style.setProperty("--glow-y", `${event.clientY - box.top}px`);
    node.style.opacity = "1";
  }

  function clearGlow() {
    if (glow.current) glow.current.style.opacity = "0";
  }

  return (
    // A spring rather than a CSS transition, because a card is a thing you
    // sweep the pointer across: an eased 150ms transition restarts from
    // wherever it was interrupted and stutters when you cross three of these in
    // a row, while a spring carries its velocity through and settles once.
    //
    // Deliberately no entrance animation to go with it. The section around this
    // already fades in on scroll, and a mount animation here would fight the
    // return trip — coming back from a project page, the logo is mid-morph into
    // a card that would be busy animating itself out of `opacity: 0`.
    <m.article
      whileHover={reduced ? undefined : { y: -3 }}
      whileTap={reduced ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.5 }}
      onPointerMove={trackGlow}
      onPointerLeave={clearGlow}
      // The flat `hover:border-accent/60` is gone deliberately: the ring below
      // lights the border under the cursor, and running both meant the whole
      // outline changed colour *and* one part of it glowed, which read as two
      // effects arguing rather than one.
      className="group relative rounded-lg border border-border bg-bg-subtle/40"
    >
      {/*
        The border, lit where the pointer is. `-inset-px` puts this exactly over
        the card's own 1px border rather than inside it, and the two masks
        composited with `exclude` knock the middle out so only that 1px ring
        paints — a gradient drawn edge to edge would wash the whole card.

        Kept under reduced motion. Nothing here moves on its own: the highlight
        tracks the pointer one-to-one, which makes it a hover state that happens
        to have a position, the same call made for the scroll progress bar.
      */}
      <span
        ref={glow}
        aria-hidden="true"
        className="glow-ring pointer-events-none absolute -inset-px rounded-lg opacity-0 transition-opacity duration-300"
      />
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
    </m.article>
  );
}
