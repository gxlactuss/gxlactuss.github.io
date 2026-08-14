function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Paints the given terms in the accent colour wherever they appear in `text`.
 *
 * Terms are matched longest-first so a phrase wins over a word inside it
 * ("iOS apps" before "apps"), and the split keeps the delimiters so the
 * surrounding prose is preserved exactly.
 */
export function Highlight({
  text,
  terms,
  className = "",
}: {
  text: string;
  terms: readonly string[];
  className?: string;
}) {
  if (terms.length === 0) return <span className={className}>{text}</span>;

  const ordered = [...terms].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${ordered.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        // split() with one capture group puts matches at every odd index.
        i % 2 === 1 ? (
          <mark key={i} className="hl">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
}
