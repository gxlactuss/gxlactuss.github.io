import { ComingSoon } from "@/components/coming-soon";
import { ContributionCalendar } from "@/components/contribution-calendar";
import { Friends } from "@/components/friends";
import { Guestbook } from "@/components/guestbook";
import { ProfileHeader } from "@/components/profile-header";
import { ProjectCard } from "@/components/project-card";
import { ResearchList } from "@/components/research-list";
import { ResumeCard } from "@/components/resume-card";
import { Section } from "@/components/section";
import { giscus, projects } from "@/lib/config";
import { getContributionDays } from "@/lib/contributions";

export default async function Home() {
  const contributionDays = await getContributionDays(365);

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

      <Section id="resume" title="Resume">
        <ResumeCard />
      </Section>

      <Section id="research" title="Research">
        <ResearchList />
      </Section>

      <Section id="github" title="GitHub">
        <ContributionCalendar days={contributionDays} />
      </Section>

      <Section id="open-source" title="Open Source">
        <ComingSoon note="Contributions I've made to other people's projects will show up here." />
      </Section>

      <Section id="friends" title="My Friends">
        <Friends />
      </Section>

      {giscus.enabled && (
        <Section id="guestbook" title="Guestbook">
          <p className="text-sm leading-relaxed text-fg-muted">
            Say hi. Signing in uses your GitHub account.
          </p>
          <Guestbook />
        </Section>
      )}
    </div>
  );
}
