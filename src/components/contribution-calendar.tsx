import type { ContributionDay } from "@/lib/contributions";
import { site } from "@/lib/config";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const LEVELS = [0, 1, 2, 3, 4];

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

function countLabel(count: number) {
  return `${count === 0 ? "No" : count} contribution${count === 1 ? "" : "s"}`;
}

function Swatch({ level, className = "" }: { level: number; className?: string }) {
  return (
    <span
      className={`block rounded-[4px] ${level === 0 ? "ring-1 ring-inset ring-border" : ""} ${className}`}
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

  // Blank cells so the first day lands under its real weekday column.
  const leadingBlanks = utc(first.date).getUTCDay();

  const range = `${utc(first.date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })} – ${utc(
    last.date,
  ).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`;

  return (
    // Fixed to the grid's own width and centred, so the caption row, the cells
    // and the total all share one set of edges instead of three.
    <div className="mx-auto w-[336px] max-w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="font-mono text-xs text-fg-muted">{range}</span>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-fg-muted">
          <span>Less</span>
          {LEVELS.map((l) => (
            <Swatch key={l} level={l} className="size-2.5" />
          ))}
          <span>More</span>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1.5" aria-hidden="true">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="text-center font-mono text-[11px] text-fg-muted">
              {d}
            </span>
          ))}
        </div>

        <ul className="mt-1.5 grid grid-cols-7 gap-1.5">
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <li key={`blank-${i}`} aria-hidden="true" />
          ))}
          {days.map((day) => (
            // tabIndex makes the tooltip reachable by keyboard as well as
            // hover; group-focus-within drives the same reveal.
            <li
              key={day.date}
              tabIndex={0}
              aria-label={`${countLabel(day.count)} on ${longDate(day.date)}`}
              className="group relative rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Swatch
                level={day.level}
                className="aspect-square w-full transition-transform group-hover:scale-110"
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

      <p className="mt-4 text-center text-sm text-fg-muted">
        <strong className="font-medium text-fg">{total}</strong> contributions in the last{" "}
        {days.length} days ·{" "}
        <a
          href={`https://github.com/${site.github}`}
          rel="me noopener"
          className="underline hover:text-accent"
        >
          github.com/{site.github}
        </a>
      </p>
    </div>
  );
}
