import { site } from "./config";
import { headers as githubHeaders } from "./github";

export type Contest = {
  title: string;
  slug: string;
  /** Unix seconds. */
  startTime: number;
  rank: number;
  rating: number;
  solved: number;
  total: number;
};

export type LeetCodeStats = {
  rating: number;
  globalRank: number;
  totalParticipants: number;
  topPercentage: number;
  badge?: string;
  /** Rated contests, oldest first. */
  contests: Contest[];
  /** Every problem solved, from the solutions repo README, or null if it couldn't be read. */
  solved: Solved | null;
};

export type Solved = { easy: number; medium: number; hard: number };

const query = `query ($username: String!) {
  userContestRanking(username: $username) {
    rating globalRanking totalParticipants topPercentage badge { name }
  }
  userContestRankingHistory(username: $username) {
    attended rating ranking problemsSolved totalProblems contest { title titleSlug startTime }
  }
}`;

type Response = {
  data?: {
    userContestRanking: {
      rating: number;
      globalRanking: number;
      totalParticipants: number;
      topPercentage: number;
      badge: { name: string } | null;
    } | null;
    userContestRankingHistory:
      | {
          attended: boolean;
          rating: number;
          ranking: number;
          problemsSolved: number;
          totalProblems: number;
          contest: { title: string; titleSlug: string; startTime: number };
        }[]
      | null;
  };
};

/**
 * Contest stats from LeetCode's public GraphQL endpoint, which needs no login.
 * Like the GitHub data it sends no CORS headers, so it runs at build time and
 * the daily rebuild keeps it current. Returns null if LeetCode says no, and the
 * section hides.
 */
export async function getLeetCodeStats(): Promise<LeetCodeStats | null> {
  try {
    const res = await ask(query, { username: site.leetcode });
    if (!res.ok) return null;
    const { data } = (await res.json()) as Response;
    const ranking = data?.userContestRanking;
    if (!ranking) return null;

    // Contests registered for but never submitted in come back as attended
    // with rank 0, so they are left out.
    const contests = (data.userContestRankingHistory ?? [])
      .filter((c) => c.attended && c.ranking > 0)
      .map((c) => ({
        title: c.contest.title,
        slug: c.contest.titleSlug,
        startTime: c.contest.startTime,
        rank: c.ranking,
        rating: Math.round(c.rating),
        solved: c.problemsSolved,
        total: c.totalProblems,
      }));

    return {
      rating: Math.round(ranking.rating),
      globalRank: ranking.globalRanking,
      totalParticipants: ranking.totalParticipants,
      topPercentage: ranking.topPercentage,
      badge: ranking.badge?.name,
      contests,
      solved: await getSolved(),
    };
  } catch {
    return null;
  }
}

function ask(query: string, variables?: Record<string, string>) {
  return fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
      "User-Agent": "Mozilla/5.0 (compatible; personal-site-build)",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });
}

/**
 * Solved problems by difficulty, read from the table in the solutions repo's
 * README (`| Total | Easy | Medium | Hard |`).
 */
async function getSolved(): Promise<Solved | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${site.solutions}/readme`, {
      headers: { ...githubHeaders, Accept: "application/vnd.github.raw+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const match = (await res.text()).match(/^\|\s*\d+\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/m);
    if (!match) return null;
    return { easy: Number(match[1]), medium: Number(match[2]), hard: Number(match[3]) };
  } catch {
    return null;
  }
}
