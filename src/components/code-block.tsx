"use client";

import { useRef, useState } from "react";

/**
 * A code block with a copy button.
 *
 * Stands in for `pre` when MDX renders a post, so it wraps whatever
 * rehype-pretty-code produced rather than replacing it — the `pre` keeps its
 * attributes, which is what the highlighting styles in globals.css hang off.
 */
export function CodeBlock(props: React.HTMLAttributes<HTMLPreElement>) {
  const block = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    // innerText rather than textContent: rehype-pretty-code lays the lines out
    // as a grid, and only innerText is aware enough of that to put the newlines
    // back. textContent returns the whole program on one line.
    const text = block.current?.innerText;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be refused outright. Saying nothing is better than
      // claiming a copy that did not happen.
    }
  }

  return (
    <div className="group relative">
      <pre ref={block} {...props} />
      <button
        type="button"
        onClick={copy}
        // Visible on hover, and on keyboard focus — otherwise the button is
        // reachable by Tab but invisible while you are on it.
        className="absolute right-2 top-2 rounded border border-border bg-bg px-2 py-1 font-mono text-[11px] text-fg-muted opacity-0 transition-opacity hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
