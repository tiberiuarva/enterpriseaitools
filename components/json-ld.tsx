import type { Tool } from "@/lib/types";

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

type JsonLdProps = {
  data: JsonLdValue;
};

type BreadcrumbItem = {
  name: string;
  url: string;
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

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildCollectionPageJsonLd({
  name,
  url,
  description,
}: {
  name: string;
  url: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
    description,
  };
}

export function buildWebSiteJsonLd({
  name,
  url,
  description,
}: {
  name: string;
  url: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
  };
}

export function buildOrganizationJsonLd({
  name,
  url,
  description,
  sameAs,
}: {
  name: string;
  url: string;
  description: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    description,
    ...(sameAs && sameAs.length > 0 ? { sameAs } : {}),
  };
}
