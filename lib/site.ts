const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/enterpriseai-tools";

export function withBasePath(path: string) {
  if (!path.startsWith("/")) return path;
  if (path === "/") return `${basePath}/`;
  return `${basePath}${path}`;
}

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
export const githubStargazersUrl = `${githubRepoUrl}/stargazers`;
export const platformPageHref = '/platforms';
