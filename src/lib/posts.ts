import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  /** ISO date string, e.g. "2026-08-14". */
  date: string;
  draft: boolean;
};

export type Post = PostMeta & { content: string };

/** Posts newest first. Drafts are excluded outside of `next dev`. */
export async function getPosts(): Promise<PostMeta[]> {
  let files: string[];
  try {
    files = await fs.readdir(POSTS_DIR);
  } catch {
    return [];
  }

  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(POSTS_DIR, file), "utf8");
        const { data } = matter(raw);
        return toMeta(file.replace(/\.mdx$/, ""), data);
      }),
  );

  const showDrafts = process.env.NODE_ENV === "development";
  return posts
    .filter((p) => showDrafts || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | null> {
  // Guard against traversal via the dynamic route segment.
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;

  try {
    const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");
    const { data, content } = matter(raw);
    return { ...toMeta(slug, data), content };
  } catch {
    return null;
  }
}

function toMeta(slug: string, data: Record<string, unknown>): PostMeta {
  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ""),
    draft: data.draft === true,
  };
}

export function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
