import Image from "next/image";
import { HeroComets } from "@/components/hero-comets";
import { Highlight } from "@/components/highlight";
import { SocialLinks } from "@/components/social-links";
import { profile, site } from "@/lib/config";

export function ProfileHeader() {
  // Each line is only rendered if it has a value, so an unset age just vanishes
  // rather than leaving a stray separator behind.
  const facts = [
    profile.age !== null ? `${profile.age} years old` : null,
    profile.degree,
    profile.college,
    `Class of ${profile.graduation}`,
  ].filter((f): f is string => Boolean(f));

  return (
    // `isolate` gives the comet canvas its own stacking context, so a negative
    // z-index puts it behind this content and nothing else.
    <header className="relative isolate">
      <HeroComets />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <Image
          src={profile.photo}
          alt={site.name}
          width={112}
          height={140}
          priority
          className="w-24 shrink-0 rounded-lg border border-border object-cover sm:w-28"
        />

        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight">{site.name}</h1>
          <ul className="mt-2 space-y-0.5 text-sm text-fg-muted">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <p className="mt-2 font-mono text-xs text-fg-muted">{site.location}</p>

          {/* Its own badge rather than a fourth grey line — the point is that
              this one gets read, and grey text next to grey text doesn't. */}
          {profile.cgpa && (
            <p className="mt-3 inline-flex items-baseline gap-2 rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                CGPA
              </span>
              <span className="font-mono text-base font-medium leading-none text-accent dark:text-accent-strong">
                {profile.cgpa}
              </span>
            </p>
          )}
        </div>
      </div>

      <p className="mt-6 leading-relaxed text-fg-muted">
        <Highlight text={site.intro} terms={site.introHighlights} />
      </p>

      <SocialLinks className="mt-5" />

      <p className="mt-4 text-sm text-fg-muted">
        Reach me at{" "}
        <a
          href={`mailto:${site.email}`}
          className="text-fg underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          {site.email}
        </a>
      </p>
    </header>
  );
}
