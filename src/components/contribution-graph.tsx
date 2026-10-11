"use client";

import { AnimatePresence, m, useInView, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ContributionDay } from "@/lib/contributions";
import { CountUp } from "./count-up";
import { revealItem } from "./section";

const LEVELS = [0, 1, 2, 3, 4];
const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
/** Rough half-width of the widest tooltip, so it never pokes past the column. */
const TIP_HALF = 96;

/** Dates are plain YYYY-MM-DD, so read them as UTC or a timezone shifts the day. */
function utc(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

function shortDate(date: string) {
  return utc(date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

const cell: Variants = {
  off: { opacity: 0, scale: 0 },
  on: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 22, delay },
  }),
};

export function ContributionGraph({ days }: { days: ContributionDay[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(boxRef, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const [tip, setTip] = useState<{ i: number; x: number; y: number } | null>(null);
  const open = tip !== null;

  // On a phone the year is wider than the screen; start at the latest week.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  // A tapped tooltip stays up until the next tap somewhere else.
  useEffect(() => {
    if (!open) return;
    const hide = (e: PointerEvent) => {
      if (!gridRef.current?.contains(e.target as Node)) setTip(null);
    };
    document.addEventListener("pointerdown", hide);
    return () => document.removeEventListener("pointerdown", hide);
  }, [open]);

  if (days.length === 0) {
    return (
      <m.p variants={revealItem} className="text-sm text-muted">
        Couldn&apos;t load the graph this time.
      </m.p>
    );
  }

  const total = days.reduce((sum, d) => sum + d.count, 0);
  // Blank slots so the first day lands on its real weekday row.
  const lead = utc(days[0].date).getUTCDay();
  const weeks = Math.ceil((lead + days.length) / 7);

  // A label where each month starts. The partial month at the very start only
  // gets one if the next label is far enough away not to collide with it, and
  // none goes in the last column, where it would hang past the grid.
  const candidates = days.flatMap((d, i) =>
    i === 0 || utc(d.date).getUTCDate() === 1
      ? [{ col: Math.floor((lead + i) / 7), label: utc(d.date).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }) }]
      : [],
  );
  const months = candidates.filter(
    (c, k) => c.col < weeks - 1 && (k > 0 || !candidates[1] || candidates[1].col >= 3),
  );

  function show(target: EventTarget) {
    const el = (target as HTMLElement).closest<HTMLElement>("[data-i]");
    const box = boxRef.current;
    if (!el || !box) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(r.left - b.left + r.width / 2, TIP_HALF), b.width - TIP_HALF);
    setTip({ i: Number(el.dataset.i), x, y: r.top - b.top });
  }

  const active = tip ? days[tip.i] : null;

  return (
    <m.div ref={boxRef} variants={revealItem} className="relative">
      <div ref={scrollRef} className="scroll-thin overflow-x-auto pb-2" onScroll={() => setTip(null)}>
        <m.div
          ref={gridRef}
          role="img"
          aria-label={`${total.toLocaleString("en-US")} contributions in the last year`}
          className="grid w-full min-w-max gap-[3px] [--cell:11px] sm:gap-[2px] sm:[--cell:9px]"
          style={{ gridTemplateColumns: `auto repeat(${weeks}, minmax(var(--cell), 1fr))` }}
          initial="off"
          animate={inView || reduce ? "on" : "off"}
          onPointerOver={(e) => e.pointerType === "mouse" && show(e.target)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setTip(null)}
          onClick={(e) => show(e.target)}
        >
          {months.map((mo) => (
            <span
              key={`${mo.label}-${mo.col}`}
              className="w-0 whitespace-nowrap pb-1 font-mono text-[10px] leading-none text-faint"
              style={{ gridColumn: mo.col + 2, gridRow: 1 }}
            >
              {mo.label}
            </span>
          ))}
          {/* Every row gets a label cell, even blank ones, so the sticky column
              has a solid background for cells to scroll under on mobile. */}
          {WEEKDAYS.map((label, d) => (
            <span
              key={d}
              className="sticky left-0 z-10 flex items-center bg-bg pr-1 font-mono text-[9px] leading-none text-faint"
              style={{ gridColumn: 1, gridRow: d + 2 }}
            >
              {label}
            </span>
          ))}
          {days.map((day, i) => {
            const week = Math.floor((lead + i) / 7);
            const weekday = (lead + i) % 7;
            return (
              <m.div
                key={day.date}
                data-i={i}
                variants={cell}
                custom={reduce ? 0 : (week + weekday) * 0.008}
                className="aspect-square w-full rounded-[3px]"
                style={{
                  gridColumn: week + 2,
                  gridRow: weekday + 2,
                  backgroundColor: `var(--grid-${day.level})`,
                }}
              />
            );
          })}
        </m.div>
      </div>

      <AnimatePresence>
        {tip && active && (
          <m.div
            key="tip"
            className="pointer-events-none absolute z-20 origin-bottom -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted shadow-float"
            style={{ left: tip.x, top: tip.y - 6 }}
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <span className="text-ink">{active.count === 0 ? "No" : active.count}</span> contribution
            {active.count === 1 ? "" : "s"} on {shortDate(active.date)}
          </m.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="font-mono text-xs text-muted">
          <span className="text-ink">
            <CountUp value={total} />
          </span>{" "}
          contributions in the last year
        </p>
        <div className="flex items-center gap-1 font-mono text-[10px] text-faint" aria-hidden="true">
          <span className="mr-1">Less</span>
          {LEVELS.map((level) => (
            <span
              key={level}
              className="size-2.5 rounded-[3px]"
              style={{ backgroundColor: `var(--grid-${level})` }}
            />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>
    </m.div>
  );
}
