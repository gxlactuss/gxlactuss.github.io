/**
 * Its own module purely to give the bundler something to split on — the dynamic
 * import in motion-features.tsx keeps Motion's feature bundle out of the main
 * chunk so it downloads alongside it rather than inside it.
 *
 * Worth being precise about what that buys, because it is less than it sounds:
 * the import fires during hydration, so the chunk is in flight before first
 * paint finishes, not after it. What it avoids is a single larger blocking
 * chunk, not the download.
 */
export { domAnimation as default } from "motion/react";
