import { Check, ExternalLink, Globe, Star } from "lucide-react";
import { LogoBadge } from "@/components/logo-badge";
import { shouldShowImageLogo } from "@/lib/logo";
import { withBasePath } from "@/lib/site";
import { formatToolTypeLabel, toolTypeBadgeStyles, toolTypeIcons, toolTypeIconWrapStyles } from "@/lib/tool-type";
import type { Tool } from "@/lib/types";
import { cloudBadgeStyles, getVendorColorKey } from "@/lib/vendor-colors";

function formatCloudName(cloud: string) {
  if (cloud === "gcp") return "GCP";
  if (cloud === "aws") return "AWS";
  if (cloud === "azure") return "Azure";

  return cloud;
}

export function ToolCard({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const docsHref = tool.docsUrl ?? tool.websiteUrl;
  const visibleStrengths = tool.strengths.slice(0, compact ? 2 : 3);
  const TypeIcon = toolTypeIcons[tool.type];
  const showImageLogo = shouldShowImageLogo(tool);

  return (
    <article
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-shadow hover:shadow-lg hover:[border-color:var(--color-primary)] ${compact ? "p-4 [content-visibility:auto] [contain-intrinsic-size:260px]" : "p-6 [content-visibility:auto] [contain-intrinsic-size:360px]"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {showImageLogo ? (
            <LogoBadge name={tool.name} logoUrl={tool.logoUrl} logoKind={tool.logoKind} size={compact ? "sm" : "md"} className="shrink-0" decorative />
          ) : (
            <div
              className={`flex shrink-0 items-center justify-center rounded-xl ${compact ? "h-10 w-10" : "h-12 w-12"} ${toolTypeIconWrapStyles[tool.type]}`}
              aria-hidden="true"
            >
              <TypeIcon size={compact ? 18 : 20} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className={`${compact ? "text-base" : "text-lg"} truncate font-semibold text-[var(--color-text-primary)]`}>{tool.name}</h3>
            {tool.vendor ? <p className="text-xs text-[var(--color-text-secondary)]">{tool.vendor}</p> : null}
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toolTypeBadgeStyles[tool.type]}`}>
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

      {tool.clouds && tool.clouds.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tool.clouds.map((cloud) => {
            const vendorColorKey = getVendorColorKey(cloud);

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
        <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1">{tool.license}</span>
        {tool.lastRelease ? <span>Released {tool.lastRelease}</span> : null}
      </div>

      {tool.status !== "active" ? (
        <div className="mt-3 rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-2.5 py-1.5 text-xs font-medium text-[var(--color-warning)]">
          {tool.status === "archived" ? "Archived" : tool.status === "maintenance" ? "Maintenance mode" : "Deprecated"}
          {tool.statusNote ? ` — ${tool.statusNote}` : ""}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        {tool.version ? (
          <code className="rounded-md bg-[var(--color-bg-surface)] px-2 py-1 text-[13px] text-[var(--color-text-primary)]">{tool.version}</code>
        ) : (
          <span className="text-xs text-[var(--color-text-secondary)]">No version listed</span>
        )}

        {docsHref ? (
          <a
            href={docsHref.startsWith("/") ? withBasePath(docsHref) : docsHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            {tool.websiteUrl && !tool.docsUrl ? <Globe size={14} /> : <ExternalLink size={14} />}
            Docs
          </a>
        ) : null}
      </div>
    </article>
  );
}
