"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchEntry } from "@/lib/search";

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

export function HeaderSearch({ entries, compact = false }: HeaderSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  function navigateTo(href: string) {
    setIsOpen(false);

    const details = containerRef.current?.closest("details");
    if (details instanceof HTMLDetailsElement) {
      details.open = false;
    }

    window.location.assign(href);
  }

  const results = useMemo(() => {
    const filtered = entries.filter((entry) => matchesEntry(entry, query));
    return filtered.slice(0, query.trim().length > 0 ? 8 : 6);
  }, [entries, query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

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
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results.length > 0) {
              event.preventDefault();
              navigateTo(results[0].href);
              return;
            }

            if (event.key === "Escape") {
              setIsOpen(false);
              (event.target as HTMLInputElement).blur();
            }
          }}
          placeholder="Search tools and platforms"
          className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] pl-9 pr-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)]"
        />
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-xl">
          <div className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            {query.trim().length > 0 ? `${results.length} matches` : "Jump to a page or card"}
          </div>
          {results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto p-2">
              {results.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={entry.href}
                    onClick={(event) => {
                      event.preventDefault();
                      navigateTo(entry.href);
                    }}
                    className="block rounded-lg px-3 py-2 transition hover:bg-[var(--color-bg-card)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{entry.label}</span>
                      <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                        {entry.kind}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-secondary)]">{entry.section}</div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-sm text-[var(--color-text-secondary)]">No tools or platforms match that query yet.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
