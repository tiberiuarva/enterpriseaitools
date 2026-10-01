import type { Metadata } from "next";
import { LayerPage, buildLayerMetadata } from "@/components/layer-page";

export const metadata: Metadata = buildLayerMetadata("use");

export default function UseLayerPage() {
  return <LayerPage id="use" />;
}
