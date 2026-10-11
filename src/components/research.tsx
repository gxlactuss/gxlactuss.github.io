"use client";

import { m, useReducedMotion } from "motion/react";
import { Fragment } from "react";
import { research, site } from "@/lib/config";
import { revealItem } from "./section";

export function ResearchList() {
  const reduced = useReducedMotion();

  return (
    <div className="grid gap-8">
      {research.map((paper) => (
        <m.div
          key={paper.title}
          variants={revealItem}
          className="border-l border-line pl-4 transition-colors duration-300 hover:border-accent"
        >
          <div className="flex items-center gap-2 font-mono text-[11px] text-faint">
            <span>{paper.year}</span>
            <span aria-hidden>·</span>
            <span className="relative inline-block overflow-hidden rounded-full bg-accent-soft px-2 py-0.5 text-accent">
              {paper.status}
              {/* Sheen: a light band that sweeps across the chip every few seconds. */}
              <m.span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12"
                style={{
                  x: "-150%",
                  background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 40%, transparent), transparent)",
                }}
                animate={reduced ? undefined : { x: ["-150%", "250%"] }}
                transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.9 }}
              />
            </span>
          </div>
          <h3 className="mt-2 font-display text-xl leading-snug text-ink">{paper.title}</h3>
          <p className="mt-1 text-sm">
            {paper.authors.map((author, i) => (
              <Fragment key={author}>
                {i > 0 && <span className="text-muted">, </span>}
                <span className={author === site.name ? "font-medium text-ink" : "text-muted"}>{author}</span>
              </Fragment>
            ))}
          </p>
          <p className="mt-2 text-muted">{paper.hook}</p>
        </m.div>
      ))}
    </div>
  );
}
