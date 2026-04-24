import { LogoBadge } from "@/components/logo-badge";
import { withBasePath } from "@/lib/site";
import type { LogoKind } from "@/lib/types";

type PlatformMarkProps = {
  vendor: string;
  logoUrl?: string;
  logoKind: LogoKind;
};

export function PlatformMark({ vendor, logoUrl, logoKind }: PlatformMarkProps) {
  if (logoUrl) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-1.5">
        <img
          src={withBasePath(logoUrl)}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return <LogoBadge label={vendor} logoUrl={logoUrl} logoKind={logoKind} size="lg" />;
}
