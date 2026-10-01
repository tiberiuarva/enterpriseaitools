import type { Metadata } from "next";
import { LayerPage, buildLayerMetadata } from "@/components/layer-page";

export const metadata: Metadata = buildLayerMetadata("build");

export default function BuildLayerPage() {
  return <LayerPage id="build" />;
}
