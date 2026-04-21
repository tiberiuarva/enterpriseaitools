import { navItems, withBasePath } from "@/lib/site";

type RelatedHub = {
  href: string;
  title: string;
  description: string;
};

type RelatedHubsProps = {
  title?: string;
  intro?: string;
  currentPath?: string;
  hubs: RelatedHub[];
};

const navLabelByHref = new Map<string, string>(navItems.map((item) => [item.href, item.label]));

export function RelatedHubs({
  title = "Related hubs",
  intro = "Use these hub pages to move across the tracked platform and category landscape.",
  currentPath,
  hubs,
}: RelatedHubsProps) {
  const visibleHubs = hubs.filter((hub) => hub.href !== currentPath);

  if (visibleHubs.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:320px]">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{intro}</p>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleHubs.map((hub) => (
          <a
            key={hub.href}
            href={withBasePath(hub.href)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 transition hover:border-[var(--color-primary)] hover:shadow-sm"
          >
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">
              {hub.title}
              {navLabelByHref.has(hub.href) ? <span className="sr-only"> ({navLabelByHref.get(hub.href)})</span> : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{hub.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
