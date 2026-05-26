import { Check, ExternalLink, Globe, Star } from "lucide-react";
import { ToolIdentityBadge } from "@/components/tool-identity-badge";
import { withBasePath } from "@/lib/site";
import { formatToolTypeLabel, toolTypeTintStyles } from "@/lib/tool-type";
import type { DeploymentModel, LicenseRiskLevel, PricingModel, Tool } from "@/lib/types";
import { cloudBadgeStyles, getCloudVendorColorKey } from "@/lib/vendor-colors";

const CHIP_CLASS = "rounded-full border border-[var(--color-border)] px-2.5 py-1";
const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  contact: "Contact sales",
};

const DEPLOYMENT_LABELS: Record<DeploymentModel, string> = {
  saas: "SaaS",
  "self-hosted": "Self-hosted",
  "on-prem": "On-prem",
  sovereign: "Sovereign",
  hybrid: "Hybrid",
};

const LICENSE_RISK_BADGE: Record<LicenseRiskLevel, string> = {
  low: "bg-[color:rgba(34,197,94,0.15)] text-[var(--color-success)]",
  medium: "bg-[color:rgba(234,179,8,0.15)] text-[var(--color-warning)]",
  high: "bg-[color:rgba(239,68,68,0.15)] text-[var(--color-danger)]",
  unknown: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]",
};

function formatCloudName(cloud: string) {
  const normalized = cloud.trim().toLowerCase();

  if (normalized === "gcp") return "GCP";
  if (normalized === "aws") return "AWS";
  if (normalized === "azure") return "Azure";

  return cloud;
}

function formatPricingModelLabel(pricingModel: PricingModel) {
  return PRICING_MODEL_LABELS[pricingModel];
}

function normalizeHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//") ? withBasePath(href) : href;
}

function normalizeComparableHref(href: string) {
  return href.replace(/\/+$/, "");
}

export function ToolCard({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const docsHref = normalizeHref(tool.docsUrl);
  const websiteHref = tool.websiteUrl ? normalizeHref(tool.websiteUrl) : undefined;
  const hasSeparateWebsite = websiteHref ? normalizeComparableHref(websiteHref) !== normalizeComparableHref(docsHref) : false;
  const visibleStrengths = tool.strengths.slice(0, compact ? 2 : 3);
  return (
    <article
      id={`tool-${tool.id}`}
      className={`scroll-mt-[calc(var(--site-header-height)_+_1rem)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-shadow hover:shadow-lg hover:[border-color:var(--color-primary)] ${compact ? "p-4 [content-visibility:auto] [contain-intrinsic-size:260px]" : "p-6 [content-visibility:auto] [contain-intrinsic-size:360px]"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <ToolIdentityBadge
            label={tool.name}
            logoUrl={tool.logoUrl}
            logoKind={tool.logoKind}
            size={compact ? "sm" : "md"}
            className="shrink-0"
          />
          <div className="min-w-0">
            <h3 className={`${compact ? "text-base" : "text-lg"} truncate font-semibold text-[var(--color-text-primary)]`}>
              <a href={withBasePath(`/tools/${tool.id}`)} className="hover:text-[var(--color-primary)] hover:underline">
                {tool.name}
              </a>
            </h3>
            {tool.vendor ? <p className="text-xs text-[var(--color-text-secondary)]">{tool.vendor}</p> : null}
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toolTypeTintStyles[tool.type]}`}>
          {formatToolTypeLabel(tool.type)}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{tool.description}</p>

      {visibleStrengths.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {visibleStrengths.map((strength) => (
            <li key={strength} className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
              <Check className="mt-0.5 shrink-0 text-[var(--color-success)]" size={14} />
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {tool.practitionerNote ? (
        <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Practitioner note</p>
          <p className="mt-1 text-sm text-[var(--color-text-primary)]">{tool.practitionerNote}</p>
        </div>
      ) : null}

      {tool.clouds && tool.clouds.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tool.clouds.map((cloud) => {
            const vendorColorKey = getCloudVendorColorKey(cloud);

            return (
              <span
                key={cloud}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${vendorColorKey ? cloudBadgeStyles[vendorColorKey] : "border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}
              >
                {formatCloudName(cloud)}
              </span>
            );
          })}
        </div>
      ) : null}

      <div className={`mt-4 flex flex-wrap items-center text-xs text-[var(--color-text-secondary)] ${compact ? "gap-2" : "gap-3"}`}>
        {typeof tool.githubStars === "number" ? (
          <span className="inline-flex items-center gap-1.5">
            <Star size={13} />
            {tool.githubStars.toLocaleString()}
          </span>
        ) : null}
        <span className={CHIP_CLASS}>{tool.license}</span>
        {tool.pricingModel ? <span className={CHIP_CLASS}>{formatPricingModelLabel(tool.pricingModel)}</span> : null}
        {tool.version ? <span className={CHIP_CLASS}>Version {tool.version}</span> : null}
        {tool.lastRelease ? <span className={CHIP_CLASS}>Released {tool.lastRelease}</span> : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
        {tool.governance.deployment.models.map((model) => (
          <span key={model} className="rounded-full bg-[var(--color-bg-surface)] px-2 py-0.5 text-[var(--color-text-secondary)]">
            {DEPLOYMENT_LABELS[model]}
          </span>
        ))}
        {tool.governance.soc2.status === "yes" ? (
          <span className="rounded-full bg-[color:rgba(34,197,94,0.15)] px-2 py-0.5 font-semibold text-[var(--color-success)]">SOC 2</span>
        ) : null}
        <span className={`rounded-full px-2 py-0.5 font-semibold ${LICENSE_RISK_BADGE[tool.governance.licenseRisk.level]}`}>
          License {tool.governance.licenseRisk.level}
        </span>
      </div>

      {tool.status !== "active" ? (
        <div className="mt-3 rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-2.5 py-1.5 text-xs font-medium text-[var(--color-warning)]">
          {tool.status === "archived" ? "Archived" : tool.status === "maintenance" ? "Maintenance mode" : "Deprecated"}
          {tool.statusNote ? ` — ${tool.statusNote}` : ""}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <a
          href={withBasePath(`/tools/${tool.id}`)}
          className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Governance &amp; details
        </a>
        {hasSeparateWebsite ? (
          <a
            href={websiteHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:underline"
          >
            <Globe size={14} />
            Website
          </a>
        ) : null}

        <a
          href={docsHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          <ExternalLink size={14} />
          Docs
        </a>
      </div>
    </article>
  );
}
