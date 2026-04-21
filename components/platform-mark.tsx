import { Cloud } from "lucide-react";

import { LogoBadge } from "@/components/logo-badge";
import { shouldShowImageLogo } from "@/lib/logo";
import type { LogoKind } from "@/lib/types";
import { getPlatformFallbackStyles } from "@/lib/vendor-colors";

type PlatformMarkProps = {
  name: string;
  vendor: string;
  logoUrl?: string;
  logoKind: LogoKind;
};

export function PlatformMark({ name, vendor, logoUrl, logoKind }: PlatformMarkProps) {
  if (shouldShowImageLogo({ logoKind, logoUrl })) {
    return <LogoBadge name={name} logoUrl={logoUrl} logoKind={logoKind} size="lg" decorative />;
  }

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${getPlatformFallbackStyles(vendor)}`} aria-hidden="true">
      <Cloud size={18} />
    </div>
  );
}
