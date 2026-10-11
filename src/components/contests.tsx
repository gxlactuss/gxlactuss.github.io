"use client";

import { m } from "motion/react";
import { site } from "@/lib/config";
import type { LeetCodeStats } from "@/lib/leetcode";
import { CountUp } from "./count-up";
import { revealItem } from "./section";

function monthYear(seconds: number) {
  return new Date(seconds * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

/** "Weekly Contest 519" reads as "Weekly 519" in the tight rows. */
function shortTitle(title: string) {
  return title.replace(" Contest", "");
}

export function Contests({ stats }: { stats: LeetCodeStats }) {
  const best = [...stats.contests].sort((a, b) => a.rank - b.rank).slice(0, 3);

  return (
    <>
      <m.div variants={revealItem} className="grid grid-cols-3 gap-2">
        <Tile label={stats.badge ? `${stats.badge} rating` : "rating"}>
          <CountUp value={stats.rating} />
        </Tile>
        <Tile label={`of ${stats.totalParticipants.toLocaleString("en-US")}`}>
          #<CountUp value={stats.globalRank} />
        </Tile>
        <Tile label="worldwide">Top {stats.topPercentage}%</Tile>
      </m.div>

      {stats.contests.length > 1 && <RatingChart stats={stats} />}

      {best.length > 0 && (
        <m.div variants={revealItem} className="mt-8">
          <p className="mb-2 font-mono text-xs text-faint">Best finishes</p>
          <ul>
            {best.map((c) => (
              <li key={c.title} className="flex min-h-11 items-center gap-3 border-b border-line py-2 last:border-b-0">
                <span className="w-16 shrink-0 font-mono text-sm text-accent tabular-nums">
                  #{c.rank.toLocaleString("en-US")}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink-2">{shortTitle(c.title)}</span>
                <span className="shrink-0 font-mono text-[11px] text-faint">
                  {c.solved}/{c.total} solved · {monthYear(c.startTime)}
                </span>
              </li>
            ))}
          </ul>
        </m.div>
      )}

      <m.p variants={revealItem} className="mt-5">
        <a
          href={`https://leetcode.com/u/${site.leetcode}/`}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-accent"
        >
          LeetCode profile <span aria-hidden="true">↗</span>
        </a>
      </m.p>
    </>
  );
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-3">
      <p className="font-display text-[clamp(1.4rem,4.5vw,1.9rem)] leading-tight text-ink tabular-nums">{children}</p>
      <p className="mt-1 font-mono text-[11px] text-faint">{label}</p>
    </div>
  );
}

const W = 600;
const H = 140;
const PAD = { x: 8, top: 14, bottom: 8 };

/** Rating after each contest, as a line that draws in when it scrolls into view. */
function RatingChart({ stats }: { stats: LeetCodeStats }) {
  const { contests } = stats;
  const ratings = contests.map((c) => c.rating);
  const lo = Math.min(...ratings) - 20;
  const hi = Math.max(...ratings) + 20;
  const points = contests.map((c, i) => ({
    x: PAD.x + (i / (contests.length - 1)) * (W - PAD.x * 2),
    y: PAD.top + (1 - (c.rating - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom),
    contest: c,
  }));
  const line = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${points.at(-1)!.x.toFixed(1)},${H} L${points[0].x.toFixed(1)},${H} Z`;

  return (
    <m.div variants={revealItem} className="mt-6">
      <div className="mb-2 flex items-baseline justify-between font-mono text-xs text-faint">
        <span>Rating</span>
        <span>
          {ratings[0]} → <span className="text-ink">{ratings.at(-1)}</span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={`Contest rating went from ${ratings[0]} to ${ratings.at(-1)} over ${contests.length} contests`}
      >
        <defs>
          <linearGradient id="rating-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <m.path
          d={area}
          fill="url(#rating-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
        />
        <m.path
          d={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
        />
        {points.map((p, i) => (
          <m.circle
            key={p.contest.title}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="var(--bg)"
            stroke="var(--accent)"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + (i / points.length) * 0.9 }}
          >
            <title>{`${p.contest.title}: rank ${p.contest.rank.toLocaleString("en-US")}, rating ${p.contest.rating}`}</title>
          </m.circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-faint">
        <span>{monthYear(contests[0].startTime)}</span>
        <span>{monthYear(contests.at(-1)!.startTime)}</span>
      </div>
    </m.div>
  );
}
