"use client";

import { m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { giscus, site } from "@/lib/config";
import type { Note } from "@/lib/guestbook";
import { Marquee } from "./marquee";
import { revealItem } from "./section";

const GISCUS_ORIGIN = "https://giscus.app";

/**
 * Custom themes rather than giscus presets, so the widget uses this site's
 * orange instead of GitHub's green sign-in button and blue links.
 *
 * giscus fetches these from the public web, so the URL has to be absolute and
 * the files have to be deployed — a relative path or localhost will not load.
 */
function themeFor(isDark: boolean) {
  return `${site.url}/giscus-${isDark ? "dark" : "light"}.css`;
}

/**
 * Guestbook backed by GitHub Discussions via giscus.
 *
 * The site is a static export on GitHub Pages, so there is no server to hold
 * entries and no way to run an OAuth callback. giscus solves both by keeping
 * the data in this repo's Discussions and doing auth in its own iframe — which
 * means real sign-in and a real database without this site gaining a backend.
 *
 * The trade-off: signing requires a GitHub account.
 *
 * Notes already left scroll past in rows above it. The widget lists them too,
 * so it stays folded away until someone wants to sign.
 */
export function Guestbook({ notes }: { notes: Note[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(notes.length === 0);

  // Mount once. Re-running this would append a second widget.
  useEffect(() => {
    const el = container.current;
    if (!open || !el || el.querySelector("iframe, script")) return;

    const isDark = document.documentElement.classList.contains("dark");
    const script = document.createElement("script");
    script.src = `${GISCUS_ORIGIN}/client.js`;
    script.async = true;
    script.crossOrigin = "anonymous";

    Object.entries({
      repo: giscus.repo,
      "repo-id": giscus.repoId,
      category: giscus.category,
      "category-id": giscus.categoryId,
      // One discussion for the whole guestbook, rather than one per URL.
      mapping: "specific",
      term: giscus.term,
      strict: "0",
      // No reaction bar: this is a guestbook, and a row of emoji buttons under
      // every entry invites a tap where the point is to leave words.
      "reactions-enabled": "0",
      "emit-metadata": "0",
      "input-position": "top",
      theme: themeFor(isDark),
      lang: "en",
      loading: "lazy",
    }).forEach(([key, value]) => script.setAttribute(`data-${key}`, String(value)));

    el.appendChild(script);
  }, [open]);

  // Keep the widget's theme in step with the site's. The toggle flips a class
  // on <html>, so watch that rather than trying to share state across the frame.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const frame = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
      if (!frame?.contentWindow) return;
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: themeFor(document.documentElement.classList.contains("dark")) } } },
        GISCUS_ORIGIN,
      );
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <m.div variants={revealItem}>
      {notes.length > 0 && <Wall notes={notes} />}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
        >
          Sign the guestbook
        </button>
      )}
      {open && <div ref={container} className="mt-6 min-h-40" />}
    </m.div>
  );
}

/** Fewest cards in one copy of a row, so a short guestbook still fills the width. */
const minPerRow = 4;

/**
 * Notes in rows that drift sideways, alternating direction. One row until
 * there are enough notes that two rows don't just repeat each other.
 */
function Wall({ notes }: { notes: Note[] }) {
  const rows = notes.length >= 6 ? [notes.filter((_, i) => i % 2 === 0), notes.filter((_, i) => i % 2 === 1)] : [notes];

  return (
    <div className="-mx-5 space-y-3">
      {rows.map((row, i) => {
        const filled = Array.from({ length: Math.ceil(minPerRow / row.length) }, () => row).flat();
        return <Marquee key={i} items={filled} reverse={i % 2 === 1} render={(note) => <NoteCard note={note} />} />;
      })}
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <a
      href={note.url}
      target="_blank"
      rel="noopener"
      className="flex w-64 shrink-0 flex-col justify-between gap-3 rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-line-strong"
    >
      <p className="line-clamp-3 text-[13px] leading-normal text-ink-2 break-words">
        <span aria-hidden="true" className="mr-0.5 font-display text-lg leading-none text-accent">
          &ldquo;
        </span>
        {note.text}
      </p>
      <span className="flex min-w-0 items-center gap-1.5 font-mono text-[11px] text-faint">
        <img
          src={note.author.avatar}
          alt=""
          width={16}
          height={16}
          loading="lazy"
          className="size-4 shrink-0 rounded-full bg-surface-2"
        />
        <span className="truncate">{note.author.login}</span>
      </span>
    </a>
  );
}
