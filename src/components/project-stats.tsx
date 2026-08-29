import { languageColor, type Project } from "@/lib/config";

/**
 * The strip along the bottom of the demo player: how long the project took, and
 * what it's written in.
 *
 * The language split is drawn GitHub's way — one continuous track segmented by
 * share, then a legend underneath. The legend is not optional: a bar with no
 * numbers on it is decoration, and it's also what carries the split to a screen
 * reader, which is why the track itself is hidden from one.
 */
export function ProjectStats({ project }: { project: Project }) {
  const { work, languages } = project;
  if (!work && !languages?.length) return null;

  return (
    <div className="border-t border-border bg-bg-subtle/60 px-3 py-2.5">
      {work && (
        <p className="font-mono text-[11px] text-fg-muted">
          Built in <span className="text-fg">{work.duration}</span>
          {work.window && ` · ${work.window}`}
        </p>
      )}

      {languages && languages.length > 0 && (
        <>
          {/* Shares drive flex-grow against a zero basis rather than a width, so
              the segments always fill the track exactly however the numbers
              round. The min-width keeps a 0.3% sliver visible instead of
              collapsing it to nothing. */}
          <div
            aria-hidden
            className={`flex h-1.5 gap-px overflow-hidden rounded-full bg-border ${
              work ? "mt-2.5" : ""
            }`}
          >
            {languages.map((language) => (
              <span
                key={language.name}
                style={{ flexGrow: language.share, backgroundColor: languageColor(language.name) }}
                className="min-w-[3px] basis-0"
              />
            ))}
          </div>

          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
            {languages.map((language) => (
              <li key={language.name} className="flex items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: languageColor(language.name) }}
                />
                <span className="text-fg">{language.name}</span>
                <span className="text-fg-muted">{language.share}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
