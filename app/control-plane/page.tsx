import type { Metadata } from "next";
import { LayerPage, buildLayerMetadata } from "@/components/layer-page";

export const metadata: Metadata = buildLayerMetadata("control");

export default function ControlPlaneLayerPage() {
  return <LayerPage id="control" />;
}
