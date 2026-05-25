import type { ToolCategory } from "./types.ts";

export function filterToolsByCategory<T extends { category: ToolCategory }>(
  items: readonly T[],
  category: ToolCategory,
): T[] {
  return items.filter((item) => item.category === category);
}

export function latestIsoDate(candidates: ReadonlyArray<string | null | undefined>): string | null {
  const valid = candidates.filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  if (valid.length === 0) {
    return null;
  }

  return [...valid].sort().at(-1) ?? null;
}
