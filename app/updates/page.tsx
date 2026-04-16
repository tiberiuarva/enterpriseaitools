import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";
import { UpdatesFeed } from "@/components/updates-feed";
import { lastUpdated, updates } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Weekly updates",
  description:
    "Changelog-style updates for enterprise AI tooling, including releases, deprecations, acquisitions, and notable market changes.",
  path: "/updates",
});

export default function UpdatesPage() {
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/updates">
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
          <h1 className="text-[2rem] font-extrabold text-[var(--color-text-primary)]">Weekly updates</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Changelog-style feed of releases, acquisitions, and notable changes in enterprise AI tooling.
          </p>
        </section>

        <div className="mt-6">
          <UpdatesFeed updates={updates} />
        </div>
      </main>
    </HomeShell>
  );
}
