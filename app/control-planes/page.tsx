import type { Metadata } from "next";
import { CategoryHub, buildCategoryHubMetadata } from "@/components/category-hub";

export const metadata: Metadata = buildCategoryHubMetadata("control-planes");

export default function ControlPlanesPage() {
  return <CategoryHub category="control-planes" />;
}
