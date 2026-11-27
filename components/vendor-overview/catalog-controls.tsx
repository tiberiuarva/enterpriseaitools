"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Option = { id: string; label: string; count?: number };

// Thin controller over the server-rendered catalog: it only toggles `hidden`
// and `open` on elements carrying data-* attributes, so the full catalog stays
// in the HTML (indexable, usable without JS) and no entry data ships as props.
export function CatalogControls({
  targetId,
  facets,
  audiences,
  total,
}: {
  targetId: string;
  facets: Option[];
  audiences: Option[];
  total: number;
}) {
  const [query, setQuery] = useState("");
  const [facet, setFacet] = useState("all");
  const [audience, setAudience] = useState("all");
  // The count is written straight into the DOM from the effect that filters it.
  const shownRef = useRef<HTMLSpanElement>(null);
  const filtering = query.trim() !== "" || facet !== "all" || audience !== "all";
  // A deep link to an offering the filters hide waits here until the filters
  // are cleared and the effect below has unhidden it.
  const pendingReveal = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    // While filtering, matches show as one flat list without the "show more" toggles.
    root.toggleAttribute("data-filtering", filtering);
    let count = 0;
    root.querySelectorAll<HTMLElement>("[data-entry]").forEach((el) => {
      const matches =
        (facet === "all" || (el.dataset.facets ?? "").split(" ").includes(facet)) &&
        (audience === "all" || (el.dataset.audience ?? "").split(" ").includes(audience)) &&
        terms.every((term) => (el.dataset.search ?? "").includes(term));
      el.hidden = !matches;
      if (matches) count += Number(el.dataset.weight ?? "1");
    });
    root.querySelectorAll<HTMLElement>("[data-filter-group]").forEach((group) => {
      group.hidden = group.querySelector("[data-entry]:not([hidden])") === null;
    });
    // Filtering opens "show more" lists that hold matches; clearing closes the
    // ones it opened, so the directory returns to its short form.
    root.querySelectorAll<HTMLDetailsElement>("details[data-more]").forEach((details) => {
      const hasMatch = details.querySelector("[data-entry]:not([hidden])") !== null;
      details.hidden = filtering && !hasMatch;
      if (filtering && hasMatch && !details.open) {
        details.open = true;
        details.dataset.autoOpened = "";
      } else if (!filtering && details.dataset.autoOpened !== undefined) {
        details.open = false;
        delete details.dataset.autoOpened;
      }
    });
    const empty = root.querySelector<HTMLElement>("[data-empty]");
    if (empty) empty.hidden = count > 0;
    if (shownRef.current) shownRef.current.textContent = String(count);
    const pending = pendingReveal.current;
    pendingReveal.current = null;
    pending?.();
  }, [targetId, query, facet, audience, filtering]);

  // Deep links (map tiles, highlights, shared URLs) can point inside a closed
  // catalog family, "show more" list or timeline year: open every enclosing
  // <details>, then scroll. One listener serves the whole page.
  useEffect(() => {
    const reveal = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      // An offering's detail card is a popover: a link to the offering (or to
      // something it includes) scrolls to its name and opens the card.
      const card = target.closest<HTMLElement>("[popover]") ?? target.querySelector<HTMLElement>(":scope > [popover]");
      const anchor = (card && document.querySelector<HTMLElement>(`[popovertarget="${card.id}"]`)) || target;
      // A filter can hide the linked offering, and a popover inside a hidden
      // element never shows: clear the filters and reveal once they are applied.
      if (anchor.closest("[hidden]") && document.getElementById(targetId)?.hasAttribute("data-filtering")) {
        pendingReveal.current = reveal;
        setQuery("");
        setFacet("all");
        setAudience("all");
        return;
      }
      for (let node = anchor.parentElement; node; node = node.parentElement) {
        if (node instanceof HTMLDetailsElement) node.open = true;
      }
      anchor.scrollIntoView({ block: card ? "center" : "start" });
      if (card && !card.matches(":popover-open")) card.showPopover();
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => {
      window.removeEventListener("hashchange", reveal);
      pendingReveal.current = null;
    };
  }, [targetId]);

  // Links elsewhere on the page (the hero's audience lens) can preset the
  // audience filter with data-catalog-audience before jumping here.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLElement>("[data-catalog-audience]");
      const value = link?.dataset.catalogAudience;
      if (value && audiences.some((option) => option.id === value)) setAudience(value);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [audiences]);

  const reset = () => {
    setQuery("");
    setFacet("all");
    setAudience("all");
  };

  const chip = (active: boolean) =>
    `inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition ${
      active
        ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
    }`;

  return (
    <div className="flex flex-col gap-3" role="search" aria-label="Filter offerings">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex min-w-0 flex-1 items-center">
          <span className="sr-only">Search offerings</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 text-[var(--color-text-tertiary)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${total} offerings by name, former name or what they do`}
            className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-2 pl-9 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)]"
          />
        </label>
        <label className="flex min-w-0 sm:flex-none">
          <span className="sr-only">Audience</span>
          <select
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 text-sm text-[var(--color-text-primary)]"
          >
            <option value="all">For anyone</option>
            {audiences.map((option) => (
              <option key={option.id} value={option.id}>
                For {option.label.toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:pb-0" role="group" aria-label="Show">
          {[{ id: "all", label: "Everything", count: total }, ...facets].map((option) => (
            <button key={option.id} type="button" aria-pressed={facet === option.id} onClick={() => setFacet(option.id)} className={chip(facet === option.id)}>
              {option.label}
              {option.count !== undefined ? <span className="tabular-nums opacity-70">{option.count}</span> : null}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
          <p aria-live="polite">
            Showing <span ref={shownRef} className="font-semibold tabular-nums text-[var(--color-text-primary)]">{total}</span> of {total}
          </p>
          {filtering ? (
            <button type="button" onClick={reset} className="inline-flex min-h-9 items-center gap-1 rounded-full px-2 font-medium text-[var(--color-accent)] hover:underline">
              <X size={14} aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
