import { LogoBadge } from "@/components/logo-badge";
import type { LogoKind } from "@/lib/types";

type PlatformMarkProps = {
  vendor: string;
  logoUrl?: string;
  logoKind: LogoKind;
};

export function PlatformMark({ vendor, logoUrl, logoKind }: PlatformMarkProps) {
  return <LogoBadge label={vendor} logoUrl={logoUrl} logoKind={logoKind} size="lg" />;
}
