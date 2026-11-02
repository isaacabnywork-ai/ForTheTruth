import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileNav } from "@/components/common/MobileNav";
import { DesktopSidebar } from "@/components/common/DesktopSidebar";
import { CartNotification } from "@/components/common/CartNotification";
import { AppSplashScreen } from "@/components/common/AppSplashScreen";
import { ReformationOfferPopup } from "@/components/common/ReformationOfferPopup";
import { Providers } from "./providers";
import { isWooConfigured } from "@/config/env";
import { getCategories } from "@/services/woocommerce";
import { fetchSiteMenusConfigFromCloud } from "@/services/menus";
import type { WCCategory } from "@/types/product";
import { SITE_NAME, SITE_DESCRIPTION } from "@/utils/constants";
import "@/styles/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

/** Cormorant Garamond — timeless editorial serif for headings. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forthetruth.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Curated Sound Christian Books & Literature in India`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Christian books India",
    "Christian bookstore India",
    "sound doctrine books",
    "Reformed theology India",
    "Christian literature India",
    "Bible commentaries India",
    "Christian devotionals",
    "Christian living books",
    "buy Christian books online India",
    "For The Truth",
    "For The Truth Press",
  ],
  authors: [{ name: "For The Truth Press", url: siteUrl }],
  creator: "For The Truth Press",
  publisher: "For The Truth Press Pvt. Ltd.",
  category: "books",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Curated Sound Christian Books & Literature in India`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: `${SITE_NAME} — Curated Sound Christian Literature & Books in India`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Curated Sound Christian Books & Literature in India`,
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF6F0",
};

export const revalidate = 3600;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menusConfig = await fetchSiteMenusConfigFromCloud();
  let categories: WCCategory[] = [];
  if (isWooConfigured()) {
    try {
      categories = await Promise.race([
        getCategories(),
        new Promise<WCCategory[]>((resolve) => setTimeout(() => resolve([]), 5000)),
      ]);
    } catch (err) {
      console.error("Layout: failed to fetch categories", err);
    }
  }

  const orgAndWebsiteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: SITE_NAME,
        alternateName: "For The Truth Press",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          "@id": `${siteUrl}/#logo`,
          url: `${siteUrl}/logo.png`,
          caption: SITE_NAME,
        },
        image: {
          "@id": `${siteUrl}/#logo`,
        },
        description: SITE_DESCRIPTION,
        email: "contact@forthetruth.in",
        telephone: "+918604685533",
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
        },
        sameAs: [
          "https://www.instagram.com/forthetruthindia/",
          "https://www.facebook.com/forthetruthindia",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        inLanguage: "en-IN",
      },
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} ${cormorant.variable} overflow-x-clip`}
    >
      <body className="flex min-h-screen w-full max-w-full overflow-x-clip bg-cream antialiased font-sans" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgAndWebsiteJsonLd) }}
        />
        {/* One-time cleanup: dark mode was removed — clear any saved preference */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{localStorage.removeItem('theme');document.documentElement.classList.remove('dark')}catch(e){}",
          }}
        />
        <Providers>
          {/* Desktop sidebar — sticky top-0 h-screen */}
          <DesktopSidebar categories={categories} />

          {/* Main content column */}
          <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
            {!isWooConfigured() && (
              <div className="bg-amber-700 text-white text-xs font-medium py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-sm z-50">
                <span>⚠️ Note: Online bookstore catalog is temporarily in maintenance mode. AIPC POS is live.</span>
                <a href="/admin/pos/aipc" className="underline font-bold hover:text-amber-200">
                  Open AIPC POS &rarr;
                </a>
              </div>
            )}
            <Header categories={categories} menusConfig={menusConfig} />
            {/* bottom padding so the docked mobile bar never covers content */}
            <main className="flex-1 w-full max-w-full pb-28 lg:pb-0">{children}</main>
            <Footer menusConfig={menusConfig} />
          </div>

          <MobileNav categories={categories} />
          <CartNotification />
          <AppSplashScreen />
          <ReformationOfferPopup />
        </Providers>
      </body>
    </html>
  );
}
