export interface MenuItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  menuType?: "link" | "books" | "categories";
}

export interface SiteMenusConfig {
  announcement: string;
  headerNav: MenuItem[];
  footerShop: MenuItem[];
  footerCompany: MenuItem[];
  footerQuick: MenuItem[];
  contactPhone: string;
  contactEmail: string;
  copyrightText: string;
}

export const DEFAULT_MENUS_CONFIG: SiteMenusConfig = {
  announcement: "Free shipping across India on orders over ₹150 · Sound Christian Books",
  headerNav: [
    { id: "h-home", label: "Home", href: "/", menuType: "link" },
    { id: "h-books", label: "All Books", href: "/products", menuType: "books" },
    { id: "h-categories", label: "All Categories", href: "/categories", menuType: "categories" },
    { id: "h-ebooks", label: "Free E-Books", href: "/free-ebooks", menuType: "link" },
    { id: "h-about", label: "About", href: "/about", menuType: "link" },
  ],
  footerShop: [
    { id: "fs-1", label: "Children's Books", href: "/categories/children" },
    { id: "fs-2", label: "Christian Living", href: "/categories/christian-living" },
    { id: "fs-3", label: "Ministry & Pastoral", href: "/categories/ministry" },
    { id: "fs-4", label: "Theology & Doctrine", href: "/categories/theology" },
    { id: "fs-5", label: "Bible Commentary", href: "/categories/bible-commentary" },
  ],
  footerCompany: [
    { id: "fc-1", label: "About Us", href: "/about" },
    { id: "fc-2", label: "Statement of Faith", href: "/statement-of-faith" },
    { id: "fc-3", label: "Contact Us", href: "/contact" },
    { id: "fc-4", label: "Privacy Policy", href: "/privacy" },
    { id: "fc-5", label: "Terms and Conditions", href: "/terms" },
  ],
  footerQuick: [
    { id: "fq-1", label: "Out of Stock", href: "/products?availability=outofstock" },
    { id: "fq-2", label: "My Account", href: "/account/dashboard" },
    { id: "fq-3", label: "My Cart", href: "/cart" },
    { id: "fq-4", label: "Free E-Books", href: "/free-ebooks" },
    { id: "fq-5", label: "Hindi Books", href: "https://margsatyajeevan.com/shop/", external: true },
    { id: "fq-6", label: "FAQ's", href: "/faq" },
  ],
  contactPhone: "+918604685533",
  contactEmail: "contact@forthetruth.in",
  copyrightText: "For The Truth. All rights reserved.",
};
