"use client";

import { useEffect, useRef, useState } from "react";

/** Only characters that exist in the labels' own alphabet, so nothing widens. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%*+=/\\";

/** Total settle time, and how far apart consecutive characters land. */
const LEAD_IN = 140;
const PER_CHAR = 34;

/**
 * A label that decodes into place the first time it is scrolled to.
 *
 * The real text is what renders on the server and what assistive tech is given,
 * so this is purely a visual pass over something already correct — with
 * JavaScript off, or reduced motion on, the label simply is what it says.
 *
 * The substitute characters are drawn from the same alphabet the labels use and
 * the string keeps its length, so in a monospace face nothing reflows while it
 * runs. A scramble that changed width would drag the section under it around.
 */
export function ScrambleText({ text, className = "" }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let start = 0;

    function tick(now: number) {
      if (!start) start = now;
      const elapsed = now - start;
      let out = "";
      let settled = 0;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        // Spaces stay put. Letting them scramble turns one label into what
        // looks like a different number of words.
        if (char === " ") {
          out += " ";
          settled++;
          continue;
        }
        if (elapsed >= LEAD_IN + i * PER_CHAR) {
          out += char;
          settled++;
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      setDisplay(out);
      if (settled < text.length) frame = requestAnimationFrame(tick);
    }

    // Once, when the label is actually on screen — and only once, or every
    // scroll back up the page would set the whole column rattling again.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.9 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text]);

  return (
    // The accessible name is the real label throughout, so a screen reader
    // never reads a half-decoded string if it happens to arrive mid-run.
    <span ref={host} className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
