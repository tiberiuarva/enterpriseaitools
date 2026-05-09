import type { ReactNode } from "react";
import { EuAiActBanner } from "@/components/eu-ai-act-banner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

type HomeShellProps = {
  lastUpdated: string;
  currentPath?: string;
  children: ReactNode;
};

export function HomeShell({ lastUpdated, currentPath, children }: HomeShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header currentPath={currentPath} />
      <EuAiActBanner initialNowIso={new Date().toISOString()} />
      <div className="flex-1">{children}</div>
      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}
