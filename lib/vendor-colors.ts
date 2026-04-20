export type VendorColorKey = "azure" | "aws" | "gcp";

const vendorTextColors: Record<VendorColorKey, string> = {
  azure: "#0078D4",
  aws: "#FF9900",
  gcp: "#4285F4",
};

export const cloudBadgeStyles: Record<VendorColorKey, string> = {
  azure: `border-[color:${vendorTextColors.azure}] text-[color:${vendorTextColors.azure}]`,
  aws: `border-[color:${vendorTextColors.aws}] text-[color:${vendorTextColors.aws}]`,
  gcp: `border-[color:${vendorTextColors.gcp}] text-[color:${vendorTextColors.gcp}]`,
};

export const platformFallbackStyles: Record<VendorColorKey, string> = {
  azure: `border-[color:rgba(0,120,212,0.22)] bg-[linear-gradient(180deg,rgba(0,120,212,0.10),rgba(0,120,212,0.18))] text-[color:${vendorTextColors.azure}]`,
  aws: `border-[color:rgba(255,153,0,0.22)] bg-[linear-gradient(180deg,rgba(255,153,0,0.10),rgba(255,153,0,0.18))] text-[color:${vendorTextColors.aws}]`,
  gcp: `border-[color:rgba(66,133,244,0.22)] bg-[linear-gradient(180deg,rgba(66,133,244,0.10),rgba(66,133,244,0.18))] text-[color:${vendorTextColors.gcp}]`,
};

export function getVendorColorKey(value: string): VendorColorKey | null {
  const normalized = value.trim().toLowerCase();

  if (["azure", "microsoft"].includes(normalized) || normalized.includes("microsoft")) return "azure";
  if (["aws", "amazon"].includes(normalized) || normalized.includes("amazon") || normalized.includes("aws")) return "aws";
  if (["gcp", "google", "google cloud"].includes(normalized) || normalized.includes("google") || normalized.includes("gcp")) return "gcp";

  return null;
}

export function getPlatformFallbackStyles(vendor: string) {
  const key = getVendorColorKey(vendor);

  if (!key) return "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]";

  return platformFallbackStyles[key];
}
