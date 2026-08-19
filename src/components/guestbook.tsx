"use client";

import { useEffect, useRef } from "react";
import { giscus } from "@/lib/config";

const GISCUS_ORIGIN = "https://giscus.app";

/** Presets chosen to sit on our own background rather than paint their own. */
function themeFor(isDark: boolean) {
  return isDark ? "transparent_dark" : "light";
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
 */
export function Guestbook() {
  const container = useRef<HTMLDivElement>(null);

  // Mount once. Re-running this would append a second widget.
  useEffect(() => {
    const el = container.current;
    if (!el || el.querySelector("iframe, script")) return;

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
      "reactions-enabled": "1",
      "emit-metadata": "0",
      "input-position": "top",
      theme: themeFor(isDark),
      lang: "en",
      loading: "lazy",
    }).forEach(([key, value]) => script.setAttribute(`data-${key}`, String(value)));

    el.appendChild(script);
  }, []);

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

  return <div ref={container} className="mt-6 min-h-40" />;
}
