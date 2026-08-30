export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="reveal mt-14">
      <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-fg-muted">{title}</h2>
      {children}
    </section>
  );
}
