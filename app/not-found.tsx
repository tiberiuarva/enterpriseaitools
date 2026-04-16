import { HomeShell } from "@/components/home-shell";
import { lastUpdated } from "@/lib/data";
import { withBasePath } from "@/lib/site";

export default function NotFound() {
  return (
    <HomeShell lastUpdated={lastUpdated}>
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 md:p-12">
          <p className="text-6xl font-extrabold text-[var(--color-primary)]">404</p>
          <h1 className="mt-4 text-2xl font-extrabold text-[var(--color-text-primary)]">Page not found</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
            The page you are looking for does not exist or has been moved.
          </p>
          <a
            href={withBasePath("/")}
            className="mt-6 inline-flex rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-inverse)] transition hover:opacity-90"
          >
            Back to home
          </a>
        </div>
      </main>
    </HomeShell>
  );
}
