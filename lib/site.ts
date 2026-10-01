const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
export const basePath = rawBasePath && rawBasePath !== '/' ? rawBasePath.replace(/\/$/, '') : '';

export const navItems = [
  { href: '/', label: 'Home' },
  { href: '/platforms', label: 'Cloud AI platforms' },
  { href: '/build', label: 'Build & orchestrate' },
  { href: '/agents', label: 'Agent frameworks' },
  { href: '/orchestration', label: 'Workflows & orchestration' },
  { href: '/control-plane', label: 'Control plane' },
  { href: '/control-planes', label: 'Registry & management' },
  { href: '/agent-identity', label: 'Identity & access' },
  { href: '/governance', label: 'Guardrails & security' },
  { href: '/observability', label: 'Monitoring & evaluation' },
  { href: '/gateways', label: 'AI & MCP gateways' },
  { href: '/use', label: 'Use' },
  { href: '/assistants', label: 'Assistants & copilots' },
  { href: '/always-on-agents', label: 'Always-on agents' },
  { href: '/stacks/microsoft', label: 'Microsoft stack' },
  { href: '/stacks/aws', label: 'AWS stack' },
  { href: '/stacks/google', label: 'Google stack' },
  { href: '/start', label: 'Start with your question' },
  { href: '/evaluate', label: 'Evaluate' },
  // The full index and comparison pages are contextual rather than
  // navigational: header.tsx shows them only in the mobile "More" group.
  { href: '/tools', label: 'All tracked tools' },
  { href: '/tools/compare', label: 'Compare tools' },
  { href: '/updates', label: 'Updates' },
  { href: '/about', label: 'About' },
] as const;

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
