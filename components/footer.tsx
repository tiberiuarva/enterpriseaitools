import { githubRepoUrl, githubStargazersUrl, withBasePath } from "@/lib/site";

type FooterColumn = {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
};

const columns: FooterColumn[] = [
  {
    title: "Catalog",
    links: [
      { href: "/platforms", label: "Platforms" },
      { href: "/agents", label: "Agents" },
      { href: "/orchestration", label: "Orchestration" },
      { href: "/governance", label: "Governance" },
      { href: "/assistants", label: "Assistants" },
    ],
  },
  {
    title: "Compare",
    links: [
      { href: "/tools/compare", label: "Compare tools" },
      { href: "/evaluate", label: "Help me evaluate" },
    ],
  },
  {
    title: "Updates",
    links: [
      { href: "/updates", label: "Weekly updates" },
      { href: "/updates#auto-detected", label: "Auto-detected changes" },
      { href: "/updates.xml", label: "Atom feed" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About the project" },
      { href: githubRepoUrl, label: "GitHub repository", external: true },
      { href: githubStargazersUrl, label: "Star on GitHub", external: true },
    ],
  },
];

type FooterProps = {
  lastUpdated: string;
};

export function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.title} aria-labelledby={`footer-${column.title.toLowerCase()}`}>
              <h2
                id={`footer-${column.title.toLowerCase()}`}
                className="text-caption uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]"
              >
                {column.title}
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.external ? link.href : withBasePath(link.href)}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noreferrer" : undefined}
                      className="text-body-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 text-caption text-[var(--color-text-tertiary)] md:flex-row md:items-center md:justify-between">
          <p>
            <span className="font-semibold text-[var(--color-text-secondary)]">enterpriseai.tools</span> · Open source
            enterprise AI landscape tracker
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center rounded-full border border-[var(--color-border)] px-2.5 py-0.5 font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              MIT License
            </span>
            <span>Data accurate as of {lastUpdated}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
