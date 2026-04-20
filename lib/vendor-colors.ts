export type VendorColorKey = "azure" | "aws" | "gcp";

export const cloudBadgeStyles: Record<VendorColorKey, string> = {
  azure: "border-[color:#0078D4] text-[color:#0078D4]",
  aws: "border-[color:#FF9900] text-[color:#FF9900]",
  gcp: "border-[color:#4285F4] text-[color:#4285F4]",
};

export const platformFallbackStyles: Record<VendorColorKey, string> = {
  azure: "border-[color:rgba(0,120,212,0.22)] bg-[linear-gradient(180deg,rgba(0,120,212,0.10),rgba(0,120,212,0.18))] text-[color:#0078D4]",
  aws: "border-[color:rgba(255,153,0,0.22)] bg-[linear-gradient(180deg,rgba(255,153,0,0.10),rgba(255,153,0,0.18))] text-[color:#FF9900]",
  gcp: "border-[color:rgba(66,133,244,0.22)] bg-[linear-gradient(180deg,rgba(66,133,244,0.10),rgba(66,133,244,0.18))] text-[color:#4285F4]",
};

export function getVendorColorKey(value: string): VendorColorKey | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === "azure" || normalized.includes("microsoft")) return "azure";
  if (normalized.includes("amazon") || normalized.includes("aws")) return "aws";
  if (normalized.includes("google") || normalized.includes("gcp")) return "gcp";

  return null;
}

export function getPlatformFallbackStyles(vendor: string) {
  const key = getVendorColorKey(vendor);

  if (!key) return "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]";

  return platformFallbackStyles[key];
}
