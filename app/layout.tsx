import type { Metadata } from "next";
import "./globals.css";
import "./editorial.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ConsentBanner from "@/components/ConsentBanner";
import SubscribePopup from "@/components/SubscribePopup";
import MetaPixel from "@/components/MetaPixel";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { WishlistProvider } from "@/lib/wishlist";
import { getEditNavLinks } from "@/lib/content";
import { JsonLd, ORG, SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

// Render on every request so the nav's edits list reflects newly published edits.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "10am · the edit",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_GB", url: "/", description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image" },
  // Explicit, version-stamped icon URLs (the 10am circle logo). The ?v=2 query
  // forces browsers to drop any previously cached favicon (the old triangle),
  // which they otherwise hold onto indefinitely for the fixed /favicon.ico URL.
  icons: {
    icon: [
      { url: "/icon.png?v=2", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-icon.png?v=2",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Latest edits for the "What We Shop" menu column (kept current automatically).
  const latestEdits = await getEditNavLinks(6);
  return (
    <html lang="en">
      <body>
        <JsonLd
          data={[
            ORG,
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              publisher: { "@id": `${SITE_URL}/#org` },
              inLanguage: "en",
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            },
          ]}
        />
        <WishlistProvider>
          <Nav edits={latestEdits} />
          {children}
          <Footer />
          <ConsentBanner />
          <SubscribePopup />
          <MetaPixel />
          <GoogleAnalytics />
        </WishlistProvider>
      </body>
    </html>
  );
}
