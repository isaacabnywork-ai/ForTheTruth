import type { MetadataRoute } from "next";
import { isWooConfigured } from "@/config/env";
import { wcFetch } from "@/services/woocommerce";
import { AUTHORS } from "@/data/authors";

export const revalidate = 86400; // Cache sitemap for 24 hours

interface SitemapCategory {
  id: number;
  slug: string;
}

interface SitemapProduct {
  id: number;
  slug: string;
  date_modified?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forthetruth.in";

  const staticRoutes = [
    "",
    "/products",
    "/categories",
    "/free-ebooks",
    "/authors",
    "/church-resources",
    "/about",
    "/statement-of-faith",
    "/contact",
    "/faq",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/products" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/products" ? 0.9 : 0.8,
  }));

  if (isWooConfigured()) {
    try {
      // 1. Fetch categories
      const categories = await wcFetch<SitemapCategory[]>("/products/categories", {
        searchParams: { per_page: 100, _fields: "id,slug" },
        revalidate: 86400,
      }).catch(() => []);

      for (const cat of categories) {
        if (cat.slug) {
          entries.push({
            url: `${baseUrl}/categories/${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }

      // 2. Fetch all published products via lightweight pagination
      const page1Res = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://admin.forthetruth.in"}/wp-json/wc/v3/products?status=publish&per_page=100&_fields=id,slug,date_modified&page=1`,
        {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(
                `${process.env.WOOCOMMERCE_API_KEY}:${process.env.WOOCOMMERCE_API_SECRET}`
              ).toString("base64"),
          },
          next: { revalidate: 86400 },
        }
      );

      if (page1Res.ok) {
        const page1 = (await page1Res.json()) as SitemapProduct[];
        const totalPages = parseInt(page1Res.headers.get("x-wp-totalpages") || "1", 10);
        let allProducts = [...page1];

        if (totalPages > 1) {
          const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
          const batches = await Promise.all(
            remainingPages.map((page) =>
              fetch(
                `${process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://admin.forthetruth.in"}/wp-json/wc/v3/products?status=publish&per_page=100&_fields=id,slug,date_modified&page=${page}`,
                {
                  headers: {
                    Authorization:
                      "Basic " +
                      Buffer.from(
                        `${process.env.WOOCOMMERCE_API_KEY}:${process.env.WOOCOMMERCE_API_SECRET}`
                      ).toString("base64"),
                  },
                  next: { revalidate: 86400 },
                }
              ).then((r) => (r.ok ? (r.json() as Promise<SitemapProduct[]>) : []))
            )
          );
          allProducts = [...allProducts, ...batches.flat()];
        }

        for (const prod of allProducts) {
          if (prod.slug) {
            entries.push({
              url: `${baseUrl}/products/${prod.slug}`,
              lastModified: prod.date_modified ? new Date(prod.date_modified) : new Date(),
              changeFrequency: "weekly",
              priority: 0.8,
            });
          }
        }
      }
    } catch (err) {
      console.warn("Failed to generate dynamic sitemap items:", err);
    }
  }

  // 3. Authors
  for (const author of AUTHORS) {
    entries.push({
      url: `${baseUrl}/authors/${author.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
