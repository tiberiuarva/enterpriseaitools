import type { LogoKind } from "@/lib/types";

const imageKinds = new Set<LogoKind>(["official-product", "official-vendor", "service-icon", "project-logo"]);

export function hasAuditedImageLogo(logoKind: LogoKind) {
  return imageKinds.has(logoKind);
}
