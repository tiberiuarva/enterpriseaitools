import { siteUrl as defaultSiteUrl } from "@/lib/metadata";
import type { Tool } from "@/lib/types";

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

type JsonLdProps = {
  data: JsonLdValue;
};

type BreadcrumbItem = {
  name: string;
  url: string;
};

type DataCatalogDataset = {
  name: string;
  url: string;
  description: string;
};

type DataFeedItem = {
  id: string;
  url: string;
  title: string;
  summary: string;
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage?: string;
};

const defaultLanguage = "en-US";
const isoCalendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeJsonLdDate(value: string) {
  if (isoCalendarDatePattern.test(value)) {
    const parsed = new Date(`${value}T00:00:00Z`);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } else {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  throw new Error(`Invalid JSON-LD date: ${value}`);
}

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

export function buildSoftwareApplicationJsonLd(tool: Tool, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url,
    ...(tool.vendor ? { publisher: { "@type": "Organization", name: tool.vendor } } : {}),
    ...(tool.version ? { softwareVersion: tool.version } : {}),
    ...(tool.license ? { license: tool.license } : {}),
    ...(tool.docsUrl || tool.githubUrl
      ? { sameAs: [tool.docsUrl, tool.githubUrl].filter((value): value is string => typeof value === "string") }
      : {}),
    ...(tool.pricingModel === "free"
      ? { offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }
      : {}),
  };
}

export function buildToolArticleJsonLd({
  tool,
  url,
  authorName,
  reviewedAt,
}: {
  tool: Tool;
  url: string;
  authorName: string;
  reviewedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${tool.name} — governance posture & overview`,
    description: tool.description,
    url,
    inLanguage: defaultLanguage,
    datePublished: normalizeJsonLdDate(reviewedAt),
    dateModified: normalizeJsonLdDate(reviewedAt),
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: "enterpriseai.tools",
      url: defaultSiteUrl,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    about: tool.name,
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
    inLanguage: defaultLanguage,
  };
}

export function buildAboutPageJsonLd({
  name,
  url,
  description,
  siteUrl = defaultSiteUrl,
  about,
}: {
  name: string;
  url: string;
  description: string;
  siteUrl?: string;
  about?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name,
    url,
    description,
    inLanguage: defaultLanguage,
    isPartOf: {
      "@type": "WebSite",
      name: "enterpriseai.tools",
      url: siteUrl,
    },
    ...(about && about.length > 0
      ? {
          about: about.map((topic) => ({
            "@type": "Thing",
            name: topic,
          })),
        }
      : {}),
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
    inLanguage: defaultLanguage,
  };
}

export function buildWebPageJsonLd({
  name,
  url,
  description,
  siteUrl = defaultSiteUrl,
}: {
  name: string;
  url: string;
  description: string;
  siteUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url,
    description,
    isPartOf: {
      "@type": "WebSite",
      name: "enterpriseai.tools",
      url: siteUrl,
    },
    inLanguage: defaultLanguage,
  };
}

export function buildDataCatalogJsonLd({
  name,
  url,
  description,
  siteUrl = defaultSiteUrl,
  datasets = [],
}: {
  name: string;
  url: string;
  description: string;
  siteUrl?: string;
  datasets?: DataCatalogDataset[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    name,
    url,
    description,
    inLanguage: defaultLanguage,
    provider: {
      "@type": "Organization",
      name: "enterpriseai.tools",
      url: siteUrl,
    },
    ...(datasets.length
      ? {
          dataset: datasets.map((dataset) => ({
            "@type": "Dataset",
            name: dataset.name,
            url: dataset.url,
            description: dataset.description,
            inLanguage: defaultLanguage,
          })),
        }
      : {}),
  };
}

export function buildDataFeedJsonLd({
  name,
  url,
  description,
  items,
  siteUrl = defaultSiteUrl,
  dateModified,
  sameAs,
}: {
  name: string;
  url: string;
  description: string;
  items: DataFeedItem[];
  siteUrl?: string;
  dateModified?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DataFeed",
    name,
    url,
    description,
    inLanguage: defaultLanguage,
    ...(dateModified ? { dateModified } : {}),
    ...(sameAs && sameAs.length > 0 ? { sameAs } : {}),
    provider: {
      "@type": "Organization",
      name: "enterpriseai.tools",
      url: siteUrl,
    },
    dataFeedElement: items.map((item) => ({
      "@type": "DataFeedItem",
      dateCreated: item.datePublished,
      ...(item.dateModified ? { dateModified: item.dateModified } : {}),
      item: {
        "@type": "Article",
        "@id": item.id,
        headline: item.title,
        url: item.url,
        description: item.summary,
        datePublished: item.datePublished,
        ...(item.dateModified ? { dateModified: item.dateModified } : {}),
        ...(item.mainEntityOfPage
          ? {
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": item.mainEntityOfPage,
              },
            }
          : {}),
        inLanguage: defaultLanguage,
      },
    })),
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
