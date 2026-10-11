export function Footer() {
  return (
    <footer className="mx-auto max-w-[680px] px-5 pb-32 font-mono text-xs text-faint">
      <div className="mt-8 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-line pt-6">
        <span>© {new Date().getFullYear()} Mohit Samant</span>
        <span>Built with Next.js and motion</span>
      </div>
    </footer>
  );
}
