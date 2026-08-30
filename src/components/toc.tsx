"use client";

import { useEffect, useState } from "react";

type Entry = { id: string; text: string; el: HTMLElement };

/** Below this many sections a contents list is longer than what it indexes. */
const MIN_SECTIONS = 3;

/** How far down the viewport a heading counts as "the one you are reading". */
const ACTIVE_LINE = 120;

/**
 * A contents list for a long page, parked in the margin.
 *
 * It reads the headings out of the DOM rather than being handed them. The two
 * pages that could want one get their headings from different places — a post
 * from MDX by way of rehype-slug, the paper from hand-written JSX — and the
 * rendered document is the one place both agree.
 *
 * It only appears from `xl` up. The column is 896px wide and centred, so a
 * margin only exists once the viewport is comfortably wider than that; below
 * it there is nowhere to put this that is not on top of the text. Nothing is
 * lost when it is hidden, since every heading still carries its own anchor.
 */
export function TableOfContents() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const found = Array.from(document.querySelectorAll<HTMLElement>("article h2[id]")).map((el) => ({
      id: el.id,
      // The heading's own text, minus the "#" anchor link sitting inside it.
      text: (el.textContent ?? "").replace(/#$/, "").trim(),
      el,
    }));
    if (found.length < MIN_SECTIONS) return;
    setEntries(found);

    let frame = 0;
    function update() {
      frame = 0;

      // At the foot of the document the usual rule breaks down. The last
      // sections can never be scrolled up to the active line — the page runs
      // out of scroll first — so "the last heading above the line" stays stuck
      // on whichever section was tall enough to reach it, and jumping to the
      // final section highlights something several entries above it. Once
      // there is no scroll left, the end of the page *is* the last section.
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
        setActive(found[found.length - 1].id);
        return;
      }

      let current = found[0].id;
      for (const entry of found) {
        if (entry.el.getBoundingClientRect().top <= ACTIVE_LINE) current = entry.id;
      }
      setActive(current);
    }
    // Coalesced to one read per frame: this runs on every scroll event, and
    // measuring seven headings synchronously each time would be a lot of
    // layout work for a list that can only change once per frame anyway.
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (entries.length < MIN_SECTIONS) return null;

  return (
    <nav
      aria-label="On this page"
      // Pinned to the right of the 896px column: half the viewport, plus half
      // the column, plus a gutter.
      className="fixed top-24 hidden w-40 xl:block"
      style={{ left: "calc(50% + 28rem + 1.5rem)" }}
    >
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-border">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={entry.id === active ? "true" : undefined}
              className={`-ml-px block border-l pl-3 text-[13px] leading-snug transition-colors ${
                entry.id === active
                  ? "border-accent text-accent"
                  : "border-transparent text-fg-muted hover:text-fg"
              }`}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
