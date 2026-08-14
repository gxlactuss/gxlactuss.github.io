"use client";

import { useMemo, useState } from "react";
import type { Contribution } from "@/lib/github";

const filters = ["all", "merged", "open", "closed"] as const;
type Filter = (typeof filters)[number];

const stateStyles: Record<Contribution["state"], string> = {
  merged: "text-[oklch(0.62_0.19_305)]",
  open: "text-[oklch(0.6_0.15_150)]",
  closed: "text-[oklch(0.6_0.19_25)]",
};

export function Contributions({ items }: { items: Contribution[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length, merged: 0, open: 0, closed: 0 };
    for (const item of items) c[item.state]++;
    return c;
  }, [items]);

  const shown = filter === "all" ? items : items.filter((i) => i.state === filter);

  if (items.length === 0) {
    return <p className="text-sm text-fg-muted">No contributions to show right now.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md border px-2 py-1 text-xs transition-colors ${
              filter === f
                ? "border-accent text-accent"
                : "border-border text-fg-muted hover:border-fg-muted hover:text-fg"
            }`}
          >
            {f} <span className="tabular-nums opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {shown.map((item) => (
          <li key={item.id} className="py-2.5">
            <a href={item.url} className="group flex items-baseline gap-3" rel="noopener">
              <span className={`font-mono text-xs ${stateStyles[item.state]}`}>●</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm group-hover:text-accent">{item.title}</span>
                <span className="font-mono text-xs text-fg-muted">{item.repo}</span>
              </span>
              <time
                dateTime={item.createdAt}
                className="shrink-0 font-mono text-xs text-fg-muted tabular-nums"
              >
                {item.createdAt.slice(0, 7)}
              </time>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
