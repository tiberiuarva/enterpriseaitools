import type { SourceRef, VendorModel, VendorModelStatus } from "@/lib/types";
import { formatPartialDate, formatUsd, modelLineage } from "@/lib/vendor-overview";
import { stationLabel } from "@/lib/vendor-viz";
import { SourceLink } from "./primitives";

const STATUS_LABEL: Record<VendorModelStatus, string> = {
  current: "Current",
  legacy: "Still available",
  deprecated: "Deprecated",
  retired: "Retired",
};

const STATUS_PILL: Record<VendorModelStatus, string> = {
  current: "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-text-primary)]",
  legacy: "border-[var(--color-border-strong)] text-[var(--color-text-primary)]",
  deprecated: "border-dashed border-[var(--color-warning)] text-[var(--color-text-secondary)]",
  retired: "border-transparent bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)]",
};

const STATUS_DOT: Record<VendorModelStatus, string> = {
  current: "badge-dot-info",
  legacy: "badge-dot-success",
  deprecated: "badge-dot-warning",
  retired: "badge-dot-muted",
};

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Model status legend">
      {(Object.keys(STATUS_LABEL) as VendorModelStatus[]).map((status) => (
        <li key={status} className="inline-flex items-center gap-1.5 text-caption text-[var(--color-text-secondary)]">
          <span aria-hidden="true" className={`inline-block h-3 w-5 rounded border ${STATUS_PILL[status]}`} />
          {STATUS_LABEL[status]}
        </li>
      ))}
    </ul>
  );
}

// Lane chart of every model: one row per tier, one column per generation.
// A real table so the grid survives without CSS and reads row by row.
export function ModelLineage({ models, statusSource, label }: { models: VendorModel[]; statusSource?: SourceRef; label: string }) {
  const lineage = modelLineage(models);
  const available = models
    .filter((model) => model.status !== "retired")
    .sort((a, b) => (a.status === "current" ? 0 : 1) - (b.status === "current" ? 0 : 1) || b.releasedAt.localeCompare(a.releasedAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Legend />
          {statusSource ? (
            <SourceLink href={statusSource.sourceUrl} label={`Status and retirement dates: ${statusSource.sourceTitle ?? "source"}`} />
          ) : null}
        </div>
        <div role="region" aria-label={`${label} lineage, scrolls horizontally`} tabIndex={0} className="relative overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full min-w-[56rem] border-collapse text-sm">
            <caption className="sr-only">{label}s by tier and generation, oldest generation on the left</caption>
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                <th scope="col" className="sticky left-0 z-10 w-24 bg-[var(--color-bg-primary)] px-3 py-2.5 text-left text-caption uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                  Tier
                </th>
                {lineage.generations.map((generation) => (
                  <th key={generation} scope="col" className="px-2 py-2.5 text-left text-caption font-semibold whitespace-nowrap text-[var(--color-text-secondary)]">
                    {generation}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineage.tiers.map((tier) => (
                <tr key={tier} className="border-b border-[var(--color-border)] last:border-b-0">
                  <th scope="row" className="sticky left-0 z-10 bg-[var(--color-bg-card)] px-3 py-2.5 text-left font-semibold text-[var(--color-text-primary)]">
                    {tier}
                  </th>
                  {lineage.generations.map((generation) => {
                    const cell = lineage.cell(tier, generation);
                    return (
                      <td key={generation} className="relative px-2 py-2.5 align-top">
                        {cell.length > 0 ? (
                          <ul className="flex flex-col gap-1">
                            {cell.map((model) => (
                              <li key={model.id}>
                                <span
                                  title={`${model.name}: released ${formatPartialDate(model.releasedAt)}, ${STATUS_LABEL[model.status].toLowerCase()}`}
                                  className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_PILL[model.status]}`}
                                >
                                  {stationLabel(model)}
                                  <span className="sr-only">
                                    {" "}
                                    ({model.name}, released {formatPartialDate(model.releasedAt)}, {STATUS_LABEL[model.status]})
                                  </span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span aria-hidden="true" className="block h-px w-full translate-y-3 bg-[var(--color-border)]" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-h3 text-[var(--color-text-primary)]">Models you can use today</h3>
        <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
          API list prices in US dollars per million tokens, input / output. Batch processing is 50% off; prompt caching reduces repeated input.
        </p>
        <div role="region" aria-label={`Available ${label}s, scrolls horizontally`} tabIndex={0} className="relative mt-3 overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">{label}s that are current, still available or deprecated, with API prices</caption>
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] text-left text-caption uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                <th scope="col" className="px-3 py-2.5">Model</th>
                <th scope="col" className="px-3 py-2.5">Status</th>
                <th scope="col" className="px-3 py-2.5">Released</th>
                <th scope="col" className="px-3 py-2.5">Context</th>
                <th scope="col" className="px-3 py-2.5 text-right">Input</th>
                <th scope="col" className="px-3 py-2.5 text-right">Output</th>
                <th scope="col" className="px-3 py-2.5"><span className="sr-only">Source</span></th>
              </tr>
            </thead>
            <tbody>
              {available.map((model) => (
                <tr key={model.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  <th scope="row" className="px-3 py-2.5 text-left font-medium text-[var(--color-text-primary)]">
                    {model.name}
                    {model.apiId ? <code className="mt-0.5 block text-xs font-normal text-[var(--color-text-tertiary)]">{model.apiId}</code> : null}
                    {/* The note carries conditions on the listed price (e.g. a prompt-size tier), so it sits with the row. */}
                    {model.highlight ? <span className="mt-1 block max-w-xs text-xs font-normal leading-5 text-[var(--color-text-secondary)]">{model.highlight}</span> : null}
                  </th>
                  <td className="px-3 py-2.5">
                    <span className={`badge-dot ${STATUS_DOT[model.status]} whitespace-nowrap`}>
                      {STATUS_LABEL[model.status]}
                      {model.retiresAt ? ` · retires ${formatPartialDate(model.retiresAt)}` : ""}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-[var(--color-text-secondary)]">{formatPartialDate(model.releasedAt)}</td>
                  <td className="px-3 py-2.5 text-[var(--color-text-secondary)]">{model.contextWindow ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-[var(--color-text-primary)]">{model.pricing ? formatUsd(model.pricing.inputPerMTok) : "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-[var(--color-text-primary)]">{model.pricing ? formatUsd(model.pricing.outputPerMTok) : "—"}</td>
                  <td className="px-3 py-2.5 text-right">
                    <SourceLink href={model.sourceUrl} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
