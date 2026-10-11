import { site } from "./config";

export type Contest = {
  title: string;
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
};

const query = `query ($username: String!) {
  userContestRanking(username: $username) {
    rating globalRanking totalParticipants topPercentage badge { name }
  }
  userContestRankingHistory(username: $username) {
    attended rating ranking problemsSolved totalProblems contest { title startTime }
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
          contest: { title: string; startTime: number };
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
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        "User-Agent": "Mozilla/5.0 (compatible; personal-site-build)",
      },
      body: JSON.stringify({ query, variables: { username: site.leetcode } }),
      next: { revalidate: 3600 },
    });
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
    };
  } catch {
    return null;
  }
}
