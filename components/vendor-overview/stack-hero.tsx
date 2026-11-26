import type { CSSProperties } from "react";
import type { VendorOverview } from "@/lib/types";
import { domainCounts, formatPartialDate } from "@/lib/vendor-overview";
import { LENSES, audienceLens, lensStrength, toPercent, towerLayout, type LensCounts } from "@/lib/vendor-viz";
import { withBasePath } from "@/lib/site";

type Stat = { label: string; value: number };

function lensStyle(counts: LensCounts | undefined): CSSProperties {
  const style: Record<string, number> = {};
  for (const lens of LENSES) style[`--s-${lens.id}`] = lensStrength(counts?.byLens[lens.id] ?? 0, counts?.total ?? 0);
  return style as CSSProperties;
}

function LensCount({ counts, unit = "offerings" }: { counts: LensCounts | undefined; unit?: string }) {
  const total = counts?.total ?? 0;
  return (
    <span className="text-caption tabular-nums text-[var(--color-text-tertiary)]">
      <span data-lens-count="all">
        {total} {unit}
      </span>
      {LENSES.map((lens) => (
        <span key={lens.id} data-lens-count={lens.id}>
          {counts?.byLens[lens.id] ?? 0} of {total} for {lens.label.toLowerCase()}
        </span>
      ))}
    </span>
  );
}

