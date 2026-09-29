import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { isWooConfigured } from "@/config/env";

// In-memory cache across serverless executions
let memoryCache: { data: Record<string, string>; expiresAt: number } | null = null;

/**
 * GET /api/admin/aipc/images
 * Fetches WooCommerce product images for AIPC books by SKU and Title.
 * Called client-side after the POS loads so it doesn't block the initial render.
 * Cached in memory and via Next.js ISR.
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWooConfigured()) {
    return NextResponse.json({ images: {} });
  }

  // Return memory cache if fresh (1 hour)
  const now = Date.now();
  if (memoryCache && memoryCache.expiresAt > now && Object.keys(memoryCache.data).length > 0) {
    return NextResponse.json(
      { images: memoryCache.data },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
    );
  }

  try {
    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const apiKey = process.env.WOOCOMMERCE_API_KEY;
    const apiSecret = process.env.WOOCOMMERCE_API_SECRET;

    if (!wpUrl || !apiKey || !apiSecret) {
      return NextResponse.json({ images: memoryCache?.data || {} });
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const PER_PAGE = 100;
    const FIELDS = "id,sku,name,images";

    const fetchController = new AbortController();
    const timeout = setTimeout(() => fetchController.abort(), 7000); // 7s hard timeout

    const firstRes = await fetch(
      `${wpUrl}/wp-json/wc/v3/products?per_page=${PER_PAGE}&status=publish&_fields=${FIELDS}&page=1`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        signal: fetchController.signal,
        next: { revalidate: 3600 },
      }
    ).catch(() => null);

    clearTimeout(timeout);

    if (!firstRes || !firstRes.ok) {
      return NextResponse.json({ images: memoryCache?.data || {} });
    }

    const firstBatch = (await firstRes.json().catch(() => [])) as any[];
    const totalPages = Math.min(
      5,
      parseInt(firstRes.headers.get("x-wp-totalpages") ?? "1", 10)
    );

    let allProducts = [...firstBatch];

    // Fetch remaining pages with short timeout
    if (totalPages > 1) {
      const pageNums = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const rest = await Promise.all(
        pageNums.map(async (page) => {
          try {
            const c = new AbortController();
            const t = setTimeout(() => c.abort(), 6000);
            const r = await fetch(
              `${wpUrl}/wp-json/wc/v3/products?per_page=${PER_PAGE}&status=publish&_fields=${FIELDS}&page=${page}`,
              {
                headers: { Authorization: `Basic ${auth}` },
                signal: c.signal,
                next: { revalidate: 3600 },
              }
            );
            clearTimeout(t);
            return r.ok ? await r.json() : [];
          } catch {
            return [];
          }
        })
      );
      allProducts = [...allProducts, ...rest.flat()];
    }

    // Build comprehensive mapping: SKU, Title, and normalized alphanumeric Title
    const images: Record<string, string> = {};
    for (const product of allProducts) {
      const src = product.images?.[0]?.src;
      if (!src) continue;

      if (product.sku) {
        images[String(product.sku).toLowerCase().trim()] = src;
      }
      if (product.name) {
        images[String(product.name).toLowerCase().trim()] = src;
        const clean = String(product.name).toLowerCase().replace(/[^a-z0-9]/g, "");
        if (clean) images[clean] = src;
      }
    }

    // Save to memory cache for 1 hour
    memoryCache = {
      data: images,
      expiresAt: Date.now() + 1000 * 60 * 60,
    };

    return NextResponse.json(
      { images },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
    );
  } catch (err) {
    console.error("Failed to fetch AIPC images:", err);
    return NextResponse.json({ images: memoryCache?.data || {} });
  }
}
