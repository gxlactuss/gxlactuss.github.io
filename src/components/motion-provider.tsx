"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";

/**
 * domMax rather than domAnimation because the dock and project sheet need
 * layout animations and drag. reducedMotion="user" makes every transform
 * animation on the site go still when the OS asks for reduced motion.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
