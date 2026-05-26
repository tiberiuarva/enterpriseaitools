import type { GovernanceClaim, GovernanceStatus, ToolGovernance } from "@/lib/types";

const STATUS_LABELS: Record<GovernanceStatus, string> = {
  yes: "Yes",
  partial: "Partial",
  no: "No",
  "not-applicable": "N/A",
  unknown: "Unknown",
};

const STATUS_STYLES: Record<GovernanceStatus, string> = {
  yes: "bg-[color:rgba(34,197,94,0.15)] text-[var(--color-success)]",
  partial: "bg-[color:rgba(234,179,8,0.15)] text-[var(--color-warning)]",
  no: "bg-[color:rgba(239,68,68,0.15)] text-[var(--color-danger)]",
  "not-applicable": "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]",
  unknown: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]",
};

function StatusBadge({ status }: { status: GovernanceStatus }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function ClaimRow({ label, claim, suffix }: { label: string; claim: GovernanceClaim; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--color-border)] py-3 last:border-b-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex w-full items-center gap-2 sm:w-56 sm:shrink-0">
        <StatusBadge status={claim.status} />
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
      </div>
      <div className="text-sm text-[var(--color-text-secondary)]">
        <p>
          {claim.detail}
          {suffix ? <span className="text-[var(--color-text-primary)]"> {suffix}</span> : null}
        </p>
        {claim.sourceUrl ? (
          <a
            href={claim.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            {claim.sourceTitle ?? "Source"}
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function GovernancePosture({ governance }: { governance: ToolGovernance }) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Governance posture</h2>
        <span className="text-xs text-[var(--color-text-secondary)]">Reviewed {governance.reviewedAt}</span>
      </div>
      <div className="mt-4">
        <ClaimRow label="Data residency" claim={governance.dataResidency} />
        <ClaimRow
          label="Deployment model"
          claim={governance.deployment}
          suffix={`(${governance.deployment.models.join(", ")})`}
        />
        <ClaimRow label="Audit logging" claim={governance.auditLogging} />
        <ClaimRow label="SOC 2" claim={governance.soc2} />
        <ClaimRow label="ISO 27001" claim={governance.iso27001} />
        <ClaimRow label="ISO 42001" claim={governance.iso42001} />
        <ClaimRow label="EU AI Act" claim={governance.euAiAct} suffix={`(role: ${governance.euAiAct.role})`} />
        <ClaimRow label="License risk" claim={governance.licenseRisk} suffix={`(${governance.licenseRisk.level})`} />
      </div>
    </section>
  );
}
