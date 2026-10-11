"use client";

import { m, useInView, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * A number that springs up from zero the first time it scrolls into view.
 * Starts at zero, so it only reads right once JS has run; keep it to decorative counts.
 */
export function CountUp({ value, pad = 0 }: { value: number; pad?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString("en-US").padStart(pad, "0"));

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, spring, value]);

  return (
    <m.span ref={ref} className="tabular-nums">
      {text}
    </m.span>
  );
}
