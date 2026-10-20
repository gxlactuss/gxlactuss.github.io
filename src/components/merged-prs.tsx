"use client";

import { m, type Variants } from "motion/react";
import { useState } from "react";
import type { Contribution } from "@/lib/github";
import { revealItem } from "./section";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const arrow: Variants = {
  rest: { x: 0, y: 0 },
  hover: { x: 2, y: -2, transition: { type: "spring", stiffness: 500, damping: 20 } },
};

function monthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

/** One pill per org with a merged PR, most PRs first, each with its count. */
export function MergedOrgs({ prs }: { prs: Contribution[] }) {
  const counts = new Map<string, number>();
  for (const pr of prs) {
    const org = pr.repo.split("/")[0];
    counts.set(org, (counts.get(org) ?? 0) + 1);
  }
  const orgs = [...counts].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
  if (orgs.length === 0) return null;

  return (
    <m.div variants={revealItem} className="mb-8 flex flex-wrap justify-center gap-1.5">
      {orgs.map(([org, count]) => (
        <a
          key={org}
          href={`https://github.com/${org}`}
          target="_blank"
          rel="noopener"
          className="inline-flex h-8 items-center gap-2 rounded-full border border-line bg-surface py-0 pl-1 pr-2.5 text-[13px] text-ink-2 transition-[border-color,color,translate] hover:-translate-y-px hover:border-line-strong hover:text-ink"
        >
          <img
            src={`https://github.com/${org}.png?size=40`}
            alt=""
            width={20}
            height={20}
            loading="lazy"
            className="size-5 rounded-full bg-surface-2"
          />
          <span>{org}</span>
          <span className="font-mono text-[11px] text-faint">{count}</span>
        </a>
      ))}
    </m.div>
  );
}

/** PRs shown before "Show all". */
const CAP = 5;

export function MergedPrs({ prs }: { prs: Contribution[] }) {
  const [showAll, setShowAll] = useState(false);
  if (prs.length === 0) return null;

  return (
    <m.div variants={revealItem} className="mt-8">
      <p className="mb-2 font-mono text-xs text-faint">Merged pull requests</p>
      {/* Its own in-view trigger, so the rows stagger when they are reached
          rather than when the top of the section is. */}
      <m.ul
        variants={list}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      >
        {prs.slice(0, CAP).map((pr) => (
          <PrRow key={pr.id} pr={pr} />
        ))}
      </m.ul>
      {/* Mounts after the list above has revealed, so it runs its own stagger. */}
      {showAll && (
        <m.ul variants={list} initial="hidden" animate="show">
          {prs.slice(CAP).map((pr) => (
            <PrRow key={pr.id} pr={pr} />
          ))}
        </m.ul>
      )}
      {prs.length > CAP && (
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((s) => !s)}
          className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
        >
          {showAll ? "Show less" : `Show all (${prs.length})`}
        </button>
      )}
    </m.div>
  );
}

function PrRow({ pr }: { pr: Contribution }) {
  return (
    // The row's hover state lives on the link; the li only takes part in
    // the stagger, since a hover label on it would cut it off from that.
    <m.li variants={revealItem}>
      <m.a
        href={pr.url}
        target="_blank"
        rel="noopener"
        initial="rest"
        animate="rest"
        whileHover="hover"
        className="-mx-3 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M6 21V9a9 9 0 0 0 9 9" />
        </svg>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink-2">{pr.title}</span>
          <span className="block truncate font-mono text-[11px] text-faint">
            {pr.repo} · {monthYear(pr.createdAt)}
          </span>
        </span>
        {pr.additions !== undefined && pr.deletions !== undefined && (
          <span className="shrink-0 font-mono text-[11px] tabular-nums">
            <span className="text-[var(--grid-3)]">+{pr.additions.toLocaleString("en-US")}</span>{" "}
            <span className="text-[#cf222e] dark:text-[#f85149]">−{pr.deletions.toLocaleString("en-US")}</span>
          </span>
        )}
        <m.svg
          variants={arrow}
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-faint"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </m.svg>
      </m.a>
    </m.li>
  );
}
