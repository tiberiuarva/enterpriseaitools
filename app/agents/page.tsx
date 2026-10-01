import type { Metadata } from "next";
import { CategoryHub, buildCategoryHubMetadata } from "@/components/category-hub";

export const metadata: Metadata = buildCategoryHubMetadata("agents");

export default function AgentsPage() {
  return <CategoryHub category="agents" />;
}
