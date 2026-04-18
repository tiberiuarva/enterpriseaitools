import type { Metadata, Viewport } from "next";
import { SkipLinkFocus } from "@/components/skip-link-focus";
import { siteUrl } from "@/lib/metadata";
import "./globals.css";

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
  authors: [{ name: "Artix Cloud" }],
  creator: "Artix Cloud",
  publisher: "Artix Cloud",
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
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full">
        <SkipLinkFocus />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
