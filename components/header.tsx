import { ChevronDown, Menu, Moon, Star, Sun } from "lucide-react";
import { HeaderSearch } from "@/components/header-search";
import { headerSearchEntries } from "@/lib/search";
import { CATEGORIES, FOUNDATION_LINK, STACK_LAYERS } from "@/lib/categories";
import { githubStargazersUrl, navItems, withBasePath } from "@/lib/site";
import { VENDOR_STACKS } from "@/lib/stacks";

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
  const syncButton = (theme) => {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    button.setAttribute('title', 'Switch to ' + next + ' mode');
  };
  const applyTheme = (theme) => {
    html.classList.remove('dark', 'light');
    html.classList.add(theme);
    syncButton(theme);
  };
  const initial = getTheme();
  applyTheme(initial);
  // The button doesn't exist yet on first synchronous run because this
  // script renders before the button JSX. Queue a microtask so the
  // aria-label / title are correct on first paint.
  queueMicrotask(() => syncButton(html.classList.contains('light') ? 'light' : 'dark'));
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('#theme-toggle');
    if (!button) return;
    // Read the actual html class — the source of truth — instead of the
    // button's data-theme attribute which can race on first paint.
    const current = html.classList.contains('light') ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { window.localStorage.setItem(storageKey, next); } catch {}
  });
})();`;

const homeLink = navItems.find((item) => item.href === "/") ?? { href: "/", label: "Home" };
const utilityHrefs = ["/start", "/evaluate", "/updates", "/about"] as const;
const utilityLinks = navItems.filter((item) => utilityHrefs.includes(item.href as (typeof utilityHrefs)[number]));

type NavLink = { href: string; label: string };
type NavGroup = { id: string; label: string; tagline: string; overview: NavLink; links: NavLink[] };

// The "Explore" menu mirrors the stack: foundation, three layers, then vendor views.
const exploreGroups: NavGroup[] = [
  {
    id: "foundation",
    label: FOUNDATION_LINK.label,
    tagline: FOUNDATION_LINK.tagline,
    overview: { href: FOUNDATION_LINK.href, label: FOUNDATION_LINK.title },
    links: VENDOR_STACKS.map((stack) => ({ href: `/stacks/${stack.slug}`, label: `${stack.name} stack` })),
  },
  ...STACK_LAYERS.map((layer) => ({
    id: layer.id,
    label: layer.label,
    tagline: layer.tagline,
    overview: { href: layer.href, label: `${layer.label} overview` },
    links: layer.categories.map((category) => ({ href: `/${category}`, label: CATEGORIES[category].navLabel })),
  })),
];

const explorePaths = new Set<string>(exploreGroups.flatMap((group) => [group.overview.href, ...group.links.map((link) => link.href)]));
const primaryNavHrefs = new Set<string>([homeLink.href, ...explorePaths, ...utilityHrefs]);
const uncategorizedLinks = navItems.filter((item) => !primaryNavHrefs.has(item.href));

function navLinkClass(isCurrent: boolean) {
  return `rounded-full px-3 py-2 text-sm font-medium transition ${
    isCurrent
      ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
  }`;
}

function dropdownNavLinkClass(isCurrent: boolean) {
  return `rounded-xl px-3 py-2 text-sm font-medium transition ${
    isCurrent
      ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
  }`;
}

const groupHeadingClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]";

function NavLinkItem({ link, currentPath, className }: { link: NavLink; currentPath: string; className?: string }) {
  const isCurrent = link.href === currentPath;
  return (
    <a
      href={withBasePath(link.href)}
      aria-current={isCurrent ? "page" : undefined}
      className={`${dropdownNavLinkClass(isCurrent)}${className ? ` ${className}` : ""}`}
    >
      {link.label}
    </a>
  );
}

export function Header({ currentPath = "/" }: HeaderProps) {
  const isExplorePath = explorePaths.has(currentPath);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <header className="sticky top-0 z-50 h-[var(--site-header-height)] border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/90 backdrop-blur-md">
        <div className="relative mx-auto flex h-[var(--site-header-height)] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <a href={withBasePath(homeLink.href)} className="shrink-0 text-lg font-extrabold tracking-tight text-[var(--color-text-primary)]">
              enterpriseai.tools
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <HeaderSearch entries={headerSearchEntries} collapsed />

            <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
              <a
                href={withBasePath(homeLink.href)}
                aria-current={currentPath === homeLink.href ? "page" : undefined}
                className={navLinkClass(currentPath === homeLink.href)}
              >
                {homeLink.label}
              </a>

              <details className="group">
                <summary
                  aria-label="Explore the AI stack"
                  aria-current={isExplorePath ? "page" : undefined}
                  aria-haspopup="true"
                  title="Explore the AI stack"
                  className={`flex h-9 cursor-pointer list-none items-center gap-1 rounded-full px-3 text-sm font-medium transition [&::-webkit-details-marker]:hidden ${
                    isExplorePath
                      ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Explore
                  <ChevronDown size={14} className="transition group-open:rotate-180" />
                </summary>
                <div className="absolute right-4 top-[calc(100%-0.25rem)] z-50 grid w-[min(56rem,calc(100vw-2rem))] sm:right-6 lg:right-8 grid-cols-2 gap-x-2 gap-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 shadow-xl lg:grid-cols-4">
                  {exploreGroups.map((group) => (
                    <div key={group.id} className="flex min-w-0 flex-col gap-1">
                      <div className="px-3 pb-1">
                        <div className={groupHeadingClass}>{group.label}</div>
                        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{group.tagline}</p>
                      </div>
                      <NavLinkItem link={group.overview} currentPath={currentPath} className="text-[var(--color-text-primary)]" />
                      {group.links.map((link) => (
                        <NavLinkItem key={link.href} link={link} currentPath={currentPath} />
                      ))}
                    </div>
                  ))}
                </div>
              </details>

              {utilityLinks.map((item) => {
                const isCurrent = item.href === currentPath;

                return (
                  <a
                    key={item.href}
                    href={withBasePath(item.href)}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`${navLinkClass(isCurrent)}${item.href === "/start" ? " hidden lg:inline-flex" : ""}`}
                  >
                    {item.href === "/start" ? "Start here" : item.label}
                  </a>
                );
              })}
            </nav>

            <a
              href={githubStargazersUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Star the GitHub repository in a new tab"
              className="hidden h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)] xl:inline-flex"
            >
              <Star size={15} />
              <span>Star</span>
            </a>

            <button
              id="theme-toggle"
              type="button"
              aria-label="Switch to light mode"
              title="Switch to light mode"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
            >
              <Sun size={18} aria-hidden="true" className="theme-icon-when-dark" />
              <Moon size={18} aria-hidden="true" className="theme-icon-when-light" />
            </button>

            <details className="relative md:hidden">
              <summary
                aria-label="Open navigation menu"
                title="Open navigation menu"
                className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full text-[var(--color-text-secondary)] [&::-webkit-details-marker]:hidden"
              >
                <span className="sr-only">Open navigation menu</span>
                <Menu size={18} />
              </summary>
              <nav
                aria-label="Mobile"
                className="absolute right-0 mt-2 max-h-[calc(100dvh-var(--site-header-height)-1rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 shadow-xl"
              >
                <div className="mb-2">
                  <HeaderSearch entries={headerSearchEntries} compact />
                </div>
                <div className="flex flex-col gap-1">
                  <NavLinkItem link={homeLink} currentPath={currentPath} />
                  <div className={`px-3 pt-2 ${groupHeadingClass}`}>Explore the stack</div>
                  {exploreGroups.map((group) => {
                    const containsCurrent =
                      group.overview.href === currentPath || group.links.some((link) => link.href === currentPath);
                    return (
                      <details key={group.id} className="group/layer" open={containsCurrent}>
                        <summary
                          className={`flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden ${dropdownNavLinkClass(false)}`}
                        >
                          <span className="text-[var(--color-text-primary)]">{group.label}</span>
                          <ChevronDown size={14} aria-hidden="true" className="shrink-0 transition group-open/layer:rotate-180" />
                        </summary>
                        <div className="ml-3 flex flex-col gap-0.5 border-l border-[var(--color-border)] pl-2">
                          <NavLinkItem link={group.overview} currentPath={currentPath} />
                          {group.links.map((link) => (
                            <NavLinkItem key={link.href} link={link} currentPath={currentPath} />
                          ))}
                        </div>
                      </details>
                    );
                  })}
                  <div className={`px-3 pt-2 ${groupHeadingClass}`}>Decide</div>
                  {utilityLinks.map((item) => (
                    <NavLinkItem key={item.href} link={item} currentPath={currentPath} />
                  ))}
                  {uncategorizedLinks.length > 0 ? (
                    <>
                      <div className={`px-3 pt-2 ${groupHeadingClass}`}>More</div>
                      {uncategorizedLinks.map((item) => (
                        <NavLinkItem key={item.href} link={item} currentPath={currentPath} />
                      ))}
                    </>
                  ) : null}
                  <a
                    href={githubStargazersUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Star the GitHub repository in a new tab"
                    className="mt-2 inline-flex items-center gap-2 card-flat px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
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
