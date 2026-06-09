/*
 * Vendor brand colors are CSS variables defined in `app/globals.css`
 * (`--vendor-azure / --vendor-aws / --vendor-gcp` plus `-soft` and `-border`
 * variants). This module never declares color literals — it returns the
 * matching token name for consumers.
 */

export type VendorColorKey = "azure" | "aws" | "gcp";

const vendorColorKeys = new Set<VendorColorKey>(["azure", "aws", "gcp"]);

export const cloudBadgeStyles: Record<VendorColorKey, string> = {
  azure: "border-[color:var(--vendor-azure)] text-[color:var(--vendor-azure)]",
  aws: "border-[color:var(--vendor-aws)] text-[color:var(--vendor-aws)]",
  gcp: "border-[color:var(--vendor-gcp)] text-[color:var(--vendor-gcp)]",
};

export const platformFallbackStyles: Record<VendorColorKey, string> = {
  azure: "border-[color:var(--vendor-azure-border)] bg-[color:var(--vendor-azure-soft)] text-[color:var(--vendor-azure)]",
  aws: "border-[color:var(--vendor-aws-border)] bg-[color:var(--vendor-aws-soft)] text-[color:var(--vendor-aws)]",
  gcp: "border-[color:var(--vendor-gcp-border)] bg-[color:var(--vendor-gcp-soft)] text-[color:var(--vendor-gcp)]",
};

export function getCloudVendorColorKey(value: string): VendorColorKey | null {
  const normalized = value.trim().toLowerCase();

  return vendorColorKeys.has(normalized as VendorColorKey) ? (normalized as VendorColorKey) : null;
}

export function getVendorColorKey(value: string): VendorColorKey | null {
  const exactMatch = getCloudVendorColorKey(value);

  if (exactMatch) return exactMatch;

  const normalized = value.trim().toLowerCase();

  if (normalized.includes("microsoft")) return "azure";
  if (normalized.includes("amazon") || normalized.includes("aws")) return "aws";
  if (normalized.includes("google") || normalized.includes("gcp")) return "gcp";

  return null;
}

export function getPlatformFallbackStyles(vendor: string) {
  const key = getVendorColorKey(vendor);

  if (!key) return "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]";

  return platformFallbackStyles[key];
}
