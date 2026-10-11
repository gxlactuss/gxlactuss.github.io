"use client";

import { m, type Variants } from "motion/react";
import { friends } from "@/lib/config";
import { revealItem } from "./section";

const spring = { type: "spring", stiffness: 400, damping: 18 } as const;

const avatar: Variants = {
  rest: { y: 0, scale: 1, transition: spring },
  hover: { y: -6, scale: 1.08, transition: spring },
};

const tooltip: Variants = {
  rest: { opacity: 0, y: 4, scale: 0.9, transition: spring },
  hover: { opacity: 1, y: 0, scale: 1, transition: spring },
};

export function Friends() {
  return (
    <m.div variants={revealItem}>
      <p className="mb-5 text-sm text-muted">People who build cool things, go see their sites.</p>
      <ul className="flex flex-wrap gap-5">
        {friends.map((f) => (
          <li key={f.href}>
            <m.a
              href={f.href}
              target="_blank"
              rel="noopener"
              initial="rest"
              animate="rest"
              whileHover="hover"
              className="group relative flex flex-col items-center gap-1.5"
            >
              {/* Hover devices get a tooltip; touch screens show the name underneath instead. */}
              <m.span
                variants={tooltip}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-full mb-3 origin-bottom whitespace-nowrap rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-ink-2 shadow-float [@media(hover:none)]:hidden"
              >
                {f.name}
              </m.span>
              <m.span variants={avatar} className="block rounded-full">
                <img
                  src={f.avatar}
                  alt={f.name}
                  width={48}
                  height={48}
                  loading="lazy"
                  className="size-12 rounded-full bg-surface-2 ring-2 ring-line transition-shadow group-hover:ring-accent"
                />
              </m.span>
              <span
                aria-hidden="true"
                className="font-mono text-[11px] text-faint [@media(hover:hover)]:hidden"
              >
                {f.name}
              </span>
            </m.a>
          </li>
        ))}
      </ul>
    </m.div>
  );
}
