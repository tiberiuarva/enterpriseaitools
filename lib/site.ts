const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
export const basePath = rawBasePath && rawBasePath !== '/' ? rawBasePath.replace(/\/$/, '') : '';

export const navItems = [
  { href: '/', label: 'Home' },
  { href: '/platforms', label: 'Platforms' },
  { href: '/agents', label: 'Agents' },
  { href: '/orchestration', label: 'Orchestration' },
  { href: '/governance', label: 'Governance' },
  { href: '/assistants', label: 'Assistants' },
  { href: '/evaluate', label: 'Evaluate' },
  // Intentionally not in the desktop categoryNav/utility groups (header.tsx):
  // comparison intent is contextual, not navigational, so this stays out of the
  // desktop bar (Hick's law) and surfaces only under the mobile "More" group via
  // the uncategorizedLinks filter. Contextual cross-links carry desktop discovery.
  { href: '/tools/compare', label: 'Compare tools' },
  { href: '/updates', label: 'Updates' },
  { href: '/about', label: 'About' },
] as const;

export const githubRepoUrl = 'https://github.com/tiberiuarva/enterpriseaitools';
export const githubStargazersUrl = 'https://github.com/tiberiuarva/enterpriseaitools/stargazers';
export const platformPageHref = '/platforms';

export function withBasePath(path: string) {
  if (!path) {
    return basePath || '/';
  }
  if (!basePath || !path.startsWith('/')) {
    return path;
  }
  return path === '/' ? `${basePath}/` : `${basePath}${path}`;
}
