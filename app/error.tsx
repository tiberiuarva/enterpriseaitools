"use client";

import { useEffect } from "react";
import { withBasePath } from "@/lib/site";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 md:p-12">
        <p className="text-6xl font-extrabold text-[var(--color-danger)]">Error</p>
        <h1 className="mt-4 text-2xl font-extrabold text-[var(--color-text-primary)]">Something went wrong</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
          An unexpected error occurred. You can try again or return to the homepage.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Try again
          </button>
          <a
            href={withBasePath("/")}
            className="inline-flex rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-inverse)] transition hover:opacity-90"
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
