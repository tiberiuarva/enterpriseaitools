import { githubRepoUrl, githubStargazersUrl } from "@/lib/site";

type FooterProps = {
  lastUpdated: string;
};

export function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[var(--color-text-secondary)] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          Open source enterprise AI landscape tracker
        </div>
        <div className="inline-flex w-fit rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-primary)]">
          MIT License
        </div>
        <div className="flex flex-col gap-2 text-right lg:items-end">
          <a
            href={githubStargazersUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Star the GitHub repository in a new tab"
            className="font-medium hover:text-[var(--color-primary)]"
          >
            Star on GitHub
          </a>
          <a
            href={githubRepoUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open GitHub repository in a new tab"
            className="text-xs hover:text-[var(--color-primary)]"
          >
            View repository
          </a>
          <span>Data accurate as of {lastUpdated}</span>
        </div>
      </div>
    </footer>
  );
}
