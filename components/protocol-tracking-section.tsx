import { Braces, PlugZap, Waypoints } from "lucide-react";
import { getProtocolSnapshots } from "@/lib/protocol-tracking";
import { withBasePath } from "@/lib/site";

const iconMap = {
  mcp: PlugZap,
  a2a: Waypoints,
  openapi: Braces,
} as const;

type ProtocolTrackingSectionProps = {
  compact?: boolean;
  currentPath?: "/" | "/platforms";
};

export function ProtocolTrackingSection({ compact = false, currentPath = "/" }: ProtocolTrackingSectionProps) {
  const snapshots = getProtocolSnapshots();
  const isPlatformsPage = currentPath === "/platforms";

  return (
    <section className="card-flat p-6">
      <div className="max-w-4xl">
        <h2 className="text-h2 text-[var(--color-text-primary)]">Protocol tracking: MCP, A2A, and OpenAPI</h2>
        <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">
          Where the major cloud foundations expose protocol alignment for MCP, A2A, and OpenAPI.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {snapshots.map((snapshot) => {
          const Icon = iconMap[snapshot.key];

          return (
            <article key={snapshot.key} className="card p-5">
              <div className="flex items-start gap-3">
                <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--color-text-secondary)]" />
                <div>
                  <h3 className="text-h3 text-[var(--color-text-primary)]">{snapshot.label}</h3>
                  <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">{snapshot.description}</p>
                </div>
              </div>

              <div className="mt-4 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-text-primary)]">Platform support:</span>
                <span className="ml-1">{snapshot.supportCount} of 3 tracked clouds</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {snapshot.platformNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]"
                  >
                    {name}
                  </span>
                ))}
              </div>

              {!compact && snapshot.recentUpdates.length > 0 ? (
                <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                  <div className="text-caption uppercase tracking-wide text-[var(--color-text-tertiary)]">Recent dataset mentions</div>
                  <div className="mt-3 space-y-3">
                    {snapshot.recentUpdates.map((update) => (
                      <div key={update.id}>
                        <div className="text-xs text-[var(--color-text-secondary)]">{update.date}</div>
                        <div className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{update.title ?? update.toolName}</div>
                        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{update.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={withBasePath(isPlatformsPage ? "/updates" : "/platforms")}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-accent-strong)]"
        >
          {isPlatformsPage ? "Browse weekly updates" : "Compare platform support"}
        </a>
        <a href={withBasePath("/updates")} className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline">
          Open updates feed
        </a>
      </div>
    </section>
  );
}
