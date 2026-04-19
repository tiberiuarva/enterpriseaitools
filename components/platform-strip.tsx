import { LogoBadge } from "@/components/logo-badge";
import { platformPageHref, withBasePath } from "@/lib/site";
import type { Platform } from "@/lib/types";

export function PlatformStrip({ platforms }: { platforms: Platform[] }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {platforms.map((platform) => (
        <a
          key={platform.id}
          href={withBasePath(platformPageHref)}
          className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-surface)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <LogoBadge name={platform.name} logoUrl={platform.logoUrl} logoKind={platform.logoKind} size="lg" decorative />
              <div>
                <div className="text-base font-semibold text-[var(--color-text-primary)]">{platform.name}</div>
                <div className="text-xs text-[var(--color-text-secondary)]">{platform.vendor}</div>
              </div>
            </div>
            <div className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
              {platform.modelCount}
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">{platform.tagline}</p>
        </a>
      ))}
    </section>
  );
}
