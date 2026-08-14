import { site } from "./config";

export type ContributionDay = {
  /** "YYYY-MM-DD" */
  date: string;
  count: number;
  /** 0–4, GitHub's own intensity bucket. */
  level: number;
};

/**
 * Scraped from GitHub's own contributions fragment rather than the GraphQL API,
 * because that endpoint needs no token — the site can build anywhere, including
 * a fork, with no secret configured.
 *
 * It sends no CORS headers, so this cannot run in a browser. That's fine: the
 * site is a static export, so this runs at build time and the result is baked
 * into the HTML. The deploy workflow reruns on a schedule to keep it current.
 */
export async function getContributionDays(days = 30): Promise<ContributionDay[]> {
  const url = `https://github.com/users/${site.github}/contributions`;

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "text/html",
        // GitHub serves this fragment to anything with a normal UA.
        "User-Agent": "Mozilla/5.0 (compatible; personal-site-build)",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    html = await res.text();
  } catch {
    // A build must never fail because GitHub had a bad minute.
    return [];
  }

  return parseContributions(html).slice(-days);
}

/** Exported for the parser test in scripts/. */
export function parseContributions(html: string): ContributionDay[] {
  // Counts live in sibling <tool-tip> elements keyed by the cell's id, so build
  // that lookup first. "No contributions on …" has no leading number.
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const [, id, text] = m;
    const n = /^(\d+)/.exec(text.trim());
    counts.set(id, n ? Number(n[1]) : 0);
  }

  const days: ContributionDay[] = [];
  // Attribute order on the cell isn't guaranteed, so grab the whole tag and
  // read each attribute out of it separately.
  for (const m of html.matchAll(/<td[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g)) {
    const tag = m[0];
    const date = /\bdata-date="(\d{4}-\d{2}-\d{2})"/.exec(tag)?.[1];
    if (!date) continue; // Padding cells at the start of the first week.
    const id = /\bid="([^"]+)"/.exec(tag)?.[1];
    const level = Number(/\bdata-level="(\d)"/.exec(tag)?.[1] ?? 0);
    days.push({ date, count: id ? (counts.get(id) ?? 0) : 0, level });
  }

  // The grid is laid out in columns (weeks), so document order is not date
  // order — sort before anyone slices a "last N days" off the end.
  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}
