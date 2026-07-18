import type { Metadata } from "next";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.enterpriseai.tools";
const siteUrl = rawSiteUrl.endsWith("/") ? rawSiteUrl.slice(0, -1) : rawSiteUrl;

export { siteUrl };

const defaultTitle = "enterpriseai.tools";
const defaultDescription =
  "Enterprise AI tooling landscape tracker comparing cloud vendor services with open source and commercial alternatives.";
const defaultSocialImage = "/social-preview.png";

export function buildMetadata({
  title,
  description = defaultDescription,
  path = "/",
  modifiedTime,
  atomFeedPath,
}: {
  title?: string;
  description?: string;
  path?: string;
  /** ISO calendar date (YYYY-MM-DD). When set, emits an article OpenGraph
   *  type with modifiedTime so crawlers and answer engines pick up recency.
   *  The dataset tracks calendar dates only, so the time component is
   *  intentionally zeroed to midnight UTC. */
  modifiedTime?: string;
  /** Root-relative path of an Atom feed (e.g. "/updates-agents.xml"). Emits a
   *  rel=alternate discovery link so feed readers find it from the page. */
  atomFeedPath?: string;
} = {}): Metadata {
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  const canonicalUrl = new URL(normalizedPath, `${siteUrl}/`).toString();
  const pageTitle = title ?? defaultTitle;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
      ...(atomFeedPath ? { types: { "application/atom+xml": `${siteUrl}${atomFeedPath}` } } : {}),
    },
    openGraph: {
      ...(modifiedTime
        ? { type: "article", modifiedTime: `${modifiedTime}T00:00:00.000Z` }
        : { type: "website" }),
      url: canonicalUrl,
      title: pageTitle,
      description,
      siteName: defaultTitle,
      locale: "en_US",
      images: [
        {
          url: defaultSocialImage,
          width: 1200,
          height: 630,
          alt: "enterpriseai.tools social preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [defaultSocialImage],
    },
  };
}
