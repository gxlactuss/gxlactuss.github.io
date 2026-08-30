/**
 * `<ViewTransition>` is real at runtime — the App Router bundles a React canary
 * (`next/dist/compiled/react`) that exports it, and `import { ViewTransition }
 * from "react"` resolves there in both the client and the server-component
 * build. `@types/react` only describes stable React, so without this the
 * compiler insists the export doesn't exist.
 *
 * Only the props this site actually passes are declared. Delete the whole file
 * once `@types/react` ships its own definition.
 */
import type { ReactNode } from "react";

/**
 * A view-transition class name, the keywords `"auto"` / `"none"`, or a map from
 * transition type to one of those.
 */
type ViewTransitionClass = string | Record<string, string>;

declare module "react" {
  export interface ViewTransitionProps {
    children?: ReactNode;
    /** Pairs an element on the old page with the same name on the new one. */
    name?: string;
    /** Animation used when no more specific prop applies. */
    default?: ViewTransitionClass;
    enter?: ViewTransitionClass;
    exit?: ViewTransitionClass;
    /** Animation for a matched pair — this is the one that morphs. */
    share?: ViewTransitionClass;
    update?: ViewTransitionClass;
  }

  export const ViewTransition: (props: ViewTransitionProps) => ReactNode;
}
