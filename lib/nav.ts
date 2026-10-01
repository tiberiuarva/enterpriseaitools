import { CATEGORIES, FOUNDATION_LINK, STACK_LAYERS } from "./categories.ts";
import { getPlatformFragmentId } from "./platform-fragments.ts";
import { VENDOR_STACKS } from "./stacks.ts";

// Server-only navigation data. Kept out of lib/site.ts because client
// components import that module, and this would ship the category copy
// to every page's JavaScript.

// Category, layer and vendor-stack entries derive from lib/categories.ts and
// lib/stacks.ts so labels cannot drift from the header and footer.
// shortLabel is the compact form for the desktop header bar.
export const navItems: readonly { href: string; label: string; shortLabel?: string }[] = [
  { href: "/", label: "Home" },
  { href: FOUNDATION_LINK.href, label: FOUNDATION_LINK.title },
  ...STACK_LAYERS.flatMap((layer) => [
    { href: layer.href, label: layer.label },
    ...layer.categories.map((category) => ({ href: `/${category}`, label: CATEGORIES[category].navLabel })),
  ]),
  { href: "/stacks", label: "All vendor stacks" },
  ...VENDOR_STACKS.map((stack) => ({ href: `/stacks/${stack.slug}`, label: `${stack.name} stack` })),
  { href: "/start", label: "Start with your question", shortLabel: "Start here" },
  { href: "/evaluate", label: "Evaluate" },
  // The full index and comparison pages are contextual rather than
  // navigational: header.tsx shows them only in the mobile "More" group.
  { href: "/tools", label: "All tracked tools" },
  { href: "/tools/compare", label: "Compare tools" },
  { href: "/updates", label: "Updates" },
  { href: "/about", label: "About" },
];

// Where an update's subject lives: platform updates point at the platform's
// anchor on /platforms, everything else at its tool page.
export function updateSubjectHref(update: { category: string; toolId: string }): string {
  return update.category === "platforms" ? `/platforms#${getPlatformFragmentId(update.toolId)}` : `/tools/${update.toolId}`;
}
