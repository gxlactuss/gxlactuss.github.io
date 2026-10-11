"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

/**
 * Runs before first paint to apply the stored theme, so there's no flash of the
 * wrong palette. Dark unless the visitor has picked light.
 */
export function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem("theme")||"dark";document.documentElement.classList.toggle("dark",t==="dark")}catch(e){document.documentElement.classList.add("dark")}})()`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

export function useTheme() {
  // Undefined until mounted: the server can't know the stored theme.
  const [theme, setTheme] = useState<"light" | "dark" | undefined>();

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle(origin: HTMLElement) {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    // flushSync so the icon swaps in the same frame the palette does.
    function apply() {
      flushSync(() => setTheme(next));
      root.classList.toggle("dark", next === "dark");
    }

    try {
      localStorage.setItem("theme", next);
    } catch {}

    const doc = document as ViewTransitionDocument;
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }

    // A circle from the button, big enough to reach the furthest corner.
    const box = origin.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty("--wipe-x", `${x}px`);
    root.style.setProperty("--wipe-y", `${y}px`);
    root.style.setProperty("--wipe-r", `${r}px`);
    root.dataset.themeWipe = "";
    doc.startViewTransition(apply).finished.finally(() => delete root.dataset.themeWipe);
  }

  return { theme, toggle };
}

/** Sun or moon, swapped with a spin. */
export function ThemeIcon({ theme }: { theme: "light" | "dark" | undefined }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {theme && (
        <m.svg
          key={theme}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="size-full"
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          {theme === "dark" ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          ) : (
            <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
          )}
        </m.svg>
      )}
    </AnimatePresence>
  );
}
