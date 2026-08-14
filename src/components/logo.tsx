/**
 * The mark: an M drawn as a single mountain-range zigzag, with a star sitting
 * over its right peak — the M for Mohit, the star for gxlactuss.
 *
 * Drawn on a 32 grid with round caps and joins so it stays legible at favicon
 * size, where thin corners are the first thing to disappear. Uses currentColor
 * so the header can theme it; the favicon file carries its own colours.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 23.5 L11.5 11 L16 18.5 L20.5 11 L26 23.5" />
      <circle cx="25.5" cy="7" r="1.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
