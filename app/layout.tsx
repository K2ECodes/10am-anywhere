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

// Render on every request so the nav's edits list reflects newly published edits.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "10am · the edit",
  description:
    "A monthly curated edit of fashion, interior, beauty, culture and travel. Curated each morning in Berlin.",
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
