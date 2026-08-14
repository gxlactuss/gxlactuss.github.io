export function ComingSoon({ note }: { note: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Coming soon</p>
      <p className="mt-2 text-sm text-fg-muted">{note}</p>
    </div>
  );
}
