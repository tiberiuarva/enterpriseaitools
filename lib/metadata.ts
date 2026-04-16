import type { Metadata } from "next";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://enterpriseai.tools";
const siteUrl = rawSiteUrl.endsWith("/") ? rawSiteUrl.slice(0, -1) : rawSiteUrl;

export { siteUrl };

const defaultTitle = "enterpriseai.tools";
const defaultDescription =
  "Enterprise AI tooling landscape tracker comparing cloud vendor services with open source and commercial alternatives.";
const defaultSocialImage = "/social-preview.svg";

export function buildMetadata({
  title,
  description = defaultDescription,
  path = "/",
}: {
  title?: string;
  description?: string;
  path?: string;
} = {}): Metadata {
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  const canonicalUrl = new URL(normalizedPath, `${siteUrl}/`).toString();
  const pageTitle = title ?? defaultTitle;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
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
