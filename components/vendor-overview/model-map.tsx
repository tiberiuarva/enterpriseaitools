import type { CSSProperties } from "react";
import type { SourceRef, VendorModel, VendorModelStatus } from "@/lib/types";
import { formatPartialDate, formatUsd } from "@/lib/vendor-overview";
import { modelMap, priceLadder } from "@/lib/vendor-viz";
import { ModelLineage } from "./model-lineage";
import { SourceLink } from "./primitives";

const STATUS_LABEL: Record<VendorModelStatus, string> = {
  current: "Current",
  legacy: "Still available",
  deprecated: "Deprecated",
  retired: "Retired",
};

const LANE_H = 56;

function laneColor(index: number, live: boolean) {
  return live ? `var(--viz-cat-${(index % 5) + 1})` : "var(--color-text-tertiary)";
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
        <SourceLink href={model.sourceUrl} label={model.sourceTitle ?? "Source"} />
      </span>
    </>
  );
}

export function ModelMap({ models, today, statusSource }: { models: VendorModel[]; today: string; statusSource?: SourceRef }) {
  const map = modelMap(models, today);
  const laneIndex = new Map(map.lanes.map((lane, index) => [lane.tier, index]));
  const current = models.filter((model) => model.status === "current").length;

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
        </ul>
        {statusSource ? <SourceLink href={statusSource.sourceUrl} label={`Status: ${statusSource.sourceTitle ?? "source"}`} /> : null}
      </div>

      <div role="region" aria-label="Claude model map, scrolls horizontally" tabIndex={0} className="vo-fade-x vo-scroll-end relative -mx-2 overflow-x-auto px-2 pb-2">
        <div className="relative min-w-[1040px]" style={{ height: `${map.lanes.length * LANE_H + 40}px` }}>
          {/* Year grid, today line and same-day interchanges sit behind the lanes. */}
          <div aria-hidden="true" className="absolute inset-y-0 left-24 right-6">
            {map.ticks.map((tick) => (
              <div key={tick.year} className="absolute inset-y-0 border-l border-[var(--color-border)]" style={{ left: `${tick.x}%` }}>
                <span className="absolute left-1.5 top-0 text-caption font-semibold tabular-nums text-[var(--color-text-tertiary)]">{tick.year}</span>
              </div>
            ))}
            <div className="absolute bottom-0 top-6 border-l-2 border-dashed border-[var(--color-accent)]" style={{ left: `${map.today}%` }}>
              <span className="absolute -left-5 -top-6 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--color-text-inverse)]">
                Today
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
              const lineStyle = { left: `${lane.start}%`, width: `${Math.max(lane.end - lane.start, 0.6)}%`, "--lane": laneColor(index, lane.live) } as CSSProperties;
              const side = index < map.lanes.length / 2 ? "below" : "above";
              return (
                <li key={lane.tier} className="flex" style={{ height: `${LANE_H}px`, "--lane": laneColor(index, lane.live) } as CSSProperties}>
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
                          tabIndex={0}
                          className="vo-station"
                          data-status={station.model.status}
                          style={{ left: `${station.x}%` }}
                          aria-label={`${station.model.name}, released ${formatPartialDate(station.model.releasedAt)}, ${STATUS_LABEL[station.model.status]}`}
                        >
                          <span className="vo-station-label" aria-hidden="true">
                            {station.label}
                          </span>
                          <span className="vo-pop" data-side={side} data-align={station.x < 14 ? "start" : station.x > 86 ? "end" : undefined}>
                            <StationCard model={station.model} />
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
        {models.length} models on {map.lanes.length} lines, {current} current. Hover or focus a station for dates, context and price.
      </p>
      <details className="group">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
          View as tables
        </summary>
        <div className="mt-4">
          <ModelLineage models={models} statusSource={statusSource} />
        </div>
      </details>
    </div>
  );
}

export function PriceLadder({ models }: { models: VendorModel[] }) {
  const ladder = priceLadder(models);
  if (ladder.rows.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-h3 text-[var(--color-text-primary)]">What today&apos;s models cost</h3>
        <div className="flex flex-wrap items-center gap-3 text-caption text-[var(--color-text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-4 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_45%,transparent)]" /> Input
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-4 rounded-full bg-[var(--color-accent)]" /> Output
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-3 w-0 border-l-2 border-dashed border-[var(--color-text-tertiary)]" /> Previous model in the tier
          </span>
        </div>
      </div>
      <ol className="flex flex-col gap-4">
        {ladder.rows.map((row, index) => (
          <li key={row.model.id} className="grid grid-cols-1 gap-2 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-6">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{row.model.name}</p>
              {row.previous ? (
                <p className="text-caption text-[var(--color-text-tertiary)]">
                  was {formatUsd(row.previous.input)} / {formatUsd(row.previous.output)} on {row.previous.name.replace(/^Claude\s+/, "")}
                </p>
              ) : row.model.highlight ? (
                <p className="text-caption text-[var(--color-text-tertiary)] line-clamp-2">{row.model.highlight}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  ["in", row.input, row.inputPct, row.previous?.inputPct, "bg-[color-mix(in_srgb,var(--color-accent)_45%,transparent)]"],
                  ["out", row.output, row.outputPct, row.previous?.outputPct, "bg-[var(--color-accent)]"],
                ] as const
              ).map(([kind, value, pct, previous, tone]) => (
                <div key={kind} className="flex items-center gap-3">
                  <div className="relative h-3 flex-1 rounded-full bg-[var(--color-bg-hover)]">
                    <div className={`vo-bar ${tone}`} style={{ width: `max(${pct}%, 4px)`, "--i": index } as CSSProperties} />
                    {previous !== undefined ? (
                      <span aria-hidden="true" className="absolute -top-1 h-5 border-l-2 border-dashed border-[var(--color-text-tertiary)]" style={{ left: `${previous}%` }} />
                    ) : null}
                  </div>
                  <span className="w-28 shrink-0 text-right text-sm tabular-nums text-[var(--color-text-primary)]">
                    <span className="font-semibold">{formatUsd(value)}</span> <span className="text-caption text-[var(--color-text-tertiary)]">{kind === "in" ? "input" : "output"}</span>
                  </span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <p className="text-caption text-[var(--color-text-tertiary)]">
        US dollars per million tokens, API list price.
        {ladder.sharedContext ? ` Every current model has a ${ladder.sharedContext} context window` : ""}
        {ladder.sharedContext && ladder.sharedOutput ? ` and up to ${ladder.sharedOutput} output tokens.` : ladder.sharedContext ? "." : ""} Batch processing is half price.
      </p>
    </div>
  );
}
