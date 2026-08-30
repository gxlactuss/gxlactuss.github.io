import { CodeBlock } from "@/components/code-block";

/**
 * A heading that offers its own link.
 *
 * rehype-slug has already put an `id` on it, so this only has to surface it.
 * The `#` is a sibling of the text rather than a wrapper around it: making the
 * whole heading a link would hand a screen reader "link" where the document
 * outline wants a heading.
 *
 * No `scroll-margin` here — globals.css sets `scroll-padding-top` on <html>, so
 * every anchor on the site already clears the sticky header.
 */
function heading(Tag: "h2" | "h3") {
  return function Heading({ id, children }: { id?: string; children?: React.ReactNode }) {
    return (
      <Tag id={id} className="group">
        {children}
        {id && (
          <a
            href={`#${id}`}
            aria-label="Link to this section"
            className="ml-2 font-mono text-fg-muted no-underline opacity-0 transition-opacity hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
          >
            #
          </a>
        )}
      </Tag>
    );
  };
}

/** Passed to MDXRemote so posts get these in place of the plain tags. */
export const mdxComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
  pre: CodeBlock,
};
