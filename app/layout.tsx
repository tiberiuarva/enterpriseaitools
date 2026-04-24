import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { JsonLd, buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/components/json-ld";
import { SkipLinkFocus } from "@/components/skip-link-focus";
import { siteUrl } from "@/lib/metadata";
import { githubRepoUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "enterpriseai.tools",
    template: "%s | enterpriseai.tools",
  },
  description:
    "Enterprise AI tooling landscape tracker comparing cloud vendor services with open source and commercial alternatives.",
  applicationName: "enterpriseai.tools",
  keywords: [
    "enterprise ai",
    "ai tools",
    "ai agents",
    "ai governance",
    "ai orchestration",
    "ai assistants",
    "azure ai",
    "aws bedrock",
    "google vertex ai",
  ],
  authors: [{ name: "enterpriseai.tools" }],
  creator: "enterpriseai.tools",
  publisher: "enterpriseai.tools",
  category: "technology",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "enterpriseai.tools",
    locale: "en_US",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "enterpriseai.tools social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/social-preview.png"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const description =
    "Enterprise AI tooling landscape tracker comparing cloud vendor services with open source and commercial alternatives.";
  const jsonLd = [
    buildWebSiteJsonLd({
      name: "enterpriseai.tools",
      url: siteUrl,
      description,
    }),
    buildOrganizationJsonLd({
      name: "enterpriseai.tools",
      url: siteUrl,
      description: "Maintainer of enterpriseai.tools.",
      sameAs: [githubRepoUrl],
    }),
  ];

  return (
    <html lang="en" className={`dark h-full antialiased ${inter.variable}`}>
      <body className="min-h-full">
        <JsonLd data={jsonLd} />
        <SkipLinkFocus />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
