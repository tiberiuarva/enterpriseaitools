import type { LogoKind, Platform, Tool } from "@/lib/types";

const imageKinds = new Set<LogoKind>(["official-product", "official-vendor", "service-icon", "project-logo"]);

type LogoDisplayTarget = Pick<Tool, "logoKind" | "logoUrl"> | Pick<Platform, "logoKind" | "logoUrl">;

export function hasAuditedImageLogo(logoKind: LogoKind) {
  return imageKinds.has(logoKind);
}

export function shouldShowImageLogo(target: LogoDisplayTarget) {
  return hasAuditedImageLogo(target.logoKind) && Boolean(target.logoUrl);
}
