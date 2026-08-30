"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

/**
 * `startViewTransition` isn't in the DOM lib every TypeScript release ships, and
 * only these two members are used here.
 */
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

/**
 * Runs before first paint to apply the stored theme, so there's no flash of the
 * wrong palette. Stringified deliberately — it must execute synchronously in
 * <head>, before React hydrates.
 */
export function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

export function ThemeToggle() {
  // Undefined until mounted: the server can't know the stored theme, so we
  // render a placeholder rather than guessing and mismatching on hydration.
  const [theme, setTheme] = useState<"light" | "dark" | undefined>();

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    // The swap itself. flushSync so the icon changes in the same commit as the
    // class does: outside a transition that's just React being React, but
    // inside one an unflushed setState paints *after* the new snapshot is
    // taken, and the icon is left a frame behind the palette.
    function apply() {
      flushSync(() => setTheme(next));
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
    }

    localStorage.setItem("theme", next);

    const doc = document as ViewTransitionDocument;
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }

    // A circle centred on the button, with enough radius to reach the furthest
    // corner of the viewport — size it to anything less and the wipe finishes
    // with an unpainted wedge in the far corner. Measured now, because a
    // synthetic event's currentTarget is gone by the time the callback runs.
    const box = event.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    root.style.setProperty("--wipe-x", `${x}px`);
    root.style.setProperty("--wipe-y", `${y}px`);
    root.style.setProperty("--wipe-r", `${radius}px`);
    // Scopes the wipe rules in globals.css to this transition, so a navigation
    // that happens to overlap still crossfades normally.
    root.dataset.themeWipe = "";

    doc.startViewTransition(apply).finished.finally(() => {
      delete root.dataset.themeWipe;
    });
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Switch theme"}
      className="grid size-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
    >
      {theme === undefined ? (
        <span className="size-4" />
      ) : theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4">
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
