"use client";

import { m, useAnimationFrame, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useSyncExternalStore } from "react";

const reducedQuery = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const chip =
  "shrink-0 whitespace-nowrap rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted";

function Item<T>({ item, render }: { item: T; render?: (item: T) => React.ReactNode }) {
  return render ? render(item) : <span className={chip}>{String(item)}</span>;
}

const fade = "linear-gradient(to right, transparent, black 10%, black 90%, transparent)";

/** Milliseconds for the row to travel one full copy of the items. */
const loop = 25_000;

/**
 * An endless row of chips. The items are rendered twice and the track slides by
 * half its width, so the second copy lands exactly where the first began.
 * Hovering eases the speed down to zero instead of stopping dead.
 *
 * Pass `render` to draw something other than a chip, and `reverse` to run the
 * row left to right.
 */
export function Marquee<T = string>({
  items,
  render,
  reverse = false,
}: {
  items: T[];
  render?: (item: T) => React.ReactNode;
  reverse?: boolean;
}) {
  // Read through useSyncExternalStore so the first client render matches the
  // server's (animated) markup, then switches if the visitor asks for less motion.
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(reducedQuery).matches, () => false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const offset = useMotionValue(0); // 0 to -50, as a % of the track
  const speed = useSpring(1, { stiffness: 80, damping: 20 });
  const x = useTransform(offset, (v) => `${v}%`);

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return;
    const step = (50 * delta * speed.get()) / loop;
    const next = offset.get() + (reverse ? step : -step);
    offset.set(next > 0 ? next - 50 : next % 50);
  });

  if (reduced) {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <Item key={i} item={item} render={render} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="overflow-hidden"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
      onPointerEnter={(e) => e.pointerType === "mouse" && speed.set(0)}
      onPointerLeave={() => speed.set(1)}
    >
      <m.div className="flex w-max" style={{ x }}>
        {[0, 1].map((copy) => (
          // Trailing padding instead of a gap between the copies, so the seam is the same width as every other gap.
          <div key={copy} aria-hidden={copy === 1 || undefined} className="flex gap-2 pr-2">
            {items.map((item, i) => (
              <Item key={i} item={item} render={render} />
            ))}
          </div>
        ))}
      </m.div>
    </div>
  );
}
