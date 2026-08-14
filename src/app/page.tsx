import Link from "next/link";
import { ComingSoon } from "@/components/coming-soon";
import { ContributionCalendar } from "@/components/contribution-calendar";
import { Friends } from "@/components/friends";
import { ProfileHeader } from "@/components/profile-header";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Section } from "@/components/section";
import { projects, shenanigans } from "@/lib/config";
import { getContributionDays } from "@/lib/contributions";
import { formatDate, getPosts } from "@/lib/posts";

export default async function Home() {
  const [posts, contributionDays] = await Promise.all([getPosts(), getContributionDays(30)]);
  const recent = posts.slice(0, 3);

  return (
    <div className="py-16">
      <ProfileHeader />

      <Section id="projects" title="Projects">
        <div className="grid gap-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </Section>

      <Section id="shenanigans" title="Shenanigans">
        <p className="mb-4 text-sm text-fg-muted">
          Experiments, one-offs, and things I built to learn something.
        </p>
        <div className="grid gap-3">
          {shenanigans.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </Section>

      <Section id="resume" title="Resume">
        <ResumeCard />
      </Section>

      <Section id="github" title="GitHub">
        <ContributionCalendar days={contributionDays} />
      </Section>

      <Section id="open-source" title="Open Source">
        <ComingSoon note="Contributions I've made to other people's projects will show up here." />
      </Section>

      <Section id="research" title="Research">
        <ComingSoon note="Papers and preprints will show up here." />
      </Section>

      {recent.length > 0 && (
        <Section id="writing" title="Writing">
          <ul className="divide-y divide-border border-y border-border">
            {recent.map((post) => (
              <li key={post.slug} className="py-2.5">
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-baseline justify-between gap-4 hover:text-accent"
                >
                  <span className="text-sm">{post.title}</span>
                  <time
                    dateTime={post.date}
                    className="shrink-0 font-mono text-xs text-fg-muted tabular-nums"
                  >
                    {formatDate(post.date)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
          {posts.length > recent.length && (
            <Link href="/blog" className="mt-4 inline-block font-mono text-xs hover:text-accent">
              all posts →
            </Link>
          )}
        </Section>
      )}

      <Section id="friends" title="My Friends">
        <Friends />
      </Section>
    </div>
  );
}
