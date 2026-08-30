import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { formatDate, getPost, getPosts } from "@/lib/posts";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || (post.draft && process.env.NODE_ENV !== "development")) notFound();

  return (
    <article className="max-w-2xl py-16">
      <Link href="/blog" className="font-mono text-xs text-fg-muted hover:text-accent">
        ← writing
      </Link>

      <ViewTransition name={`post-title-${slug}`} share="morph" default="none">
        <h1 className="mt-6 text-2xl font-medium tracking-tight">{post.title}</h1>
      </ViewTransition>
      <time dateTime={post.date} className="mt-2 block font-mono text-xs text-fg-muted">
        {formatDate(post.date)}
      </time>

      <div className="prose mt-10">
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [
                  rehypePrettyCode,
                  { theme: { light: "github-light", dark: "github-dark" }, keepBackground: false },
                ],
              ],
            },
          }}
        />
      </div>
    </article>
  );
}
