"use client";

import { LazyMotion, MotionConfig } from "motion/react";

/** Split into its own chunk, requested during hydration. */
const loadFeatures = () => import("./motion-dom-animation").then((mod) => mod.default);

/**
 * Motion's feature bundle, loaded for the one page that uses it.
 *
 * `LazyMotion` with the `m` component instead of the full `motion` component,
 * and `strict` to make that stick — importing `motion.div` anywhere under this
 * throws rather than quietly pulling the whole library back in. `domAnimation`
 * covers gestures, variants and exits, and the module it comes from is split
 * out into its own chunk, which downloads beside the main one rather than
 * inside it — see motion-dom-animation.ts for what that does and does not buy.
 *
 * What it actually costs, measured on the built output rather than quoted from
 * the docs: the home page goes from 149.8kb of JavaScript transferred to
 * 185.4kb, so +35.6kb gzipped (+93.8kb uncompressed) for the card lift and the
 * magnetic pills. The blog page is unchanged at first load and a project page
 * grows 0.7kb, which is the hand-rolled tab pill and not this. That is the
 * point of scoping the provider to one page.
 *
 * Motion's headline "4.6kb" is the `m` component on its own and is not the
 * number that lands here: `useSpring`'s solver and the motion-value plumbing
 * are core rather than features, so they ship up front however the feature
 * bundle is loaded.
 *
 * The larger `domMax` bundle adds drag and layout animations for ~10kb more.
 * Nothing here needs them, and the one thing that would have — a `layoutId`
 * pill on the demo platform tabs — is hand-rolled in project-demo.tsx instead,
 * since those tabs only render for a project with more than one recording and
 * every project is iOS-only today. Paying 10kb for a control that does not
 * appear on the site was the wrong trade.
 *
 * `reducedMotion="user"` is a floor, not the whole story. It stops Motion
 * *animating* transforms and leaves opacity alone — but a gesture's end state
 * still applies, so a `whileHover` lift under that setting snaps to its offset
 * instead of easing to it, which is the jump without the point of it. Anything
 * whose whole content is movement has to opt out at the source, and both the
 * card lift and the magnetic buttons check the preference themselves.
 */
export function MotionFeatures({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
