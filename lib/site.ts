export const navItems = [
  { href: '/', label: 'Home' },
  { href: '/platforms', label: 'Platforms' },
  { href: '/agents', label: 'Agents' },
  { href: '/orchestration', label: 'Orchestration' },
  { href: '/governance', label: 'Governance' },
  { href: '/assistants', label: 'Assistants' },
  { href: '/updates', label: 'Updates' },
  { href: '/about', label: 'About' },
] as const;

export const githubRepoUrl = 'https://github.com/tiberiuarva/enterpriseaitools';
export const githubStargazersUrl = 'https://github.com/tiberiuarva/enterpriseaitools/stargazers';
export const platformPageHref = '/platforms';
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function withBasePath(path: string) {
  if (!path) return basePath || '/';
  if (/^https?:\/\//.test(path)) return path;
  if (!path.startsWith('/')) return `${basePath}/${path}`;
  return `${basePath}${path}` || '/';
}
