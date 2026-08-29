import fs from "node:fs";
import path from "node:path";
import { ComingSoon } from "@/components/coming-soon";
import { resume } from "@/lib/config";

/**
 * Checked on disk at build time rather than linked blindly: a static export
 * can't test for the file at request time, and a download button that 404s is
 * worse than an honest placeholder.
 */
function resumeExists() {
  return fs.existsSync(path.join(process.cwd(), "public", path.basename(resume.path)));
}

export function ResumeCard() {
  if (!resumeExists()) {
    return <ComingSoon note="Drop your PDF at public/resume.pdf and it'll appear here." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-subtle/40">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="font-medium">Resume</p>
          <p className="mt-0.5 text-sm text-fg-muted">One page · PDF</p>
        </div>
        <div className="flex gap-2">
          <a
            href={resume.path}
            target="_blank"
            rel="noopener"
            className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            Open
          </a>
          <a
            href={resume.path}
            download={resume.filename}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Download
          </a>
        </div>
      </div>

      {/*
        Sized to US Letter so the whole page is visible rather than a scrolling
        window onto it. <object> rather than <iframe> for the fallback: browsers
        that won't render a PDF inline — which is most of them on mobile — show
        the children instead of an empty grey box, so the section still offers a
        way through to the file.
      */}
      <div className="border-t border-border p-4">
        {/* The fragment is PDF Open Parameters, not a query string: it strips the
            viewer's own toolbar and thumbnail rail so the frame shows the page
            rather than a browser UI wrapped around a stamp-sized page. Viewers
            that ignore it lose nothing. */}
        <object
          data={`${resume.path}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          type="application/pdf"
          aria-label="Resume preview"
          className="mx-auto block aspect-[8.5/11] w-full max-w-[620px] rounded border border-border bg-white"
        >
          <div className="grid aspect-[8.5/11] w-full max-w-[540px] place-items-center rounded border border-dashed border-border p-6 text-center">
            <p className="text-sm text-fg-muted">
              Your browser won&apos;t show a PDF inline.{" "}
              <a href={resume.path} target="_blank" rel="noopener" className="underline hover:text-accent">
                Open it in a new tab
              </a>
              .
            </p>
          </div>
        </object>
      </div>
    </div>
  );
}
