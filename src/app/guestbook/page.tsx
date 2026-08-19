import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { Guestbook } from "@/components/guestbook";
import { giscus } from "@/lib/config";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Leave a note.",
};

export default function GuestbookPage() {
  return (
    <div className="py-16">
      <h1 className="text-2xl font-medium tracking-tight">Guestbook</h1>

      {giscus.enabled ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            Say hi, leave a link, tell me I&apos;m wrong about something. Signing in uses your
            GitHub account, and entries live as{" "}
            <a
              href={`https://github.com/${giscus.repo}/discussions`}
              rel="noopener"
              className="underline hover:text-accent"
            >
              discussions on this site&apos;s repo
            </a>
            .
          </p>
          <Guestbook />
        </>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            Say hi, leave a link, tell me I&apos;m wrong about something.
          </p>
          <div className="mt-6">
            <ComingSoon note="Setting this up — back shortly." />
          </div>
        </>
      )}
    </div>
  );
}
