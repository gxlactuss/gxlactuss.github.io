"use client";

import { m } from "motion/react";
import { site } from "@/lib/config";
import type { LeetCodeStats, Solved } from "@/lib/leetcode";
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
  const recent = stats.contests.slice(-3).reverse();

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

      {recent.length > 0 && (
        <m.div variants={revealItem} className="mt-8">
          <p className="mb-2 font-mono text-xs text-faint">Recent contests</p>
          <ul>
            {recent.map((c) => (
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

      {stats.solved && <ProblemsSolved solved={stats.solved} />}

      <m.div variants={revealItem} className="mt-5 grid grid-cols-2 gap-2">
        <LinkButton href={`https://leetcode.com/u/${site.leetcode}/`}>LeetCode profile</LinkButton>
        <LinkButton href={`https://github.com/${site.solutions}`}>All my solutions</LinkButton>
      </m.div>
    </>
  );
}

const levels = [
  { key: "easy", label: "Easy", color: "var(--live)" },
  { key: "medium", label: "Med.", color: "var(--accent)" },
  { key: "hard", label: "Hard", color: "light-dark(#cf222e, #f85149)" },
] as const;

/** Share of the ring the arc covers, leaving the bottom open like LeetCode's. */
const ARC = 75;
const GAP = 3;

/** Solved problems split by difficulty, as LeetCode's ring. */
function ProblemsSolved({ solved }: { solved: Solved }) {
  const counts = levels.map((l) => solved[l.key]);
  const total = counts.reduce((sum, n) => sum + n, 0);

  // Each difficulty gets a slice of the arc sized by its count, with a small gap between.
  const usable = ARC - GAP * (levels.length - 1);
  let start = 0;
  const segments = counts.map((n) => {
    const len = (n / total) * usable;
    const seg = { start, len };
    start += len + GAP;
    return seg;
  });

  return (
    <m.div variants={revealItem} className="mt-8">
      <p className="mb-3 font-mono text-xs text-faint">Problems solved</p>
      <div className="flex items-center gap-5 rounded-xl border border-line bg-surface p-4">
        <div className="relative size-32 shrink-0">
          {/* Rotated so the arc starts bottom-left and runs clockwise over the top. */}
          <svg viewBox="0 0 100 100" className="size-full rotate-[135deg]" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="44"
              pathLength="100"
              fill="none"
              stroke="var(--line)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${ARC} 100`}
            />
            {segments.map((s, i) => (
              <m.circle
                key={levels[i].key}
                cx="50"
                cy="50"
                r="44"
                pathLength="100"
                fill="none"
                stroke={levels[i].color}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDashoffset={-s.start}
                initial={{ strokeDasharray: "0 100" }}
                whileInView={{ strokeDasharray: `${s.len} 100` }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.25, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl leading-none text-ink">
              <CountUp value={total} />
            </span>
            <span className="mt-1 font-mono text-[11px] text-faint">Solved</span>
          </div>
        </div>
        <ul className="flex min-w-0 flex-1 flex-col gap-2">
          {levels.map((l, i) => (
            <li
              key={l.key}
              className="flex flex-col items-center rounded-lg bg-surface-2 px-3 py-1.5 text-center"
            >
              <span className="text-xs font-medium" style={{ color: l.color }}>
                {l.label}
              </span>
              <span className="text-sm text-ink tabular-nums">{counts[i]}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-sm text-muted">
        I solve most problems in an Xcode playground. Its debugger makes it easy to see exactly where a solution goes
        wrong, and it doubles as practice for quickly debugging real projects.
      </p>
    </m.div>
  );
}

function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-sm text-accent transition-[border-color,translate] hover:-translate-y-px hover:border-line-strong"
    >
      {children} <span aria-hidden="true">↗</span>
    </a>
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
      <m.svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={`Contest rating went from ${ratings[0]} to ${ratings.at(-1)} over ${contests.length} contests`}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <defs>
          {/* The line draws in by widening this clip. Animating pathLength instead
              ends short of the last point, since the non-scaling stroke measures
              its dashes in screen pixels once the chart is scaled up. */}
          <clipPath id="rating-reveal">
            <m.rect
              x={-10}
              y={-10}
              height={H + 20}
              variants={{
                hidden: { width: 0 },
                show: { width: W + 20, transition: { duration: 1.1, ease: [0.23, 1, 0.32, 1] } },
              }}
            />
          </clipPath>
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
        <path
          d={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          clipPath="url(#rating-reveal)"
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
      </m.svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-faint">
        <span>{monthYear(contests[0].startTime)}</span>
        <span>{monthYear(contests.at(-1)!.startTime)}</span>
      </div>
    </m.div>
  );
}
