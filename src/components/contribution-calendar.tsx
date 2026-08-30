import type { ContributionDay } from "@/lib/contributions";
import { site } from "@/lib/config";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const LEVELS = [0, 1, 2, 3, 4];

/**
 * Cell geometry, in px. Columns are weeks, so a year is ~53 of them: at this
 * pitch that is about 750px, which fits the column on a laptop and scrolls
 * below it. These are shared with the month labels, which are positioned by
 * arithmetic rather than by flow, so they have to agree.
 */
const CELL = 11;
const GAP = 3;
const PITCH = CELL + GAP;
/** Room for the weekday initials down the left. */
const GUTTER = 18;

/** Dates are plain YYYY-MM-DD, so read them as UTC or a timezone shifts the day. */
function utc(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

/** 1st, 2nd, 3rd, 4th … with the 11–13 exception English insists on. */
function ordinal(n: number) {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/** "8th August 2026" */
function longDate(date: string) {
  const d = utc(date);
  const month = d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  return `${ordinal(d.getUTCDate())} ${month} ${d.getUTCFullYear()}`;
}

/** "Aug 2025" */
function monthYear(date: string) {
  return utc(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function countLabel(count: number) {
  return `${count === 0 ? "No" : count} contribution${count === 1 ? "" : "s"}`;
}

function Swatch({ level, className = "" }: { level: number; className?: string }) {
  return (
    <span
      className={`block rounded-[3px] ${level === 0 ? "ring-1 ring-inset ring-border" : ""} ${className}`}
      style={{ backgroundColor: `var(--gh-${level})` }}
    />
  );
}

export function ContributionCalendar({ days }: { days: ContributionDay[] }) {
  if (days.length === 0) {
    return <p className="text-sm text-fg-muted">Contribution data is unavailable right now.</p>;
  }

  const total = days.reduce((sum, d) => sum + d.count, 0);
  const first = days[0];
  const last = days[days.length - 1];
  const span = days.length >= 360 ? "year" : `${days.length} days`;

  // Blank cells so the first day lands on its real weekday row.
  const leadingBlanks = utc(first.date).getUTCDay();
  const columns = Math.ceil((leadingBlanks + days.length) / 7);

  // One label per month, at the column the month first appears in — but never
  // within three columns of the previous one, because at a 14px pitch two
  // labels that close overlap and read as a single word.
  const months: { label: string; column: number }[] = [];
  days.forEach((day, i) => {
    const d = utc(day.date);
    if (d.getUTCDate() > 7) return; // only the column the month opens in
    const column = Math.floor((leadingBlanks + i) / 7);
    const label = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    const previous = months[months.length - 1];
    if (previous && (previous.label === label || column - previous.column < 3)) return;
    months.push({ label, column });
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="font-mono text-xs text-fg-muted">
          {monthYear(first.date)} – {monthYear(last.date)}
        </span>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-fg-muted">
          <span>Less</span>
          {LEVELS.map((level) => (
            <Swatch key={level} level={level} className="size-[11px]" />
          ))}
          <span>More</span>
        </div>
      </div>

      {/*
        The padding is what the tooltips live in. `overflow-x-auto` clips on both
        axes, so a tooltip drawn above the top row would be cut off; the padding
        gives it room inside the clip box and the matching negative margin takes
        the space back out of the layout.
      */}
      {/*
        `gh-sweep` has to sit on this element rather than on the grid inside it.
        A `view()` timeline binds to the nearest scroll container, and this one
        is a scroll container on both axes — so measured from in here, the grid
        never enters or leaves anything and the sweep sits frozen mid-way. Out
        here the timeline resolves against the viewport, which is what it means.
      */}
      <div className="gh-sweep -mt-10 overflow-x-auto pb-1 pt-10">
        <div className="w-max">
          <div className="relative mb-1 h-3.5" style={{ marginLeft: GUTTER }}>
            {months.map((m) => (
              <span
                key={`${m.label}-${m.column}`}
                className="absolute top-0 font-mono text-[10px] leading-none text-fg-muted"
                style={{ left: m.column * PITCH }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            {/* Every other initial, the way GitHub labels it — all seven at this
                size is a wall of letters taller than the row it names. */}
            <div
              className="flex flex-col font-mono text-[9px] leading-none text-fg-muted"
              style={{ gap: GAP, width: GUTTER - GAP }}
              aria-hidden="true"
            >
              {WEEKDAYS.map((d, i) => (
                <span key={i} className="flex items-center" style={{ height: CELL }}>
                  {i % 2 === 1 ? d : ""}
                </span>
              ))}
            </div>

            {/* Column-major fill: one grid, seven rows, flowing down each week
                before moving to the next. */}
            <ul
              className="grid grid-flow-col grid-rows-7"
              style={{ gap: GAP, gridTemplateColumns: `repeat(${columns}, ${CELL}px)` }}
            >
              {Array.from({ length: leadingBlanks }, (_, i) => (
                <li key={`blank-${i}`} aria-hidden="true" style={{ width: CELL, height: CELL }} />
              ))}
              {days.map((day) => (
                // tabIndex makes the tooltip reachable by keyboard as well as
                // hover; group-focus-within drives the same reveal.
                <li
                  key={day.date}
                  tabIndex={0}
                  aria-label={`${countLabel(day.count)} on ${longDate(day.date)}`}
                  className="group relative rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  style={{ width: CELL, height: CELL }}
                >
                  <Swatch
                    level={day.level}
                    className="size-full transition-transform group-hover:scale-125"
                  />

                  {/* Rendered up front and revealed with CSS, so the whole widget
                      still ships zero client-side JavaScript. */}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-bg-subtle px-2 py-1.5 text-center shadow-lg group-hover:block group-focus-within:block"
                  >
                    <span className="block text-xs font-medium text-fg">
                      {countLabel(day.count)}
                    </span>
                    <span className="block font-mono text-[11px] text-fg-muted">
                      {longDate(day.date)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-fg-muted">
        <strong className="font-medium text-fg">{total}</strong> contributions in the last {span} ·{" "}
        <a
          href={`https://github.com/${site.github}`}
          rel="me noopener"
          className="whitespace-nowrap underline hover:text-accent"
        >
          github.com/{site.github}
        </a>
      </p>
    </div>
  );
}
