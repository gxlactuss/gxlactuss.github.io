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
  /** Every problem solved, from the solutions repo plus contests, or null if either source didn't answer. */
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
      solved: await getSolved(contests),
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
 * Solved problems by difficulty: every `<number>.swift` in the solutions repo,
 * plus problems solved in contests, counted once each.
 *
 * The public contest data only says how many of a contest's problems were
 * solved, not which, so this takes the first N in contest order. They are
 * ordered by difficulty and nearly always solved that way.
 */
async function getSolved(contests: Contest[]): Promise<Solved | null> {
  try {
    const played = contests.filter((c) => c.solved > 0);
    const [treeRes, problemsRes, listRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${site.solutions}/git/trees/HEAD?recursive=1`, {
        headers: githubHeaders,
        next: { revalidate: 3600 },
      }),
      // Every problem's number, slug and difficulty (1 easy, 2 medium, 3 hard) in one response.
      fetch("https://leetcode.com/api/problems/all/", {
        headers: { Referer: "https://leetcode.com", "User-Agent": "Mozilla/5.0 (compatible; personal-site-build)" },
        next: { revalidate: 3600 },
      }),
      played.length
        ? ask(`{ ${played.map((c, i) => `c${i}: contestQuestionList(contestSlug: "${c.slug}") { titleSlug }`).join(" ")} }`)
        : null,
    ]);
    if (!treeRes.ok || !problemsRes.ok || (listRes && !listRes.ok)) return null;

    const { tree } = (await treeRes.json()) as { tree: { path: string }[] };
    const { stat_status_pairs: problems } = (await problemsRes.json()) as {
      stat_status_pairs: { stat: { frontend_question_id: number; question__title_slug: string }; difficulty: { level: number } }[];
    };
    const lists = listRes
      ? ((await listRes.json()) as { data?: Record<string, { titleSlug: string }[] | null> }).data ?? {}
      : {};

    const levelById = new Map(problems.map((p) => [p.stat.frontend_question_id, p.difficulty.level]));
    const idBySlug = new Map(problems.map((p) => [p.stat.question__title_slug, p.stat.frontend_question_id]));

    const ids = new Set<number>();
    for (const { path } of tree) {
      const match = path.match(/(?:^|\/)(\d+)\.swift$/);
      if (match) ids.add(Number(match[1]));
    }
    played.forEach((c, i) => {
      for (const q of (lists[`c${i}`] ?? []).slice(0, c.solved)) {
        const id = idBySlug.get(q.titleSlug);
        if (id) ids.add(id);
      }
    });

    const solved: Solved = { easy: 0, medium: 0, hard: 0 };
    const keys: Record<number, keyof Solved | undefined> = { 1: "easy", 2: "medium", 3: "hard" };
    for (const id of ids) {
      const key = keys[levelById.get(id) ?? 0];
      if (key) solved[key]++;
    }
    return solved;
  } catch {
    return null;
  }
}