export function StackHero({ overview, stats, sourcesCount }: { overview: VendorOverview; stats: Stat[]; sourcesCount: number }) {
  const tower = towerLayout(overview);
  const counts = domainCounts(overview);
  const lens = audienceLens(overview.entries);
  const domain = (id: string) => overview.domains.find((candidate) => candidate.id === id);
  const ecosystem = overview.domains.filter((item) => item.cluster === "ecosystem");
  const ecosystemCount = ecosystem.reduce((sum, item) => sum + (counts[item.id] ?? 0), 0);
  const direct = overview.availability.filter((item) => item.channel !== "partner").length;
  const partner = overview.availability.length - direct;
  const vb = tower.viewBox;

  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6">
      <div className="flex min-w-0 flex-col gap-5">
        <p className="text-caption uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Vendor stack · {overview.name}</p>
        <h1 id="overview-heading" className="vo-gradient-text text-display">
          {overview.title}
        </h1>
        <p className="max-w-xl text-body text-[var(--color-text-secondary)]">{overview.description}</p>

        <dl className="grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex min-w-0 flex-col-reverse">
              <dt className="text-caption leading-tight text-[var(--color-text-secondary)]">{stat.label}</dt>
              <dd className="mb-1.5 text-[2rem] font-semibold leading-none tracking-tight text-[var(--color-text-primary)]">
                <span aria-hidden="true" className="vo-count" style={{ "--to": stat.value } as CSSProperties} />
                <span className="sr-only">{stat.value}</span>
              </dd>
            </div>
          ))}
        </dl>

        <fieldset className="vo-lens flex min-w-0 flex-col gap-2">
          <legend className="mb-2 text-caption text-[var(--color-text-secondary)]">Light up the stack for</legend>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap">
            <input type="radio" name="vo-lens" id="lens-all" value="all" defaultChecked />
            <label htmlFor="lens-all">Everyone</label>
            {LENSES.map((item) => (
              <span key={item.id} className="contents">
                <input type="radio" name="vo-lens" id={`lens-${item.id}`} value={item.id} />
                <label htmlFor={`lens-${item.id}`}>
                  {item.label}
                  <span className="tabular-nums opacity-60">{lens.totals[item.id]}</span>
                </label>
              </span>
            ))}
          </div>
        </fieldset>

        <p className="-mt-2 text-sm">
          {LENSES.map((item) => (
            <a key={item.id} href="#catalog" data-catalog-audience={item.catalogAudience} data-lens-count={item.id} className="font-medium text-[var(--color-accent)] hover:underline">
              Browse what fits {item.label.toLowerCase()} in the catalog →
            </a>
          ))}
        </p>

        <p className="text-caption text-[var(--color-text-tertiary)]">
          Reviewed <time dateTime={overview.reviewedAt}>{formatPartialDate(overview.reviewedAt)}</time> against {sourcesCount} primary sources ·{" "}
          <a href={withBasePath("/methodology")} className="text-[var(--color-accent)] hover:underline">
            how we source
          </a>
        </p>
      </div>

      <figure id="map" className="vo-tower m-0 min-w-0 scroll-mt-40 max-sm:overflow-hidden" aria-labelledby="tower-caption">
        <svg
          viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`}
          aria-hidden="true"
          focusable="false"
          className="max-sm:!w-[var(--svg-w)] max-sm:max-w-none"
          style={{ "--svg-w": `${Math.round(100 / tower.drawingShare)}%` } as CSSProperties}
        >
          <ellipse className="vo-ring" cx={tower.ring.cx} cy={tower.ring.cy} rx={tower.ring.rx} ry={tower.ring.ry} />
          <g className="vo-drop" style={{ "--i": 0 } as CSSProperties}>
            <a href="#availability" tabIndex={-1} className="vo-plate">
              <polygon className="vo-face-left" points={tower.base.left} />
              <polygon className="vo-face-right" points={tower.base.right} />
              <polygon className="vo-face-top" points={tower.base.top} />
              {tower.studs.map(([cx, cy], index) => (
                <ellipse key={index} className="vo-stud" cx={cx} cy={cy - 2} rx={7} ry={4} />
              ))}
            </a>
          </g>
          {tower.dots.map((dot) => (
            <a key={dot.domainId} href={`#${dot.domainId}`} tabIndex={-1}>
              <circle className="vo-dot-halo" cx={dot.at[0]} cy={dot.at[1]} r={13} />
              <circle className="vo-dot" cx={dot.at[0]} cy={dot.at[1]} r={6} style={lensStyle(lens.domains.get(dot.domainId))} />
            </a>
          ))}
          {tower.slabs.map((slab) => (
            <g key={slab.domainId} className="vo-drop" style={{ "--i": slab.level + 1 } as CSSProperties}>
              <a href={`#catalog-${slab.domainId}`} tabIndex={-1}>
                <g className="vo-slab" data-slot={slab.slot} style={lensStyle(lens.domains.get(slab.domainId))}>
                  <polygon className="vo-face-left" points={slab.faces.left} />
                  <polygon className="vo-face-right" points={slab.faces.right} />
                  <polygon className="vo-face-top" points={slab.faces.top} />
                </g>
              </a>
            </g>
          ))}
          {[...tower.slabs.map((slab) => ({ from: slab.anchor, to: slab.label, key: slab.domainId, slot: String(slab.slot) })), { from: tower.baseAnchor, to: tower.baseLabel, key: "base", slot: "base" }].map(
            ({ from, to, key, slot }) => (
              <g key={key} data-leader={slot} className="hidden sm:inline">
                <polyline className="vo-leader" points={`${from[0] + 3},${from[1]} ${to[0] - 26},${to[1]} ${to[0] - 8},${to[1]}`} />
                <circle className="vo-leader-dot" cx={from[0] + 3} cy={from[1]} r={3.5} />
              </g>
            ),
          )}
        </svg>

        <ol className="hidden sm:block">
          {tower.slabs.map((slab) => {
            const item = domain(slab.domainId);
            const at = toPercent(slab.label, vb);
            return (
              <li key={slab.domainId}>
                <a
                  href={`#catalog-${slab.domainId}`}
                  data-for={slab.slot}
                  className="vo-label"
                  style={{ left: `${at.left}%`, top: `${at.top}%`, ...lensStyle(lens.domains.get(slab.domainId)) }}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    <span className="vo-swatch" data-slot={slab.slot} aria-hidden="true" />
                    {item?.label}
                  </span>
                  <LensCount counts={lens.domains.get(slab.domainId)} />
                </a>
              </li>
            );
          })}
          <li>
            <a
              href="#availability"
              className="vo-label"
              style={{ left: `${toPercent(tower.baseLabel, vb).left}%`, top: `${toPercent(tower.baseLabel, vb).top}%` }}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                <span className="vo-swatch" aria-hidden="true" style={{ background: "var(--color-text-tertiary)" }} />
                Runs on
              </span>
              <span className="text-caption text-[var(--color-text-tertiary)]">
                {direct} platforms + {partner} partner products
              </span>
            </a>
          </li>
          <li>
            <a href="#ecosystem" className="vo-label" style={{ left: "0%", top: "94%" }}>
              <span className="flex items-center gap-2 text-sm font-semibold text-[var(--viz-eco)]">
                <span className="vo-swatch" aria-hidden="true" style={{ background: "var(--viz-eco)", borderRadius: "9999px" }} />
                Ecosystem
              </span>
              <span className="text-caption text-[var(--color-text-tertiary)]">
                {ecosystem.length} families · {ecosystemCount} offerings
              </span>
            </a>
          </li>
        </ol>

        {/* Small screens: the same labels as a keyed list under the drawing. */}
        <ol className="mt-4 grid grid-cols-1 gap-1 sm:hidden">
          {[...tower.slabs].reverse().map((slab) => (
            <li key={slab.domainId}>
              <a href={`#catalog-${slab.domainId}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--color-bg-hover)]">
                <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                  <span className="vo-swatch" data-slot={slab.slot} aria-hidden="true" />
                  {domain(slab.domainId)?.label}
                </span>
                <LensCount counts={lens.domains.get(slab.domainId)} />
              </a>
            </li>
          ))}
          <li>
            <a href="#ecosystem" className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--color-bg-hover)]">
              <span className="flex items-center gap-2 text-sm font-semibold text-[var(--viz-eco)]">
                <span className="vo-swatch" aria-hidden="true" style={{ background: "var(--viz-eco)" }} />
                Ecosystem
              </span>
              <span className="text-caption text-[var(--color-text-tertiary)]">{ecosystemCount} offerings</span>
            </a>
          </li>
        </ol>
        <figcaption id="tower-caption" className="sr-only">
          The {overview.name} product stack from the bottom up: {tower.slabs.map((slab) => `${domain(slab.domainId)?.label} (${counts[slab.domainId]})`).join(", ")}. It runs on {direct}{" "}
          platforms and {partner} partner products, surrounded by {ecosystem.length} ecosystem families: {ecosystem.map((item) => item.label).join(", ")}.
        </figcaption>
      </figure>
    </div>
  );
}
