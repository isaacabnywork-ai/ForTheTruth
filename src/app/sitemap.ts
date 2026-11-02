import type { MetadataRoute } from "next";
import { isWooConfigured } from "@/config/env";
import { AUTHORS } from "@/data/authors";
import { TOPICS } from "@/utils/constants";
import categoryRowsFallbackData from "@/data/category_rows_fallback.json";

export const dynamic = "force-dynamic";
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
    "/shop",
    "/categories",
    "/free-ebooks",
    "/authors",
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
    changeFrequency: route === "" || route === "/shop" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/shop" ? 0.9 : 0.8,
  }));

  // Authors
  for (const author of AUTHORS) {
    entries.push({
      url: `${baseUrl}/authors/${author.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  let categoriesAdded = 0;
  let productsAdded = 0;

  if (isWooConfigured()) {
    try {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://admin.forthetruth.in";
      const authHeader =
        "Basic " +
        Buffer.from(
          `${process.env.WOOCOMMERCE_API_KEY}:${process.env.WOOCOMMERCE_API_SECRET}`
        ).toString("base64");

      // 1. Fetch categories with 5s timeout
      const catRes = await fetch(
        `${wpUrl}/wp-json/wc/v3/products/categories?per_page=100&_fields=id,slug`,
        {
          headers: { Authorization: authHeader },
          signal: AbortSignal.timeout(6000),
          next: { revalidate: 86400 },
        }
      ).catch(() => null);

      if (catRes?.ok) {
        const categories = (await catRes.json()) as SitemapCategory[];
        for (const cat of categories) {
          if (cat.slug) {
            entries.push({
              url: `${baseUrl}/categories/${cat.slug}`,
              lastModified: new Date(),
              changeFrequency: "weekly",
              priority: 0.8,
            });
            categoriesAdded++;
          }
        }
      }

      // 2. Fetch page 1 of products
      const page1Res = await fetch(
        `${wpUrl}/wp-json/wc/v3/products?status=publish&per_page=100&_fields=id,slug,date_modified&page=1`,
        {
          headers: { Authorization: authHeader },
          signal: AbortSignal.timeout(6000),
          next: { revalidate: 86400 },
        }
      ).catch(() => null);

      if (page1Res?.ok) {
        const page1 = (await page1Res.json()) as SitemapProduct[];
        const totalPages = Math.min(
          parseInt(page1Res.headers.get("x-wp-totalpages") || "1", 10),
          20
        );
        let allProducts = [...page1];

        if (totalPages > 1) {
          const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
          const batches = await Promise.all(
            remainingPages.map(async (page) => {
              try {
                const res = await fetch(
                  `${wpUrl}/wp-json/wc/v3/products?status=publish&per_page=100&_fields=id,slug,date_modified&page=${page}`,
                  {
                    headers: { Authorization: authHeader },
                    signal: AbortSignal.timeout(6000),
                    next: { revalidate: 86400 },
                  }
                );
                return res.ok ? ((await res.json()) as SitemapProduct[]) : [];
              } catch {
                return [];
              }
            })
          );
          allProducts = [...allProducts, ...batches.flat()];
        }

        for (const prod of allProducts) {
          if (prod.slug) {
            entries.push({
              url: `${baseUrl}/products/${prod.slug}`,
              lastModified: prod.date_modified ? new Date(prod.date_modified) : new Date(),
              changeFrequency: "weekly",
              priority: 0.85,
            });
            productsAdded++;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to generate dynamic sitemap items:", err);
    }
  }

  // Fallback categories if WooCommerce is offline or not configured
  if (categoriesAdded === 0) {
    for (const topic of TOPICS) {
      entries.push({
        url: `${baseUrl}/categories/${topic.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Fallback products if WooCommerce is offline or not configured
  if (productsAdded === 0 && Array.isArray(categoryRowsFallbackData)) {
    for (const item of categoryRowsFallbackData as Array<{ slug?: string }>) {
      if (item.slug) {
        entries.push({
          url: `${baseUrl}/products/${item.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  }

  // Deduplicate entries by URL
  const seen = new Set<string>();
  const uniqueEntries: MetadataRoute.Sitemap = [];
  for (const entry of entries) {
    if (!seen.has(entry.url)) {
      seen.add(entry.url);
      uniqueEntries.push(entry);
    }
  }

  return uniqueEntries;
}
