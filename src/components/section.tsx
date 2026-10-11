"use client";

import { m, type Variants } from "motion/react";
import { CountUp } from "./count-up";

/** Children of a <Reveal> or <Section> that should stagger in use this. */
export const revealItem: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 140, damping: 20 },
  },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/** Fades its revealItem children up, one after another, the first time it scrolls into view. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
    >
      {children}
    </m.div>
  );
}

/**
 * A page section: serif title, a mono counter like "/02" that counts up, and a
 * hairline that draws in from the left. Content below reveals with a stagger.
 */
export function Section({
  id,
  title,
  count,
  aside,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  /** Small mono note on the right of the header, e.g. "1,204 this year". */
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 py-12 sm:py-16">
      <m.header
        className="mb-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <m.h2
            variants={revealItem}
            className="font-display text-[clamp(1.75rem,5vw,2.25rem)] leading-none tracking-tight text-ink"
          >
            {title}
            {count !== undefined && (
              <span className="ml-2 align-top font-mono text-xs tracking-normal text-faint">
                /<CountUp value={count} pad={2} />
              </span>
            )}
          </m.h2>
          {aside && (
            <m.div variants={revealItem} className="font-mono text-xs text-faint">
              {aside}
            </m.div>
          )}
        </div>
        <m.div
          className="mt-4 h-px origin-left bg-line"
          variants={{
            hidden: { scaleX: 0 },
            show: { scaleX: 1, transition: { duration: 0.9, ease: [0.23, 1, 0.32, 1] } },
          }}
        />
      </m.header>
      <Reveal>{children}</Reveal>
    </section>
  );
}
