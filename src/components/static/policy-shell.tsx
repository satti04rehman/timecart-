export function PolicyShell({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-tc py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-heading text-3xl text-obsidian lg:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-xs text-text-gray">Last updated: {updated}</p>
        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </div>
  );
}

export function PolicySection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading text-xl text-obsidian">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-gray">
        {children}
      </div>
    </section>
  );
}