import { ExternalLink } from "lucide-react";
import { euAiActObligations, getObligationsForRiskTier } from "@/lib/eu-ai-act-obligations";
import { withBasePath } from "@/lib/site";
import type { EuAiActRole } from "@/lib/types";

const ROLE_LABELS: Record<EuAiActRole, string> = {
  prohibited: "Prohibited",
  "high-risk": "High risk",
  "limited-risk": "Limited risk",
  "minimal-risk": "Minimal risk",
  "not-applicable": "Not applicable",
  unknown: "Unknown",
};

const EMPTY_STATE: Record<"not-applicable" | "unknown", string> = {
  "not-applicable":
    "This record's EU AI Act risk tier is marked not applicable, so no tier-specific obligations attach. Deployers embedding it in an AI system in scope of the Act should assess that system's own tier.",
  unknown:
    "This record's EU AI Act risk tier has not been established yet, so no obligations are mapped. Check the source on the governance posture above, or the full obligation reference.",
};

export function EuAiActObligations({ role, toolName }: { role: EuAiActRole; toolName: string }) {
  const obligations = getObligationsForRiskTier(role);
  const emptyCopy = role === "not-applicable" || role === "unknown" ? EMPTY_STATE[role] : null;

  return (
    <section className="card-flat p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">EU AI Act obligations</h2>
        <span className="text-xs text-[var(--color-text-secondary)]">
          Risk tier: {ROLE_LABELS[role]} · as of {euAiActObligations.asOf}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
        Source-backed information mapped from {toolName}&apos;s tracked risk tier — not legal advice. Obligations
        depend on how your organisation deploys the system; see the{" "}
        <a href={withBasePath("/eu-ai-act")} className="text-[var(--color-primary)] hover:underline">
          full obligation reference and timeline
        </a>
        .
      </p>

      {emptyCopy ? (
        <p className="mt-4 text-sm text-[var(--color-text-secondary)]">{emptyCopy}</p>
      ) : (
        <div className="mt-4">
          {obligations.map((obligation) => (
            <div
              key={obligation.id}
              className="flex flex-col gap-1 border-b border-[var(--color-border)] py-3 last:border-b-0 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="flex w-full items-center gap-2 sm:w-56 sm:shrink-0">
                <span className="inline-flex shrink-0 rounded-full bg-[var(--color-bg-hover)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                  {obligation.articles}
                </span>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{obligation.title}</span>
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                <p>
                  {obligation.summary}
                  {obligation.kind === "voluntary" ? (
                    <span className="text-[var(--color-text-primary)]"> (voluntary)</span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs">
                  Applies from <time dateTime={obligation.appliesFrom}>{obligation.appliesFrom}</time>
                  {obligation.deferral
                    ? ` — proposed deferral to ${obligation.deferral.proposedDate} (${obligation.deferral.status})`
                    : null}
                </p>
                <a
                  href={obligation.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
                >
                  <ExternalLink size={12} aria-hidden="true" />
                  Official text
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
