import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

type HomeShellProps = {
  lastUpdated: string;
  currentPath?: string;
  children: ReactNode;
};

export function HomeShell({ lastUpdated, currentPath, children }: HomeShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header currentPath={currentPath} />
      <div className="min-h-[calc(100vh-64px)]">{children}</div>
      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}
