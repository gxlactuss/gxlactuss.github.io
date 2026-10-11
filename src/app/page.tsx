import { ContributionGraph } from "@/components/contribution-graph";
import { Dock } from "@/components/dock";
import { Footer } from "@/components/footer";
import { Friends } from "@/components/friends";
import { Guestbook } from "@/components/guestbook";
import { Hero } from "@/components/hero";
import { MergedOrgs, MergedPrs } from "@/components/merged-prs";
import { ProjectList } from "@/components/project-list";
import { ResearchList } from "@/components/research";
import { ScrollProgress } from "@/components/scroll-progress";
import { Section } from "@/components/section";
import { getContributionDays } from "@/lib/contributions";
import { getContributions } from "@/lib/github";
import { getGuestbookNotes } from "@/lib/guestbook";
import { friends, giscus, projects, research } from "@/lib/config";

export default async function Home() {
  // Fetched at build time and baked into the HTML. Either can come back empty
  // if GitHub has a bad minute, and the sections cope with that.
  const [days, prs, notes] = await Promise.all([
    getContributionDays(365),
    getContributions().catch(() => []),
    getGuestbookNotes(),
  ]);
  const merged = prs.filter((pr) => pr.state === "merged");
  const total = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <>
      <ScrollProgress />
      <main className="mx-auto max-w-[680px] px-5">
        <Hero stats={{ contributions: total, merged: merged.length }} />

        <Section id="projects" title="Projects" count={projects.length}>
          <ProjectList />
        </Section>

        <Section id="research" title="Research" count={research.length}>
          <ResearchList />
        </Section>

        <Section id="open-source" title="Open source">
          <MergedOrgs prs={merged} />
          <ContributionGraph days={days} />
          <MergedPrs prs={merged} />
        </Section>

        <Section id="friends" title="Friends" count={friends.length}>
          <Friends />
        </Section>

        {giscus.enabled && (
          <Section id="guestbook" title="Guestbook">
            <Guestbook notes={notes} />
          </Section>
        )}
      </main>
      <Footer />
      <Dock />
    </>
  );
}
