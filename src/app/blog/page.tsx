import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Posts on things I've built and things I've broken.",
};

export default async function BlogIndex() {
  const posts = await getPosts();

  return (
    <div className="py-16">
      <h1 className="text-2xl font-medium tracking-tight">Writing</h1>

      {posts.length === 0 ? (
        <p className="mt-4 text-sm text-fg-muted">Nothing published yet.</p>
      ) : (
        <ul className="mt-8 grid gap-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-medium group-hover:text-accent">{post.title}</h2>
                  <time
                    dateTime={post.date}
                    className="shrink-0 font-mono text-xs text-fg-muted tabular-nums"
                  >
                    {formatDate(post.date)}
                  </time>
                </div>
                {post.description && (
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">{post.description}</p>
                )}
                {post.draft && (
                  <span className="mt-1 inline-block font-mono text-[11px] text-accent">draft</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
