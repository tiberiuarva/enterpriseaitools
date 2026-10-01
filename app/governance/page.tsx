import type { Metadata } from "next";
import { CategoryHub, buildCategoryHubMetadata } from "@/components/category-hub";

export const metadata: Metadata = buildCategoryHubMetadata("governance");

export default function GovernancePage() {
  return <CategoryHub category="governance" />;
}
