import { site } from "./config";

export type Contribution = {
  id: number;
  title: string;
  url: string;
  /** "owner/repo" pulled out of the PR's API url. */
  repo: string;
  state: "merged" | "open" | "closed";
  createdAt: string;
};

type SearchItem = {
  id: number;
  title: string;
  html_url: string;
  repository_url: string;
  state: "open" | "closed";
  created_at: string;
  pull_request?: { merged_at: string | null };
};

/**
 * Public PRs the user opened against repos they don't own. Unauthenticated the
 * search API allows 10 requests/min, which the 1h revalidate stays well under —
 * set GITHUB_TOKEN to raise the ceiling and avoid throttling on cold deploys.
 */
export async function getContributions(): Promise<Contribution[]> {
  const query = `type:pr author:${site.github} is:public -user:${site.github}`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=created&order=desc&per_page=50`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
    next: { revalidate: 3600 },
  });

  // A rate limit or outage shouldn't take down the whole page — the section
  // renders empty and recovers on the next revalidate.
  if (!res.ok) return [];

  const data = (await res.json()) as { items?: SearchItem[] };
  if (!data.items) return [];

  return data.items.map((item) => ({
    id: item.id,
    title: item.title,
    url: item.html_url,
    repo: item.repository_url.replace("https://api.github.com/repos/", ""),
    state: item.pull_request?.merged_at ? "merged" : item.state,
    createdAt: item.created_at,
  }));
}
