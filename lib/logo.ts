import type { LogoKind, Platform, Tool } from "@/lib/types";

const imageKinds = new Set<LogoKind>(["official-product", "official-vendor", "service-icon", "project-logo"]);

type LogoDisplayTarget = Pick<Tool, "logoKind" | "logoUrl"> | Pick<Platform, "logoKind" | "logoUrl">;

export function shouldShowImageLogo(target: LogoDisplayTarget) {
  return imageKinds.has(target.logoKind) && Boolean(target.logoUrl);
}
