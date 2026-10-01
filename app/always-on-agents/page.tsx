import type { Metadata } from "next";
import { CategoryHub, buildCategoryHubMetadata } from "@/components/category-hub";

export const metadata: Metadata = buildCategoryHubMetadata("always-on-agents");

export default function AlwaysOnAgentsPage() {
  return <CategoryHub category="always-on-agents" />;
}
