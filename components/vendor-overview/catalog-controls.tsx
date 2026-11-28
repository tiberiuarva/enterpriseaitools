"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { lensActive, lensMatches, searchTerms } from "@/lib/offerings-mosaic";

type Facet = { id: string; label: string; title: string; count: number };
type Lens = { id: string; label: string; audiences: string[]; alias: string };

// Thin controller over the server-rendered mosaic. A lens never hides a tile:
// it marks the ones that do not match with data-dim, so the map keeps its
// shape, the whole catalog stays in the HTML (indexable, usable without JS)
// and no entry data ships as props.
export function CatalogControls({ targetId, facets, lenses, total }: { targetId: string; facets: Facet[]; lenses: Lens[]; total: number }) {
  const [query, setQuery] = useState("");
  const [facet, setFacet] = useState("");
  const [audience, setAudience] = useState("");
  // The count is written straight into the DOM from the effect that dims tiles.
  const litRef = useRef<HTMLSpanElement>(null);
  const lensing = query.trim() !== "" || facet !== "" || audience !== "";

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    const lens = { facet, audiences: lenses.find((item) => item.id === audience)?.audiences ?? [], terms: searchTerms(query) };
    const active = lensActive(lens);
    root.toggleAttribute("data-lensing", active);
    let lit = 0;
    const litByFamily = new Map<string, number>();
    root.querySelectorAll<HTMLElement>("[data-entry]").forEach((el) => {
      const matches = lensMatches({ facets: el.dataset.facets ?? "", audience: el.dataset.audience ?? "", search: el.dataset.search ?? "" }, lens);
      el.toggleAttribute("data-dim", active && !matches);
      if (!matches) return;
      const weight = Number(el.dataset.weight ?? "1");
      const family = el.closest<HTMLElement>("[data-family]")?.dataset.family ?? "";
      lit += weight;
      litByFamily.set(family, (litByFamily.get(family) ?? 0) + weight);
    });
    root.querySelectorAll<HTMLElement>("[data-family]").forEach((block) => {
      block.toggleAttribute("data-dim", active && !litByFamily.has(block.dataset.family ?? ""));
    });
    // Family counts, in the blocks and in the jump bar, follow the lens.
    (root.closest("[data-mosaic]") ?? root).querySelectorAll<HTMLElement>("[data-family-count]").forEach((el) => {
      const count = litByFamily.get(el.dataset.familyCount ?? "") ?? 0;
      el.textContent = active ? `${count}/${el.dataset.total}` : (el.dataset.total ?? "");
      el.parentElement?.toggleAttribute("data-dim", active && count === 0);
    });
    const empty = root.querySelector<HTMLElement>("[data-empty]");
    if (empty) empty.hidden = lit > 0;
    if (litRef.current) litRef.current.textContent = String(lit);
  }, [targetId, lenses, query, facet, audience]);

  // Deep links (map tiles, highlights, shared URLs) can point at an offering,
  // at something an offering includes, or inside a closed timeline year: open
  // every enclosing <details>, scroll, and open the offering's detail card.
  // One listener serves the whole page.
  useEffect(() => {
    const reveal = () => {
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return; // A mangled shared link: ignore it rather than crash the page.
      }
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      // The card is a popover: either the target sits inside it (an included
      // offering) or the target is the tile that owns it.
      const card = target.closest<HTMLElement>("[popover]") ?? target.querySelector<HTMLElement>(":scope > [popover]");
      const anchor = (card && document.querySelector<HTMLElement>(`[popovertarget="${card.id}"]`)) || target;
      for (let node = anchor.parentElement; node; node = node.parentElement) {
        if (node instanceof HTMLDetailsElement) node.open = true;
      }
      anchor.scrollIntoView({ block: card ? "center" : "start" });
      if (card && typeof card.showPopover === "function" && !card.matches(":popover-open")) card.showPopover();
    };
    // Selecting a link to the hash already in the URL fires no hashchange, so
    // a card closed after a first visit would never reopen: handle that here.
    const onSameHashClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href^='#']");
      if (!link || link.hash === "" || link.hash !== window.location.hash) return;
      event.preventDefault();
      reveal();
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    document.addEventListener("click", onSameHashClick);
    return () => {
      window.removeEventListener("hashchange", reveal);
      document.removeEventListener("click", onSameHashClick);
    };
  }, []);

  // Links elsewhere on the page (the hero's audience lens) can preset the
  // lens with data-catalog-audience before jumping here.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLElement>("[data-catalog-audience]");
      const match = lenses.find((item) => item.alias === link?.dataset.catalogAudience);
      if (match) setAudience(match.id);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenses]);

  const reset = () => {
    setQuery("");
    setFacet("");
    setAudience("");
  };

  return (
    <div className="flex flex-col gap-3" role="search" aria-label="Light up offerings">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex min-w-0 flex-1 items-center">
          <span className="sr-only">Find an offering</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 text-[var(--color-text-tertiary)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find an offering by name, former name or what it does"
            className="min-h-10 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-2 pl-9 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)]"
          />
        </label>
        <div className="flex gap-1.5" role="group" aria-label="Status">
          {facets.map((option) => (
            <button
              key={option.id}
              type="button"
              title={option.title}
              aria-pressed={facet === option.id}
              onClick={() => setFacet(facet === option.id ? "" : option.id)}
              className="vo-chip"
              data-tone={option.id}
            >
              {option.label}
              <span className="tabular-nums opacity-70">{option.count}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-x-4 gap-y-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span id={`${targetId}-lens`} className="shrink-0 text-caption text-[var(--color-text-secondary)]">
            Light up for
          </span>
          <div className="vo-chip-row" role="group" aria-labelledby={`${targetId}-lens`}>
            {[{ id: "", label: "Everyone" }, ...lenses].map((option) => (
              <button key={option.id} type="button" aria-pressed={audience === option.id} onClick={() => setAudience(option.id)} className="vo-chip">
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-h-8 shrink-0 items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <p aria-live="polite">
            <span ref={litRef} className="font-semibold tabular-nums text-[var(--color-text-primary)]">
              {total}
            </span>{" "}
            {lensing ? `of ${total} lit` : "offerings"}
          </p>
          {lensing ? (
            <button type="button" onClick={reset} className="inline-flex min-h-8 items-center gap-1 rounded-full px-2 font-medium text-[var(--color-accent)] hover:underline">
              <X size={14} aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
