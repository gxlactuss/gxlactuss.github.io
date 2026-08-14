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
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-bg-subtle/40 p-4">
      <div>
        <p className="font-medium">Resume</p>
        <p className="mt-0.5 text-sm text-fg-muted">PDF · opens in a new tab</p>
      </div>
      <div className="flex gap-2">
        <a
          href={resume.path}
          target="_blank"
          rel="noopener"
          className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          View
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
  );
}
