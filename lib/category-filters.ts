import type { Tool, ToolType } from "@/lib/types";

export type CategoryFilterState = {
  type: "all" | ToolType;
  cloud: "all" | "azure" | "aws" | "gcp";
  license: string;
  sort: "name" | "stars";
};

export function parseCategoryFilterState(searchParams?: Record<string, string | string[] | undefined>): CategoryFilterState {
  const type = typeof searchParams?.type === "string" ? searchParams.type : "all";
  const cloud = typeof searchParams?.cloud === "string" ? searchParams.cloud : "all";
  const license = typeof searchParams?.license === "string" ? searchParams.license : "all";
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "name";

  return {
    type: type === "vendor" || type === "opensource" || type === "commercial" ? type : "all",
    cloud: cloud === "azure" || cloud === "aws" || cloud === "gcp" ? cloud : "all",
    license,
    sort: sort === "stars" ? sort : "name",
  };
}

export function filterTools(tools: Tool[], state: CategoryFilterState) {
  return [...tools]
    .filter((tool) => state.type === "all" || tool.type === state.type)
    .filter((tool) => state.cloud === "all" || tool.clouds?.includes(state.cloud))
    .filter((tool) => state.license === "all" || tool.license === state.license)
    .sort((a, b) => {
      if (state.sort === "stars") return (b.githubStars ?? 0) - (a.githubStars ?? 0);
      return a.name.localeCompare(b.name);
    });
}

export function getAvailableLicenses(tools: Tool[]) {
  return Array.from(new Set(tools.map((tool) => tool.license))).sort((a, b) => a.localeCompare(b));
}
