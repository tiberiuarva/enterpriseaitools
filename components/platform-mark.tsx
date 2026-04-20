import { Cloud } from "lucide-react";

import { LogoBadge } from "@/components/logo-badge";
import { hasAuditedImageLogo } from "@/lib/logo";
import type { LogoKind } from "@/lib/types";

type PlatformMarkProps = {
  name: string;
  vendor: string;
  logoUrl?: string;
  logoKind: LogoKind;
};

const vendorFallbackStyles: Record<string, string> = {
  microsoft: "border-[color:rgba(0,120,212,0.22)] bg-[linear-gradient(180deg,rgba(0,120,212,0.10),rgba(0,120,212,0.18))] text-[color:#0078D4]",
  amazon: "border-[color:rgba(255,153,0,0.22)] bg-[linear-gradient(180deg,rgba(255,153,0,0.10),rgba(255,153,0,0.18))] text-[color:#FF9900]",
  google: "border-[color:rgba(66,133,244,0.22)] bg-[linear-gradient(180deg,rgba(66,133,244,0.10),rgba(66,133,244,0.18))] text-[color:#4285F4]",
};

function getVendorFallbackStyles(vendor: string) {
  const vendorKey = vendor.toLowerCase();

  if (vendorKey.includes("microsoft")) return vendorFallbackStyles.microsoft;
  if (vendorKey.includes("amazon") || vendorKey.includes("aws")) return vendorFallbackStyles.amazon;
  if (vendorKey.includes("google") || vendorKey.includes("gcp")) return vendorFallbackStyles.google;

  return "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]";
}

export function PlatformMark({ name, vendor, logoUrl, logoKind }: PlatformMarkProps) {
  if (logoUrl && hasAuditedImageLogo(logoKind)) {
    return <LogoBadge name={name} logoUrl={logoUrl} logoKind={logoKind} size="lg" decorative />;
  }

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${getVendorFallbackStyles(vendor)}`}
      aria-hidden="true"
      title={`${name} platform marker`}
    >
      <Cloud size={18} />
    </div>
  );
}
