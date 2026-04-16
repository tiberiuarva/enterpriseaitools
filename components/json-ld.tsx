import type { Tool } from "@/lib/types";

type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function buildToolListJsonLd(tools: Tool[], name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.description,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        ...(tool.version ? { softwareVersion: tool.version } : {}),
        ...(tool.docsUrl ? { url: tool.docsUrl } : {}),
        ...(tool.license ? { license: tool.license } : {}),
        ...(tool.pricingModel === "free"
          ? { offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }
          : {}),
      },
    })),
  };
}
