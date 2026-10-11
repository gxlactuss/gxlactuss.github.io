import { giscus } from "./config";

export type Note = {
  id: string;
  text: string;
  url: string;
  author: { login: string; avatar: string };
};

type GiscusComment = {
  id: string;
  url: string;
  bodyHTML: string;
  deletedAt: string | null;
  isMinimized: boolean;
  author: { login: string; avatarUrl: string } | null;
};

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Guestbook entries, read through giscus's own API so no token is needed.
 *
 * That API only sends CORS headers for giscus.app, so a browser on this site
 * cannot call it. It runs at build time instead, and the deploy workflow
 * rebuilds whenever someone signs.
 */
export async function getGuestbookNotes(): Promise<Note[]> {
  const params = new URLSearchParams({
    repo: giscus.repo,
    term: giscus.term,
    category: giscus.category,
    number: "0",
    strict: "false",
    last: "100",
  });

  try {
    const res = await fetch(`https://giscus.app/api/discussions?${params}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { discussion?: { comments?: GiscusComment[] } };

    return (data.discussion?.comments ?? [])
      .filter((c) => !c.deletedAt && !c.isMinimized && c.author)
      .map((c) => ({
        id: c.id,
        text: plainText(c.bodyHTML),
        url: c.url,
        author: { login: c.author!.login, avatar: c.author!.avatarUrl },
      }))
      .filter((note) => note.text)
      .reverse();
  } catch {
    // A build must never fail because giscus had a bad minute.
    return [];
  }
}
