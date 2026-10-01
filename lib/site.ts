import { CATEGORIES, FOUNDATION_LINK, STACK_LAYERS } from './categories.ts';
import { getPlatformFragmentId } from './platform-fragments.ts';
import { VENDOR_STACKS } from './stacks.ts';

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
export const basePath = rawBasePath && rawBasePath !== '/' ? rawBasePath.replace(/\/$/, '') : '';

// Category, layer and vendor-stack entries derive from lib/categories.ts and
// lib/stacks.ts so labels cannot drift from the header and footer.
export const navItems: readonly { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: FOUNDATION_LINK.href, label: FOUNDATION_LINK.title },
  ...STACK_LAYERS.flatMap((layer) => [
    { href: layer.href, label: layer.label },
    ...layer.categories.map((category) => ({ href: `/${category}`, label: CATEGORIES[category].navLabel })),
  ]),
  ...VENDOR_STACKS.map((stack) => ({ href: `/stacks/${stack.slug}`, label: `${stack.name} stack` })),
  { href: '/start', label: 'Start with your question' },
  { href: '/evaluate', label: 'Evaluate' },
  // The full index and comparison pages are contextual rather than
  // navigational: header.tsx shows them only in the mobile "More" group.
  { href: '/tools', label: 'All tracked tools' },
  { href: '/tools/compare', label: 'Compare tools' },
  { href: '/updates', label: 'Updates' },
  { href: '/about', label: 'About' },
];

export const githubRepoUrl = 'https://github.com/tiberiuarva/enterpriseaitools';
export const githubStargazersUrl = 'https://github.com/tiberiuarva/enterpriseaitools/stargazers';
export const platformPageHref = '/platforms';

// A final path segment carrying an extension is a file (`/updates.xml`,
// `/logos/n8n.svg`, `/api/v1/index.json`), never a page directory.
const FILE_SEGMENT_PATTERN = /\.[a-z0-9]+$/i;

/**
 * Normalises an internal page link to the canonical trailing-slash form.
 *
 * `next.config.ts` sets `trailingSlash: true`, so every exported page lives at
 * `<route>/index.html` and every canonical URL ends in `/`. Linking to
 * `/platforms` instead of `/platforms/` made the host serve the same page at
 * two URLs, which search engines treat as duplicates. Query strings and hash
 * fragments are preserved after the slash; file paths are returned untouched.
 */
export function withTrailingSlash(path: string) {
  if (!path.startsWith('/')) {
    return path;
  }

  const suffixStart = path.search(/[?#]/);
  const pathname = suffixStart === -1 ? path : path.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? '' : path.slice(suffixStart);

  if (pathname.endsWith('/')) {
    return path;
  }

  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);

  if (FILE_SEGMENT_PATTERN.test(lastSegment)) {
    return path;
  }

  return `${pathname}/${suffix}`;
}

export function withBasePath(path: string) {
  if (!path) {
    return basePath || '/';
  }
  if (!path.startsWith('/')) {
    return path;
  }

  const normalized = withTrailingSlash(path);

  return basePath ? `${basePath}${normalized}` : normalized;
}

// Where an update's subject lives: platform updates point at the platform's
// anchor on /platforms, everything else at its tool page.
export function updateSubjectHref(update: { category: string; toolId: string }): string {
  return update.category === 'platforms' ? `/platforms#${getPlatformFragmentId(update.toolId)}` : `/tools/${update.toolId}`;
}
