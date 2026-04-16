import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";
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
            Changelog-style feed sourced from <code>/data/updates.json</code>.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <div className="space-y-6">
            {updates.map((update) => (
              <article key={update.id} className="flex gap-4 border-l-2 border-[var(--color-border)] pl-4">
                <div className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                  {update.date}
                </div>
                <div>
                  <div className="text-base font-semibold text-[var(--color-text-primary)]">
                    {update.toolName}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
                    {update.category} · {update.type}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{update.summary}</p>
                  <a
                    href={update.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    Source
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </HomeShell>
  );
}
