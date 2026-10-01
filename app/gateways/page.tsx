import type { Metadata } from "next";
import { CategoryHub, buildCategoryHubMetadata } from "@/components/category-hub";

export const metadata: Metadata = buildCategoryHubMetadata("gateways");

export default function GatewaysPage() {
  return <CategoryHub category="gateways" />;
}
