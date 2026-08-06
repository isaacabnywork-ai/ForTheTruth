import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Merriweather } from "next/font/google";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileNav } from "@/components/common/MobileNav";
import { DesktopSidebar } from "@/components/common/DesktopSidebar";
import { CartNotification } from "@/components/common/CartNotification";
import { InstallAppModal } from "@/components/common/InstallAppModal";
import { Providers } from "./providers";
import { isWooConfigured } from "@/config/env";
import { getCategories } from "@/services/woocommerce";
import type { WCCategory } from "@/types/product";
import { SITE_NAME, SITE_DESCRIPTION } from "@/utils/constants";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});
/** Cormorant Garamond — timeless editorial serif for headings. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
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
  let categories: WCCategory[] = [];
  if (isWooConfigured()) {
    try {
      categories = await getCategories();
    } catch (err) {
      console.error("Layout: failed to fetch categories", err);
    }
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${merriweather.variable} ${cormorant.variable} overflow-x-clip`}
    >
      <body className="flex min-h-screen w-full max-w-full overflow-x-clip bg-cream antialiased" suppressHydrationWarning>
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
            <Header categories={categories} />
            {/* bottom padding so the docked mobile bar never covers content */}
            <main className="flex-1 w-full max-w-full pb-28 lg:pb-0">{children}</main>
            <Footer />
          </div>

          <MobileNav categories={categories} />
          <CartNotification />
          <InstallAppModal />
        </Providers>
      </body>
    </html>
  );
}
