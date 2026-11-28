import type { CSSProperties } from "react";
import type { SourceRef, VendorModel, VendorModelStatus } from "@/lib/types";
import { formatPartialDate, formatUsd } from "@/lib/vendor-overview";
import { modelMap, priceDelta, priceLadder, stationLabel } from "@/lib/vendor-viz";
import { ModelLineage } from "./model-lineage";
import { SourceLink } from "./primitives";

const STATUS_LABEL: Record<VendorModelStatus, string> = {
  current: "Current",
  legacy: "Still available",
  deprecated: "Deprecated",
  retired: "Retired",
};

const LANE_H = 56;
const POP_H = 230;

// Lines still in service take the accent; closed lines go neutral. The tier
// label at the start of each line names it, so colour need not.
function laneColor(live: boolean) {
  return live ? "var(--color-accent)" : "var(--color-text-tertiary)";
}

function StationCard({ model }: { model: VendorModel }) {
  return (
    <>
      <span className="block text-sm font-semibold text-[var(--color-text-primary)]">{model.name}</span>
      <code className="mt-0.5 block text-[0.6875rem] text-[var(--color-text-tertiary)]">{model.apiId}</code>
      <span className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-[var(--color-text-secondary)]">
        <span>Released</span>
        <span className="text-[var(--color-text-primary)]">{formatPartialDate(model.releasedAt)}</span>
        <span>Status</span>
        <span className="text-[var(--color-text-primary)]">
          {STATUS_LABEL[model.status]}
          {model.retiresAt ? ` · ${model.status === "retired" ? "retired" : "retires"} ${formatPartialDate(model.retiresAt)}` : ""}
        </span>
        {model.contextWindow ? (
          <>
            <span>Context</span>
            <span className="text-[var(--color-text-primary)]">
              {model.contextWindow}
              {model.maxOutput ? ` · ${model.maxOutput} out` : ""}
            </span>
          </>
        ) : null}
        {model.pricing ? (
          <>
            <span>Price</span>
            <span className="text-[var(--color-text-primary)]">
              {formatUsd(model.pricing.inputPerMTok)} in / {formatUsd(model.pricing.outputPerMTok)} out per M tokens
            </span>
          </>
        ) : null}
      </span>
      {model.highlight ? <span className="mt-2 block text-xs leading-5 text-[var(--color-text-secondary)]">{model.highlight}</span> : null}
      <span className="mt-2 block">
        <SourceLink href={model.sourceUrl} label={model.sourceTitle} />
      </span>
    </>
  );
}

