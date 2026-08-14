import type { ContributionDay } from "@/lib/contributions";
import { site } from "@/lib/config";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const LEVELS = [0, 1, 2, 3, 4];

/** Dates are plain YYYY-MM-DD, so read them as UTC or a timezone shifts the day. */
function utc(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

function label(date: string, count: number) {
  const when = utc(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${count === 0 ? "No" : count} contribution${count === 1 ? "" : "s"} on ${when}`;
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
    <div>
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

      <div className="max-w-[336px]">
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
            <li key={day.date} className="group relative">
              {/* title gives a native tooltip; aria-label carries it to screen
                  readers. Both mean the widget needs no client-side JS. */}
              <Swatch
                level={day.level}
                className="aspect-square w-full transition-transform group-hover:scale-110"
              />
              <span
                title={label(day.date, day.count)}
                aria-label={label(day.date, day.count)}
                className="absolute inset-0"
              />
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm text-fg-muted">
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
