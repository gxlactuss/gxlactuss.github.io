import { site } from "./config";

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
  /** Problems solved in contests by difficulty, or null if LeetCode didn't say. */
  contestSolved: Solved | null;
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
      contestSolved: await getContestSolved(contests),
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
 * Difficulty of each problem solved in contests. The public data only says how
 * many of a contest's problems were solved, not which, so this counts the first
 * N in contest order. They are ordered by difficulty and nearly always solved
 * that way.
 */
async function getContestSolved(contests: Contest[]): Promise<Solved | null> {
  const played = contests.filter((c) => c.solved > 0);
  if (played.length === 0) return { easy: 0, medium: 0, hard: 0 };
  try {
    const listRes = await ask(
      `{ ${played.map((c, i) => `c${i}: contestQuestionList(contestSlug: "${c.slug}") { titleSlug }`).join(" ")} }`,
    );
    if (!listRes.ok) return null;
    const lists = ((await listRes.json()) as { data?: Record<string, { titleSlug: string }[] | null> }).data;
    if (!lists) return null;
    const slugs = played.flatMap((c, i) => (lists[`c${i}`] ?? []).slice(0, c.solved).map((q) => q.titleSlug));

    const diffRes = await ask(
      `{ ${slugs.map((slug, i) => `q${i}: question(titleSlug: "${slug}") { difficulty }`).join(" ")} }`,
    );
    if (!diffRes.ok) return null;
    const diffs = ((await diffRes.json()) as { data?: Record<string, { difficulty: string } | null> }).data;
    if (!diffs) return null;

    const solved: Solved = { easy: 0, medium: 0, hard: 0 };
    for (const q of Object.values(diffs)) {
      const key = q?.difficulty.toLowerCase();
      if (key === "easy" || key === "medium" || key === "hard") solved[key]++;
    }
    return solved;
  } catch {
    return null;
  }
}
