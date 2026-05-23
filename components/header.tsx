import { ChevronDown, Menu, Moon, Star, Sun } from "lucide-react";
import { HeaderSearch } from "@/components/header-search";
import { headerSearchEntries } from "@/lib/search";
import { githubStargazersUrl, navItems, withBasePath } from "@/lib/site";

type HeaderProps = {
  currentPath?: string;
};

const themeScript = `(() => {
  const storageKey = 'enterpriseai.tools-theme';
  const html = document.documentElement;
  const getTheme = () => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const applyTheme = (theme) => {
    html.classList.remove('dark', 'light');
    html.classList.add(theme);
    const button = document.getElementById('theme-toggle');
    if (button) {
      const next = theme === 'dark' ? 'light' : 'dark';
      button.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      button.setAttribute('title', 'Switch to ' + next + ' mode');
      button.dataset.theme = theme;
    }
  };
  applyTheme(getTheme());
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('#theme-toggle');
    if (!button) return;
    const current = button.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { window.localStorage.setItem(storageKey, next); } catch {}
  });
})();`;

const primaryLinks = navItems.filter((item) => ["/updates", "/about"].includes(item.href));
const categoryLinks = navItems.filter((item) => ["/platforms", "/agents", "/orchestration", "/governance", "/assistants"].includes(item.href));

export function Header({ currentPath = "/" }: HeaderProps) {
  const isCategoryPath = categoryLinks.some((item) => item.href === currentPath);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <header className="sticky top-0 z-50 h-[var(--site-header-height)] border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/92 backdrop-blur">
        <div className="mx-auto flex h-[var(--site-header-height)] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 md:gap-5">
            <a href={withBasePath("/")} className="shrink-0 text-lg font-extrabold tracking-tight text-[var(--color-text-primary)]">
              enterpriseai.tools
            </a>

            <nav aria-label="Primary" className="hidden items-center gap-2 md:flex">
              <details className="group relative">
                <summary
                  className={`flex h-9 cursor-pointer list-none items-center gap-1 rounded-full px-3 text-sm font-medium transition [&::-webkit-details-marker]:hidden ${
                    isCategoryPath
                      ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Categories
                  <ChevronDown size={14} className="transition group-open:rotate-180" />
                </summary>
                <div className="absolute left-0 top-[calc(100%+0.5rem)] min-w-56 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 shadow-xl">
                  <div className="flex flex-col gap-1">
                    {categoryLinks.map((item) => {
                      const isCurrent = item.href === currentPath;

                      return (
                        <a
                          key={item.href}
                          href={withBasePath(item.href)}
                          aria-current={isCurrent ? "page" : undefined}
                          className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                            isCurrent
                              ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
                              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
                          }`}
                        >
                          {item.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </details>

              {primaryLinks.map((item) => {
                const isCurrent = item.href === currentPath;

                return (
                  <a
                    key={item.href}
                    href={withBasePath(item.href)}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                      isCurrent
                        ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <HeaderSearch entries={headerSearchEntries} collapsed />

            <a
              href={githubStargazersUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Star the GitHub repository in a new tab"
              className="hidden h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-transparent px-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text-primary)] lg:inline-flex"
            >
              <Star size={16} />
              <span>Star</span>
            </a>

            <button
              id="theme-toggle"
              type="button"
              data-theme="dark"
              aria-label="Switch to light mode"
              title="Switch to light mode"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text-primary)]"
            >
              <Sun size={18} className="block group-data-[theme=light]:hidden" />
              <Moon size={18} className="hidden group-data-[theme=light]:block" />
            </button>

            <details className="relative md:hidden">
              <summary
                aria-label="Open navigation menu"
                title="Open navigation menu"
                className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] [&::-webkit-details-marker]:hidden"
              >
                <span className="sr-only">Open navigation menu</span>
                <Menu size={18} />
              </summary>
              <nav aria-label="Mobile" className="absolute right-0 mt-2 min-w-64 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 shadow-xl">
                <div className="mb-2">
                  <HeaderSearch entries={headerSearchEntries} compact />
                </div>
                <div className="flex flex-col gap-1">
                  <a
                    href={withBasePath("/")}
                    aria-current={currentPath === "/" ? "page" : undefined}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                      currentPath === "/"
                        ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    Home
                  </a>
                  <div className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                    Categories
                  </div>
                  {categoryLinks.map((item) => {
                    const isCurrent = item.href === currentPath;

                    return (
                      <a
                        key={item.href}
                        href={withBasePath(item.href)}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                          isCurrent
                            ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
                        }`}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                  {primaryLinks.map((item) => {
                    const isCurrent = item.href === currentPath;

                    return (
                      <a
                        key={item.href}
                        href={withBasePath(item.href)}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                          isCurrent
                            ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
                        }`}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                  <a
                    href={githubStargazersUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Star the GitHub repository in a new tab"
                    className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Star size={16} />
                    <span>Star on GitHub</span>
                  </a>
                </div>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}
