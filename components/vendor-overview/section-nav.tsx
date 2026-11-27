"use client";

import { useEffect, useRef, useState } from "react";

export type SectionNavLink = { id: string; label: string };

// Sections count as "reached" once their top passes just under the sticky header
// and this bar.
const ACTIVE_OFFSET = 160;

// "On this page" bar. Plain anchor links that work without JS; the effect only
// adds the active-section highlight.
export function SectionNav({ links }: { links: SectionNavLink[] }) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = links.map((link) => link.id);
    let frame = 0;
    const update = () => {
      frame = 0;
      // Document order, not nav order: the active section is the last one whose top has scrolled past the bar.
      const reached = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null && el.getBoundingClientRect().top <= ACTIVE_OFFSET)
        .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
      setActive(reached[0]?.id ?? null);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [links]);

  useEffect(() => {
    if (!active || !listRef.current) return;
    const link = listRef.current.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (!link) return;
    const container = listRef.current;
    container.scrollTo({ left: Math.max(0, link.offsetLeft - container.clientWidth / 2 + link.clientWidth / 2) });
  }, [active]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[var(--site-header-height)] z-40 -mx-4 border-y border-[var(--color-border)] bg-[var(--color-bg-primary)]/90 backdrop-blur-md sm:-mx-6 lg:-mx-8"
    >
      <div ref={listRef} className="flex snap-x overflow-x-auto px-4 py-2.5 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
        <ul className="flex shrink-0 items-center gap-1">
          {links.map((link) => {
            const isActive = active === link.id;
            return (
              <li key={link.id} className="snap-start">
                <a
                  href={`#${link.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
