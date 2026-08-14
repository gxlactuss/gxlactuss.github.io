import Image from "next/image";
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
    <header>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
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
        </div>
      </div>

      <p className="mt-6 leading-relaxed text-fg-muted">
        <Highlight text={site.intro} terms={site.introHighlights} />
      </p>

      <SocialLinks className="mt-5" />
    </header>
  );
}
