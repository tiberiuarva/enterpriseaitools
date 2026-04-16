import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/metadata";
import "./globals.css";

const skipLinkScript = `(() => {
  const focusMain = () => {
    const main = document.getElementById('main-content');
    if (main instanceof HTMLElement) {
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: 'start' });
    }
  };

  const focusMainFromHash = () => {
    if (window.location.hash === '#main-content') {
      window.requestAnimationFrame(focusMain);
    }
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a.skip-link');
    if (link) {
      window.setTimeout(focusMain, 0);
    }
  });

  window.addEventListener('hashchange', focusMainFromHash);
  window.addEventListener('load', focusMainFromHash);
})();`;

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
    apple: [{ url: "/icon.svg" }],
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
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: skipLinkScript }} />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
