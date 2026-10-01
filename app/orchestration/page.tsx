import type { Metadata } from "next";
import { CategoryHub, buildCategoryHubMetadata } from "@/components/category-hub";

export const metadata: Metadata = buildCategoryHubMetadata("orchestration");

export default function OrchestrationPage() {
  return <CategoryHub category="orchestration" />;
}
