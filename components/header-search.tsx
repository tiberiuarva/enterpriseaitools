"use client";

import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import type { SearchEntry } from "@/lib/search";
import { basePath } from "@/lib/site";

type HeaderSearchProps = {
  entries: SearchEntry[];
  compact?: boolean;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matchesEntry(entry: SearchEntry, query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return true;
  }

  if (normalize(entry.label).includes(normalizedQuery)) {
    return true;
  }

  return entry.keywords.some((keyword) => normalize(keyword).includes(normalizedQuery));
}

function getRouterHref(href: string) {
  if (!basePath) {
    return href;
  }

  if (href === basePath) {
    return "/";
  }

  if (href === `${basePath}/`) {
    return "/";
  }

  if (href.startsWith(`${basePath}/`)) {
    return href.slice(basePath.length);
  }

  return href;
}

function getHrefParts(href: string) {
  const [path, hash] = href.split("#", 2);
  return {
    path: path || "/",
    hash: hash ? `#${hash}` : "",
  };
}

export function HeaderSearch({ entries, compact = false }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasQuery = query.trim().length > 0;

  const results = useMemo(() => {
    if (!hasQuery) {
      return [];
    }

    return entries.filter((entry) => matchesEntry(entry, query)).slice(0, 8);
  }, [entries, hasQuery, query]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const highlightedIndex = results.length > 0 ? Math.min(activeIndex, results.length - 1) : 0;

  function closeSearch() {
    setIsOpen(false);
  }

  function closeDetailsMenu() {
    const details = containerRef.current?.closest("details");
    if (details instanceof HTMLDetailsElement) {
      details.open = false;
    }
  }

  function navigateTo(href: string) {
    const routerHref = getRouterHref(href);
    const { path, hash } = getHrefParts(routerHref);

    closeSearch();
    closeDetailsMenu();

    if (path === pathname && hash) {
      window.location.hash = hash;
      return;
    }

    router.push(routerHref);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      closeSearch();
      event.currentTarget.blur();
      return;
    }

    if (!hasQuery || results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current - 1 + results.length) % results.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      navigateTo(results[highlightedIndex].href);
    }
  }

  const activeDescendant = isOpen && results[highlightedIndex] ? `${listboxId}-option-${highlightedIndex}` : undefined;

  return (
    <div ref={containerRef} className={`relative ${compact ? "w-full" : "hidden w-full max-w-sm md:block"}`}>
      <label className="sr-only" htmlFor={compact ? "site-search-mobile" : "site-search-desktop"}>
        Search tools and platforms
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" size={16} />
        <input
          id={compact ? "site-search-mobile" : "site-search-desktop"}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && hasQuery}
          aria-controls={isOpen && hasQuery && results.length > 0 ? listboxId : undefined}
          aria-activedescendant={activeDescendant}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search tools and platforms"
          className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] pl-9 pr-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)]"
        />
      </div>

      <div className="sr-only" aria-live="polite">
        {hasQuery ? `${results.length} matches found` : "Type to search tools and platforms"}
      </div>

      {isOpen && hasQuery ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-xl">
          <div className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            {results.length} matches
          </div>
          {results.length > 0 ? (
            <ul id={listboxId} role="listbox" className="max-h-96 overflow-y-auto p-2">
              {results.map((entry, index) => {
                const isActive = index === highlightedIndex;
                const optionId = `${listboxId}-option-${index}`;

                return (
                  <li key={entry.id} role="presentation">
                    <a
                      id={optionId}
                      role="option"
                      aria-selected={isActive}
                      href={entry.href}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={(event: ReactMouseEvent<HTMLAnchorElement>) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                          return;
                        }

                        event.preventDefault();
                        navigateTo(entry.href);
                      }}
                      className={`block rounded-lg px-3 py-2 transition ${isActive ? "bg-[var(--color-bg-card)]" : "hover:bg-[var(--color-bg-card)]"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">{entry.label}</span>
                        <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                          {entry.kind === "tool" ? "Tool" : "Platform"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-text-secondary)]">{entry.section}</div>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-4 text-sm text-[var(--color-text-secondary)]">No tools or platforms match that query yet.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