export function ModelMap({
  models,
  today,
  statusSource,
  label,
  priceNotes = [],
}: {
  models: VendorModel[];
  today: string;
  statusSource?: SourceRef;
  label: string;
  priceNotes?: { text: string; sourceUrl: string }[];
}) {
  const map = modelMap(models, today);
  const laneIndex = new Map(map.lanes.map((lane, index) => [lane.tier, index]));
  const current = models.filter((model) => model.status === "current").length;
  const height = map.lanes.length * LANE_H + 40;
  // A station card is about 230px tall and the scroller clips vertically, so
  // each lane opens its cards on whichever side has room.
  const side = (index: number) => (40 + index * LANE_H + LANE_H / 2 + POP_H <= height ? "below" : "above");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-caption text-[var(--color-text-secondary)]" aria-label="Station legend">
          {(["current", "legacy", "deprecated", "retired"] as VendorModelStatus[]).map((status) => (
            <li key={status} className="inline-flex items-center gap-2">
              <span className="vo-station !static !m-0 !h-4 !w-4" data-status={status} style={{ "--lane": "var(--color-accent)" } as CSSProperties} aria-hidden="true" />
              {STATUS_LABEL[status]}
            </li>
          ))}
          <li className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-4 w-2.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-hover)]" />
            Released together
          </li>
        </ul>
        {statusSource ? <SourceLink href={statusSource.sourceUrl} label={`Status: ${statusSource.sourceTitle ?? "source"}`} /> : null}
      </div>

      <div
        role="region"
        id="model-map"
        aria-label={`${label} map, scrolls horizontally`}
        tabIndex={0}
        className="vo-fade-lanes vo-scroll-end relative overflow-x-auto pb-2"
      >
        <div className="relative min-w-[1040px]" style={{ height: `${height}px` }}>
          {/* Year grid, today line and same-day interchanges sit behind the lanes. */}
          <div aria-hidden="true" className="absolute inset-y-0 left-24 right-6">
            {map.ticks.map((tick) => (
              <div key={tick.year} className="absolute inset-y-0 border-l border-[var(--color-border)]" style={{ left: `${tick.x}%` }}>
                <span className="absolute left-1.5 top-0 text-caption font-semibold tabular-nums text-[var(--color-text-tertiary)]">{tick.year}</span>
              </div>
            ))}
            <div className="absolute bottom-0 top-6 border-l-2 border-dashed border-[var(--color-accent)]" style={{ left: `${map.today}%` }}>
              <span className="absolute -right-1 -top-6 whitespace-nowrap rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--color-text-inverse)]">
                As of {formatPartialDate(today)}
              </span>
            </div>
            {map.interchanges.map((change) => {
              const rows = change.tiers.map((tier) => laneIndex.get(tier) ?? 0);
              const top = Math.min(...rows);
              const bottom = Math.max(...rows);
              return (
                <div
                  key={`${change.x}-${change.tiers.join()}`}
                  className="absolute w-2.5 -translate-x-1/2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-hover)]"
                  style={{ left: `${change.x}%`, top: `${40 + top * LANE_H + LANE_H / 2 - 6}px`, height: `${(bottom - top) * LANE_H + 12}px` }}
                />
              );
            })}
          </div>

          <ol className="absolute inset-x-0 bottom-0 top-10">
            {map.lanes.map((lane, index) => {
              const lineStyle = { left: `${lane.start}%`, width: `${Math.max(lane.end - lane.start, 0.6)}%`, "--lane": laneColor(lane.live) } as CSSProperties;
              return (
                <li key={lane.tier} className="flex" style={{ height: `${LANE_H}px`, "--lane": laneColor(lane.live) } as CSSProperties}>
                  <div className="sticky left-0 z-10 flex w-24 shrink-0 items-center gap-2 bg-[var(--color-bg-card)] pr-2">
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--lane)" }} />
                    <span className={`text-sm font-semibold ${lane.live ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"}`}>{lane.tier}</span>
                  </div>
                  <div className="relative mr-6 flex-1">
                    <span aria-hidden="true" className="vo-lane-line" data-live={String(lane.live)} style={{ ...lineStyle, animationDelay: `${index * 70}ms` }} />
                    <ul>
                      {lane.stations.map((station) => (
                        <li
                          key={station.model.id}
                          id={`model-${station.model.id}`}
                          tabIndex={0}
                          className="vo-station"
                          data-status={station.model.status}
                          style={{ left: `${station.x}%` }}
                          aria-label={`${station.model.name}, released ${formatPartialDate(station.model.releasedAt)}, ${STATUS_LABEL[station.model.status]}`}
                        >
                          <span className="vo-station-label" aria-hidden="true">
                            {station.label}
                          </span>
                          <span className="vo-pop" data-side={side(index)} data-align={station.x < 14 ? "start" : station.x > 86 ? "end" : undefined}>
                            <StationCard model={station.model} />
                            <a href="#model-map" className="vo-pop-close">
                              Close
                            </a>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <p className="text-caption text-[var(--color-text-tertiary)]">
        {models.length} models on {map.lanes.length} lines, {current} current. Select a station for dates, context and price; every detail is also in the tables below.
      </p>
      <details className="group">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
          View as tables
        </summary>
        <div className="mt-4">
          <ModelLineage models={models} statusSource={statusSource} label={label} priceNotes={priceNotes} />
        </div>
      </details>
    </div>
  );
}

// The models you can use today, one card each in its map lane's colour:
// price, context, and how the price moved against the previous model in the
// tier. Selecting a card opens that station on the map below.
export function ModelLineup({ models, today, footnote }: { models: VendorModel[]; today: string; footnote?: { text: string; sourceUrl: string } }) {
  const ladder = priceLadder(models);
  const lanes = modelMap(models, today).lanes;
  const laneOf = new Map(lanes.map((lane, index) => [lane.tier, index]));
  const rows = models
    .filter((model) => model.status === "current")
    .sort((a, b) => (laneOf.get(a.tier) ?? 0) - (laneOf.get(b.tier) ?? 0))
    .map((model) => ({ model, price: ladder.rows.find((row) => row.model.id === model.id) }));
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <ol className="vo-rail vo-fade-x md:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-5">
        {rows.map(({ model, price }) => {
          const lane = laneOf.get(model.tier) ?? 0;
          const delta = price?.previous ? priceDelta(price.output, price.previous.output) : undefined;
          return (
            <li key={model.id} className="vo-entry" style={{ "--lane": laneColor(true), borderTop: "3px solid var(--lane)" } as CSSProperties}>
              <a href={`#model-${model.id}`} className="flex h-full flex-col gap-1.5 outline-none">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-xl font-semibold tracking-tight" style={{ color: "var(--lane)" }}>
                    {model.tier}
                  </span>
                  <span className="text-caption text-[var(--color-text-tertiary)]">{stationLabel(model)}</span>
                </span>
                <span className="vo-entry-desc line-clamp-3 min-h-[3.6rem]">{model.highlight ?? ""}</span>
                {price ? (
                  <span className="mt-auto flex flex-col gap-1 pt-2">
                    <span className="text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
                      {formatUsd(price.input)} <span className="text-[var(--color-text-tertiary)]">/</span> {formatUsd(price.output)}
                    </span>
                    <span className="text-caption text-[var(--color-text-tertiary)]">per M tokens, in / out</span>
                    <span aria-hidden="true" className="relative mt-1 h-1.5 rounded-full bg-[var(--color-bg-hover)]">
                      <span className="vo-bar absolute inset-y-0 left-0" style={{ width: `max(${price.outputPct}%, 4px)`, background: "var(--lane)", "--i": lane } as CSSProperties} />
                    </span>
                  </span>
                ) : (
                  <span className="mt-auto pt-2 text-caption text-[var(--color-text-tertiary)]">No list price published</span>
                )}
                <span className="vo-entry-meta">
                  {model.contextWindow ? <span>{model.contextWindow} context</span> : null}
                  {model.maxOutput ? <span>{model.maxOutput} out</span> : null}
                  {delta !== undefined && price?.previous ? (
                    <span className={delta < 0 ? "font-semibold text-[var(--color-success)]" : delta > 0 ? "font-semibold text-[var(--color-warning)]" : undefined}>
                      {delta === 0 ? "same price as" : `${delta > 0 ? "+" : "−"}${Math.abs(delta)}% vs`} {stationLabel({ name: price.previous.name, tier: model.tier })}
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <p className="text-caption text-[var(--color-text-tertiary)]">
        API list prices in US dollars; bars share one scale.
        {footnote ? (
          <>
            {" "}
            {footnote.text} <SourceLink href={footnote.sourceUrl} />
          </>
        ) : null}
      </p>
    </div>
  );
}
