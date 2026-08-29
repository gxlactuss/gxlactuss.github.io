import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { Paper } from "@/lib/config";
import { research } from "@/lib/config";

/**
 * A local PDF is only linked once it's actually on disk. A static export can't
 * check at request time, and a citation that links to a 404 is worse than one
 * that plainly says the paper isn't up yet.
 */
function resolveHref(href?: string) {
  if (!href) return null;
  if (!href.startsWith("/")) return href; // external URL
  return fs.existsSync(path.join(process.cwd(), "public", href.slice(1))) ? href : null;
}

function PaperRow({ paper }: { paper: Paper }) {
  const href = resolveHref(paper.href);
  const meta = [paper.venue, paper.year].filter(Boolean).join(" · ");
  const byline = paper.authors?.join(", ");

  // A write-up page on this site always resolves, so it outranks a PDF link.
  const title = paper.slug ? (
    <Link href={`/research/${paper.slug}`} className="text-sm hover:text-accent">
      {paper.title} →
    </Link>
  ) : href ? (
    <a href={href} target="_blank" rel="noopener" className="text-sm hover:text-accent">
      {paper.title} ↗
    </a>
  ) : (
    <span className="text-sm">{paper.title}</span>
  );

  return (
    <li className="py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        {title}
        {paper.slug || href ? (
          meta && <span className="font-mono text-xs text-fg-muted">{meta}</span>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
            paper soon
          </span>
        )}
      </div>
      {byline && <p className="mt-1 font-mono text-[11px] text-fg-muted">{byline}</p>}
    </li>
  );
}

export function ResearchList() {
  return (
    <div>
      <h3 className="font-mono text-[11px] uppercase tracking-widest text-fg-muted">Preprints</h3>
      {research.preprints.length === 0 ? (
        <p className="mt-2 text-sm text-fg-muted">Nothing here yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border border-y border-border">
          {research.preprints.map((p) => (
            <PaperRow key={p.title} paper={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
