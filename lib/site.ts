const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
export const basePath = rawBasePath && rawBasePath !== '/' ? rawBasePath.replace(/\/$/, '') : '';

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

export function withBasePath(path: string) {
  if (!path) {
    return basePath || '/';
  }
  if (!basePath || !path.startsWith('/')) {
    return path;
  }
  return path === '/' ? `${basePath}/` : `${basePath}${path}`;
}
