import type { Metadata } from "next";
import { CategoryHub, buildCategoryHubMetadata } from "@/components/category-hub";

export const metadata: Metadata = buildCategoryHubMetadata("agent-identity");

export default function AgentIdentityPage() {
  return <CategoryHub category="agent-identity" />;
}
