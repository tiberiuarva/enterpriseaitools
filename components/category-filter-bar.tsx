import Link from "next/link";
import { withBasePath } from "@/lib/site";
import type { CategoryFilterState } from "@/lib/category-filters";

type CategoryFilterBarProps = {
  basePath: string;
  state: CategoryFilterState;
  availableLicenses: string[];
};

const typeOptions = [
  { label: "All", value: "all" },
  { label: "Vendor", value: "vendor" },
  { label: "Open Source", value: "opensource" },
  { label: "Commercial", value: "commercial" },
] as const;

const cloudOptions = [
  { label: "All clouds", value: "all" },
  { label: "Azure", value: "azure" },
  { label: "AWS", value: "aws" },
  { label: "GCP", value: "gcp" },
] as const;

const sortOptions = [
  { label: "Name (A-Z)", value: "name" },
  { label: "Stars (high-low)", value: "stars" },
  { label: "Last updated", value: "updated" },
] as const;

function buildHref(basePath: string, next: CategoryFilterState) {
  const params = new URLSearchParams();
  if (next.type !== "all") params.set("type", next.type);
  if (next.cloud !== "all") params.set("cloud", next.cloud);
  if (next.license !== "all") params.set("license", next.license);
  if (next.sort !== "name") params.set("sort", next.sort);
  const query = params.toString();
  return withBasePath(query ? `${basePath}?${query}` : basePath);
}

export function CategoryFilterBar({ basePath, state, availableLicenses }: CategoryFilterBarProps) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <Link
              key={option.value}
              href={buildHref(basePath, { ...state, type: option.value })}
              prefetch={false}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                state.type === option.value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Cloud</div>
            <div className="flex flex-wrap gap-2">
              {cloudOptions.map((option) => (
                <Link
                  key={option.value}
                  href={buildHref(basePath, { ...state, cloud: option.value })}
                  prefetch={false}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    state.cloud === option.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                      : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">License</div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref(basePath, { ...state, license: "all" })}
                prefetch={false}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  state.license === "all"
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                All licenses
              </Link>
              {availableLicenses.map((license) => (
                <Link
                  key={license}
                  href={buildHref(basePath, { ...state, license })}
                  prefetch={false}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    state.license === license
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                      : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  {license}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Sort</div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <Link
                  key={option.value}
                  href={buildHref(basePath, { ...state, sort: option.value })}
                  prefetch={false}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    state.sort === option.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                      : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
