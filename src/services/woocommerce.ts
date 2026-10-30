/**
 * WooCommerce REST API client — SERVER-SIDE ONLY.
 * Never import this from a "use client" component: it holds API secrets.
 */
import { getServerEnv, isWooConfigured } from "@/config/env";
import type { Product, ProductReview, WCCategory } from "@/types/product";
import { formatCategoryName } from "@/utils/text";

const API_BASE = "/wp-json/wc/v3";
const MAX_RETRIES = 2;

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** ISR revalidation window in seconds. Default 1 hour. GET only. */
  revalidate?: number;
  searchParams?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

let recentApiError: { timestamp: number; message: string; status?: number } | null = null;

export function recordApiError(err: unknown) {
  const status = err instanceof WCApiError ? err.status : undefined;
  const message = err instanceof Error ? err.message : String(err);
  recentApiError = { timestamp: Date.now(), message, status };
}

export function clearApiError() {
  recentApiError = null;
}

export function isWooCommerceOffline(): boolean {
  if (!isWooConfigured()) return true;
  if (
    recentApiError &&
    (recentApiError.status === 502 || recentApiError.status === 503) &&
    Date.now() - recentApiError.timestamp < 15000
  ) {
    return true;
  }
  return false;
}

async function wcFetchRaw(
  path: string,
  opts: FetchOptions = {}
): Promise<Response> {
  if (!isWooConfigured()) {
    throw new WCApiError(503, "WooCommerce API is temporarily disabled for maintenance");
  }
  const env = getServerEnv();
  const url = new URL(`${env.NEXT_PUBLIC_WORDPRESS_URL}${API_BASE}${path}`);
  for (const [k, v] of Object.entries(opts.searchParams ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }

  const auth = Buffer.from(
    `${env.WOOCOMMERCE_API_KEY}:${env.WOOCOMMERCE_API_SECRET}`
  ).toString("base64");
  const isGet = (opts.method ?? "GET") === "GET";

  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const maxAttempts = isBuild ? 0 : 1;
  const timeoutMs = opts.timeout ?? (isBuild ? 6000 : 10000);

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: opts.method ?? "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
        next: isGet ? { revalidate: opts.revalidate ?? 3600 } : undefined,
        cache: isGet ? undefined : "no-store",
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error(`WooCommerce API Error (${res.status}):`, text);
        const err = new WCApiError(res.status, text);
        recordApiError(err);
        throw err;
      }
      clearApiError();
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      recordApiError(err);
      if (err instanceof WCApiError) throw err; // don't retry client errors
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }
  recordApiError(lastError);
  throw lastError;
}

export class WCApiError extends Error {
  status: number;
  constructor(status: number, body: string) {
    let message = `WooCommerce API ${status}`;
    try {
      const parsed = JSON.parse(body);
      message = parsed.message ?? (parsed.code ? `WooCommerce Error ${parsed.code}` : message);
    } catch {
      if (body && typeof body === "string") {
        const clean = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (clean && clean.length > 3 && clean.length < 300) {
          message = `WooCommerce (${status}): ${clean}`;
        }
      }
    }
    super(message);
    this.status = status;
  }
}

export async function wcFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const res = await wcFetchRaw(path, opts);
  return (await res.json()) as T;
}

// ---------- Products ----------

export interface ProductQuery {
  page?: number;
  perPage?: number;
  category?: number;
  search?: string;
  orderby?: "date" | "price" | "popularity" | "rating" | "title";
  order?: "asc" | "desc";
  featured?: boolean;
  onSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: "instock" | "outofstock" | "onbackorder";
  status?: "publish" | "draft" | "private" | "trash" | "any" | string;
  include?: number[];
  revalidate?: number;
  attribute?: string;
  attributeTerm?: number;
}

function productParams(q: ProductQuery = {}) {
  return {
    page: q.page ?? 1,
    per_page: q.perPage ?? 20,
    category: q.category,
    search: q.search,
    orderby: q.orderby,
    order: q.order,
    featured: q.featured ? true : undefined,
    on_sale: q.onSale ? true : undefined,
    min_price: q.minPrice,
    max_price: q.maxPrice,
    stock_status: q.stockStatus,
    include: q.include?.join(","),
    attribute: q.attribute,
    attribute_term: q.attributeTerm,
    status: q.status ?? "publish",
  };
}

const globalQueryMemCache = globalThis as unknown as {
  _productsQueryCache?: Map<string, { data: Product[]; time: number }>;
  _pagedQueryCache?: Map<string, { data: PagedProducts; time: number }>;
};

if (!globalQueryMemCache._productsQueryCache) {
  globalQueryMemCache._productsQueryCache = new Map();
}
if (!globalQueryMemCache._pagedQueryCache) {
  globalQueryMemCache._pagedQueryCache = new Map();
}

export async function getProducts(q: ProductQuery = {}): Promise<Product[]> {
  if (!isWooConfigured()) return [];
  const params = productParams(q);
  const cacheKey = JSON.stringify(params);
  const now = Date.now();
  const ttl = (q.revalidate ?? 120) * 1000;

  const cached = globalQueryMemCache._productsQueryCache?.get(cacheKey);
  if (cached && now - cached.time < ttl) {
    return cached.data;
  }

  try {
    const data = await wcFetch<Product[]>("/products", {
      searchParams: params,
      revalidate: q.revalidate ?? 120,
    });
    if (Array.isArray(data)) {
      globalQueryMemCache._productsQueryCache?.set(cacheKey, { data, time: now });
    }
    return data;
  } catch (err) {
    console.error("Failed to fetch WooCommerce products:", err);
    return cached?.data || [];
  }
}

export interface PagedProducts {
  products: Product[];
  total: number;
  totalPages: number;
}

export async function getProductsPaged(
  q: ProductQuery = {}
): Promise<PagedProducts> {
  if (!isWooConfigured()) {
    return { products: [], total: 0, totalPages: 1 };
  }
  const params = productParams(q);
  const cacheKey = JSON.stringify(params);
  const now = Date.now();
  const ttl = (q.revalidate ?? 120) * 1000;

  const cached = globalQueryMemCache._pagedQueryCache?.get(cacheKey);
  if (cached && now - cached.time < ttl) {
    return cached.data;
  }

  try {
    const res = await wcFetchRaw("/products", {
      searchParams: params,
      revalidate: q.revalidate ?? 120,
    });
    const paged: PagedProducts = {
      products: (await res.json()) as Product[],
      total: parseInt(res.headers.get("x-wp-total") ?? "0", 10),
      totalPages: parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10),
    };
    if (Array.isArray(paged.products)) {
      globalQueryMemCache._pagedQueryCache?.set(cacheKey, { data: paged, time: now });
    }
    return paged;
  } catch (err) {
    console.error("Failed to fetch paged products:", err);
    return cached?.data || { products: [], total: 0, totalPages: 1 };
  }
}

export const CATALOG_FIELDS =
  "id,name,slug,permalink,sku,price,regular_price,sale_price,on_sale,status,stock_status,stock_quantity,average_rating,rating_count,images,categories,attributes,meta_data,weight,dimensions";

const REQUIRED_FIELDS =
  "id,name,slug,permalink,description,short_description,sku,price,regular_price,sale_price,on_sale,status,stock_status,stock_quantity,average_rating,rating_count,images,categories,attributes,meta_data,weight,dimensions";

const globalForCache = globalThis as unknown as {
  _wcProductsCache?: { data: Product[]; time: number };
  _wcProductsCacheMap?: Record<string, { data: Product[]; time: number }>;
  _wcCategoriesCache?: { data: WCCategory[]; time: number };
};

/**
 * Fetches ALL products from WooCommerce by auto-paginating through every page
 * (100 products per request — the WooCommerce API maximum).
 * Uses lean CATALOG_FIELDS and controlled chunking to keep response times under 3s.
 * Results are cached in-memory with a 5-minute TTL.
 */
export async function getAllProducts(
  q: Omit<ProductQuery, "page" | "perPage"> & { forceRefresh?: boolean } = {}
): Promise<Product[]> {
  if (!isWooConfigured()) return [];
  const CACHE_TTL = (q.revalidate ?? 300) * 1000;
  const now = Date.now();
  const cacheKey = `${q.status || "publish"}_${q.category || ""}`;

  if (
    !q.forceRefresh &&
    globalForCache._wcProductsCacheMap?.[cacheKey] &&
    now - globalForCache._wcProductsCacheMap[cacheKey].time < CACHE_TTL
  ) {
    return globalForCache._wcProductsCacheMap[cacheKey].data;
  }

  const PER_PAGE = 100;

  try {
    // Fetch page 1 to discover totalPages with lean catalog fields
    const firstRes = await wcFetchRaw("/products", {
      searchParams: {
        ...productParams({ ...q, page: 1, perPage: PER_PAGE }),
        _fields: CATALOG_FIELDS,
      },
      revalidate: q.revalidate ?? 300,
      timeout: 30000,
    });
    const firstBatch = (await firstRes.json()) as Product[];
    const totalPages = parseInt(firstRes.headers.get("x-wp-totalpages") ?? "1", 10);

    // If fetching all/any statuses, also optionally fetch trash items
    let trashBatch: Product[] = [];
    if (q.status === "any") {
      try {
        const trashRes = await wcFetchRaw("/products", {
          searchParams: {
            ...productParams({ ...q, status: "trash", page: 1, perPage: 100 }),
            _fields: CATALOG_FIELDS,
          },
          revalidate: q.revalidate ?? 300,
          timeout: 10000,
        });
        if (trashRes.ok) {
          trashBatch = (await trashRes.json()) as Product[];
        }
      } catch (err) {
        console.warn("Could not fetch trash products:", err);
      }
    }

    if (totalPages <= 1) {
      const combined = [...firstBatch, ...trashBatch];
      if (combined.length > 0) {
        if (!globalForCache._wcProductsCacheMap) globalForCache._wcProductsCacheMap = {};
        globalForCache._wcProductsCacheMap[cacheKey] = { data: combined, time: Date.now() };
      }
      return combined;
    }

    // Fetch remaining pages in controlled chunks of 2 to avoid WordPress PHP exhaustion
    const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const rest: Product[][] = [];
    const CHUNK_SIZE = 2;

    for (let i = 0; i < pageNumbers.length; i += CHUNK_SIZE) {
      const chunk = pageNumbers.slice(i, i + CHUNK_SIZE);
      const chunkResults = await Promise.all(
        chunk.map((page) =>
          wcFetch<Product[]>("/products", {
            searchParams: {
              ...productParams({ ...q, page, perPage: PER_PAGE }),
              _fields: CATALOG_FIELDS,
            },
            revalidate: q.revalidate ?? 300,
            timeout: 30000,
          })
        )
      );
      rest.push(...chunkResults);
    }

    const allProducts = [firstBatch, ...rest, ...trashBatch].flat();
    if (allProducts.length > 0) {
      if (!globalForCache._wcProductsCacheMap) globalForCache._wcProductsCacheMap = {};
      globalForCache._wcProductsCacheMap[cacheKey] = { data: allProducts, time: Date.now() };
    }
    return allProducts;
  } catch (err) {
    console.error("Failed to fetch all products:", err);
    return globalForCache._wcProductsCacheMap?.[cacheKey]?.data ?? [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isWooConfigured()) return null;
  try {
    const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
    let results = await wcFetch<Product[]>("/products", {
      searchParams: { slug: cleanSlug, status: "publish" },
      revalidate: 600,
    });
    if (results.length > 0) return results[0];

    // Fallback: If exact slug lookup returns empty (due to WordPress SEO plugins or encoding differences), search by title/keywords
    const keyword = cleanSlug.replace(/-/g, " ");
    results = await wcFetch<Product[]>("/products", {
      searchParams: { search: keyword, status: "publish", per_page: 5 },
      revalidate: 600,
    });
    return results.find((p) => decodeURIComponent(p.slug).toLowerCase() === cleanSlug) ?? results[0] ?? null;
  } catch (err) {
    recordApiError(err);
    return null;
  }
}

export async function getProductBySlugWithStatus(
  slug: string
): Promise<{ product: Product | null; isOffline: boolean }> {
  if (!isWooConfigured()) return { product: null, isOffline: true };
  try {
    const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
    let results = await wcFetch<Product[]>("/products", {
      searchParams: { slug: cleanSlug, status: "publish" },
      revalidate: 600,
    });
    if (results.length > 0) return { product: results[0], isOffline: false };

    const keyword = cleanSlug.replace(/-/g, " ");
    results = await wcFetch<Product[]>("/products", {
      searchParams: { search: keyword, status: "publish", per_page: 5 },
      revalidate: 600,
    });
    const found = results.find((p) => decodeURIComponent(p.slug).toLowerCase() === cleanSlug) ?? results[0] ?? null;
    return { product: found, isOffline: false };
  } catch (err) {
    recordApiError(err);
    return { product: null, isOffline: true };
  }
}

export async function getProduct(id: number): Promise<Product> {
  if (!isWooConfigured()) throw new WCApiError(503, "Catalog is undergoing maintenance");
  return wcFetch<Product>(`/products/${id}`);
}

// ---------- Categories ----------

export async function getCategories(): Promise<WCCategory[]> {
  if (!isWooConfigured()) return [];
  const CACHE_TTL = 3600 * 1000;
  const now = Date.now();
  if (globalForCache._wcCategoriesCache && (now - globalForCache._wcCategoriesCache.time < CACHE_TTL)) {
    return globalForCache._wcCategoriesCache.data;
  }

  try {
    let data = await wcFetch<WCCategory[]>("/products/categories", {
      searchParams: { per_page: 100, hide_empty: true },
      revalidate: 86400,
    });
    if (data && data.length > 0) {
      data = data.map((cat) => ({
        ...cat,
        name: formatCategoryName(cat.name),
      }));
      globalForCache._wcCategoriesCache = { data, time: now };
    }
    return data;
  } catch (err) {
    console.error("Failed to fetch WooCommerce categories:", err);
    return globalForCache._wcCategoriesCache?.data || [];
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<WCCategory | null> {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const cats = await getCategories();
  return cats.find((c) => decodeURIComponent(c.slug).toLowerCase() === cleanSlug) ?? null;
}

// ---------- Reviews ----------

export async function getProductReviews(
  productId: number
): Promise<ProductReview[]> {
  if (!isWooConfigured()) return [];
  try {
    return await wcFetch<ProductReview[]>("/products/reviews", {
      searchParams: { product: productId, per_page: 20 },
      revalidate: 600,
    });
  } catch {
    return [];
  }
}

export async function createReview(data: {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
}): Promise<ProductReview> {
  if (!isWooConfigured()) throw new WCApiError(503, "Reviews temporarily unavailable");
  return wcFetch<ProductReview>("/products/reviews", {
    method: "POST",
    body: data,
  });
}

// ---------- Customers ----------

export interface WCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  role?: string;
  billing?: Record<string, string>;
  shipping?: Record<string, string>;
  avatar_url?: string;
}

export async function createCustomer(data: {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}): Promise<WCCustomer> {
  if (!isWooConfigured()) throw new WCApiError(503, "Registration is temporarily disabled for maintenance");
  return wcFetch<WCCustomer>("/customers", { method: "POST", body: data });
}

export async function getCustomerByEmail(
  email: string
): Promise<WCCustomer | null> {
  if (!isWooConfigured()) return null;
  try {
    const res = await wcFetch<WCCustomer[]>("/customers", {
      searchParams: { email: email.trim(), per_page: 1, role: "all" },
      revalidate: 0,
    });
    return res[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Robust customer lookup by either WordPress username or email address.
 * Prioritizes staff members and exact username/email matches to avoid fuzzy search false positives.
 */
export async function getCustomerByUsernameOrEmail(
  identifier: string
): Promise<WCCustomer | null> {
  if (!isWooConfigured()) return null;
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;

  // 1. Direct email lookup if input looks like an email
  if (clean.includes("@")) {
    const directEmailCustomer = await getCustomerByEmail(clean);
    if (directEmailCustomer) return directEmailCustomer;
  }

  // 2. Check WordPress staff roles first (administrator, shop_manager, editor)
  try {
    const staffRoles = ["administrator", "shop_manager", "editor"];
    const staffBatches = await Promise.all(
      staffRoles.map((role) =>
        wcFetch<WCCustomer[]>("/customers", {
          searchParams: { role, per_page: 100 },
          revalidate: 30,
          timeout: 10000,
        }).catch(() => [])
      )
    );

    for (const batch of staffBatches) {
      const match = batch.find(
        (u) =>
          u.email?.toLowerCase() === clean ||
          u.username?.toLowerCase() === clean ||
          `${u.first_name || ""} ${u.last_name || ""}`.trim().toLowerCase() === clean
      );
      if (match) return match;
    }
  } catch {
    /* fallback to search */
  }

  // 3. Search general customers with exact matching priority
  try {
    const searchRes = await wcFetch<WCCustomer[]>("/customers", {
      searchParams: { search: clean, per_page: 50, role: "all" },
      revalidate: 0,
      timeout: 10000,
    }).catch(() => []);

    const exactMatch = searchRes.find(
      (u) =>
        u.email?.toLowerCase() === clean ||
        u.username?.toLowerCase() === clean
    );
    if (exactMatch) return exactMatch;

    const partialMatch = searchRes.find(
      (u) =>
        u.email?.toLowerCase().includes(clean) ||
        u.username?.toLowerCase().includes(clean)
    );
    if (partialMatch) return partialMatch;
  } catch {
    /* ignore search error */
  }

  return null;
}

export async function updateCustomer(
  id: number,
  data: Partial<WCCustomer>
): Promise<WCCustomer> {
  if (!isWooConfigured()) throw new WCApiError(503, "Customer updates temporarily unavailable");
  return wcFetch<WCCustomer>(`/customers/${id}`, { method: "PUT", body: data });
}

// ---------- Orders ----------

export interface WCOrder {
  id: number;
  status: string;
  currency: string;
  total: string;
  date_created: string;
  payment_method?: string;
  payment_method_title?: string;
  billing: Record<string, string>;
  shipping: Record<string, string>;
  line_items: {
    id: number;
    product_id: number;
    name: string;
    quantity: number;
    total: string;
    price: number | string;
  }[];
  shipping_lines?: { method_title: string; total: string }[];
  discount_total?: string;
  customer_id?: number;
  order_key?: string;
}

export async function createOrder(data: unknown): Promise<WCOrder> {
  if (!isWooConfigured()) throw new WCApiError(503, "Checkout is temporarily disabled for maintenance");
  return wcFetch<WCOrder>("/orders", { method: "POST", body: data });
}

export async function updateOrder(
  id: number,
  data: unknown
): Promise<WCOrder> {
  if (!isWooConfigured()) throw new WCApiError(503, "Orders temporarily unavailable");
  return wcFetch<WCOrder>(`/orders/${id}`, { method: "PUT", body: data });
}

export async function getOrder(id: number): Promise<WCOrder> {
  if (!isWooConfigured()) throw new WCApiError(503, "Orders temporarily unavailable");
  return wcFetch<WCOrder>(`/orders/${id}`, { revalidate: 0 });
}

export async function getOrdersByCustomer(
  customerId: number
): Promise<WCOrder[]> {
  if (!isWooConfigured()) return [];
  try {
    return await wcFetch<WCOrder[]>("/orders", {
      searchParams: { customer: customerId, per_page: 50, orderby: "date", order: "desc" },
      revalidate: 0,
    });
  } catch {
    return [];
  }
}

export async function getOrdersByEmail(
  email: string,
  customerId?: number
): Promise<WCOrder[]> {
  if (!isWooConfigured()) return [];
  try {
    // Fetch by billing email (catches guest orders)
    const emailOrders = await wcFetch<WCOrder[]>("/orders", {
      searchParams: { search: email, per_page: 50, orderby: "date", order: "desc" },
      revalidate: 0,
    });

    // Fetch by customer ID (catches logged-in orders)
    let idOrders: WCOrder[] = [];
    if (customerId) {
      idOrders = await getOrdersByCustomer(customerId).catch(() => []);
    }

    // Deduplicate and strictly filter
    const map = new Map<number, WCOrder>();
    
    for (const o of [...emailOrders, ...idOrders]) {
      const isOwner =
        o.customer_id === customerId ||
        o.billing?.email?.toLowerCase() === email.toLowerCase();
        
      if (isOwner) {
        map.set(o.id, o);
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );
  } catch {
    return [];
  }
}

// ---------- Analytics & Reports ----------

export interface WCSalesReport {
  total_sales: string;
  net_sales: string;
  average_sales: string;
  total_orders: number;
  total_items: number;
  total_tax: string;
  total_shipping: string;
  total_refunds: number;
  total_discount: string;
  totals: Record<
    string,
    {
      sales: string;
      orders: number;
      items: number;
      tax: string;
      shipping: string;
      discount: string;
      customers: number;
    }
  >;
}

export async function getSalesReports(
  period: "week" | "month" | "year" | "last_month" = "month"
): Promise<WCSalesReport[]> {
  if (!isWooConfigured()) return [];
  try {
    return await wcFetch<WCSalesReport[]>("/reports/sales", {
      searchParams: { period },
      revalidate: 60, // 1 minute cache for admin dashboard
    });
  } catch {
    return [];
  }
}

export interface WCTopSeller {
  product_id: number;
  name: string;
  quantity: number;
}

export async function getTopSellersReport(): Promise<WCTopSeller[]> {
  if (!isWooConfigured()) return [];
  try {
    return await wcFetch<WCTopSeller[]>("/reports/top_sellers", {
      searchParams: { period: "year" },
      revalidate: 3600,
    });
  } catch {
    return [];
  }
}

// ---------- Extended Customers ----------

export async function getAllCustomersPaged(
  page: number = 1,
  search?: string
): Promise<{ customers: WCCustomer[]; total: number; totalPages: number }> {
  if (!isWooConfigured()) return { customers: [], total: 0, totalPages: 1 };
  try {
    const searchParams: Record<string, string | number> = { per_page: 20, page, role: "all" };
    if (search) searchParams.search = search;

    const res = await wcFetchRaw("/customers", {
      searchParams,
      revalidate: 60,
    });
    
    return {
      customers: (await res.json()) as WCCustomer[],
      total: parseInt(res.headers.get("x-wp-total") ?? "0", 10),
      totalPages: parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10),
    };
  } catch {
    return { customers: [], total: 0, totalPages: 1 };
  }
}

// ─── Free E-Books ──────────────────────────────────────────────────────────────

/** A downloadable link attached to an order line item */
export interface WCDownloadLink {
  download_id: string;
  download_url: string;
  product_id: number;
  product_name: string;
  download_name: string;
  order_id: number;
  downloads_remaining: string; // "unlimited" or a number string
  access_expires: string | null; // ISO date or null
  file: { name: string; file: string };
}

/** Fetch all free downloadable products from WooCommerce */
export async function getFreeEbooks(): Promise<Product[]> {
  if (!isWooConfigured()) return [];
  try {
    return await wcFetch<Product[]>("/products", {
      searchParams: {
        downloadable: true,
        virtual: true,
        status: "publish",
        per_page: 100,
        orderby: "date",
        order: "desc",
      },
      revalidate: 3600,
    }).then((products) => products.filter((p) => parseFloat(p.price ?? "1") === 0));
  } catch {
    return [];
  }
}

/** Fetch all downloads available to a customer */
export async function getCustomerDownloads(customerId: number): Promise<WCDownloadLink[]> {
  if (!isWooConfigured() || !customerId || customerId <= 0) return [];
  try {
    return await wcFetch<WCDownloadLink[]>(`/customers/${customerId}/downloads`, {
      revalidate: 0,
    });
  } catch {
    return [];
  }
}

/** Extract downloads directly from an order */
export async function getDownloadsForOrder(order: WCOrder): Promise<WCDownloadLink[]> {
  const freeBooks = await getFreeEbooks().catch(() => []);
  const freeBooksMap = new Map<number, Product>(freeBooks.map((b) => [b.id, b]));
  const downloads: WCDownloadLink[] = [];

  for (const item of order.line_items || []) {
    let prod: Product | null | undefined = freeBooksMap.get(item.product_id);
    if (!prod) {
      prod = (await getProduct(item.product_id).catch(() => null)) as Product | null;
    }
    if (prod && prod.downloadable && prod.downloads && prod.downloads.length > 0) {
      const dlFile = prod.downloads[0];
      const env = getServerEnv();
      const email = order.billing?.email || "";
      const downloadUrl = `${env.NEXT_PUBLIC_WORDPRESS_URL}/?download_file=${prod.id}&order=${order.order_key}&email=${encodeURIComponent(email)}&key=${dlFile.id}`;

      downloads.push({
        download_id: dlFile.id,
        download_url: downloadUrl,
        product_id: prod.id,
        product_name: prod.name,
        download_name: dlFile.name || "PDF",
        order_id: order.id,
        downloads_remaining: "unlimited",
        access_expires: null,
        file: {
          name: dlFile.name,
          file: dlFile.file,
        },
      });
    }
  }
  return downloads;
}

/**
 * Robust download fetcher for user account:
 * 1. Checks WooCommerce /customers/:id/downloads if customerId > 0
 * 2. Checks completed orders by email & customerId (catches guest / zero-id orders)
 * 3. Merges and deduplicates so no purchased or free e-book is ever lost
 */
export async function getUserDownloads(
  email: string,
  customerId?: number
): Promise<WCDownloadLink[]> {
  if (!isWooConfigured()) return [];

  const downloadMap = new Map<number, WCDownloadLink>();

  // 1. Direct WooCommerce customer downloads if customerId exists
  if (customerId && customerId > 0) {
    try {
      const direct = await getCustomerDownloads(customerId);
      for (const d of direct) {
        if (d.product_id) {
          downloadMap.set(d.product_id, d);
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Scan completed/processing orders by email
  try {
    const orders = await getOrdersByEmail(email, customerId);
    const validOrders = orders.filter(
      (o) => o.status === "completed" || o.status === "processing"
    );

    const freeBooks = await getFreeEbooks().catch(() => []);
    const freeBooksMap = new Map<number, Product>(freeBooks.map((b) => [b.id, b]));

    for (const order of validOrders) {
      for (const item of order.line_items || []) {
        if (downloadMap.has(item.product_id)) continue;

        let prod: Product | null | undefined = freeBooksMap.get(item.product_id);
        if (!prod) {
          prod = (await getProduct(item.product_id).catch(() => null)) as Product | null;
        }

        if (prod && prod.downloadable && prod.downloads && prod.downloads.length > 0) {
          const dlFile = prod.downloads[0];
          const env = getServerEnv();
          const downloadUrl = `${env.NEXT_PUBLIC_WORDPRESS_URL}/?download_file=${prod.id}&order=${order.order_key}&email=${encodeURIComponent(order.billing?.email || email)}&key=${dlFile.id}`;

          downloadMap.set(item.product_id, {
            download_id: dlFile.id,
            download_url: downloadUrl,
            product_id: prod.id,
            product_name: prod.name,
            download_name: dlFile.name || "PDF",
            order_id: order.id,
            downloads_remaining: "unlimited",
            access_expires: null,
            file: {
              name: dlFile.name,
              file: dlFile.file,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("[getUserDownloads error]", err);
  }

  return Array.from(downloadMap.values());
}

/** Create a free order for a downloadable product (sets status=completed so download is available immediately) */
export async function createFreeOrder(opts: {
  productId: number;
  productName: string;
  customerId: number;
  billing: Record<string, string>;
}): Promise<WCOrder> {
  const payload: any = {
    customer_id: opts.customerId || 0,
    status: "completed",
    payment_method: "free",
    payment_method_title: "Free Download",
    billing: opts.billing,
    shipping: opts.billing,
    line_items: [{ product_id: opts.productId, quantity: 1 }],
    set_paid: true,
  };

  try {
    return await createOrder(payload);
  } catch (err) {
    // If specific customer_id failed in WooCommerce, retry safely as guest order
    if (opts.customerId && opts.customerId > 0) {
      payload.customer_id = 0;
      return await createOrder(payload);
    }
    throw err;
  }
}
// ---------- Staff Management ----------

export interface WCStaffMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: "administrator" | "shop_manager" | "editor" | string;
  avatarUrl: string;
  isEnvAdmin?: boolean;
}

export async function getStaffMembers(): Promise<WCStaffMember[]> {
  if (!isWooConfigured()) return [];

  const staffMap = new Map<string, WCStaffMember>();

  // 1. Fetch real WordPress staff members (administrators, shop_managers, editors)
  try {
    const roles = ["administrator", "shop_manager", "editor"];
    const results = await Promise.all(
      roles.map((role) =>
        wcFetch<WCCustomer[]>("/customers", {
          searchParams: { role, per_page: 100 },
          revalidate: 30,
          timeout: 20000,
        }).catch(() => [])
      )
    );

    for (const batch of results) {
      for (const u of batch) {
        if (!u.email) continue;
        const emailLower = u.email.toLowerCase().trim();
        const fullName =
          `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
          u.username ||
          emailLower.split("@")[0];
        staffMap.set(emailLower, {
          id: u.id,
          email: u.email,
          firstName: u.first_name || fullName.split(" ")[0] || "Staff",
          lastName: u.last_name || "",
          displayName: fullName,
          role: u.role || "shop_manager",
          avatarUrl:
            u.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email)}`,
        });
      }
    }
  } catch (err) {
    console.error("Failed to fetch WordPress staff members:", err);
  }

  // 2. Merge all emails from ADMIN_EMAILS environment variable
  const envAdminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  for (const envEmail of envAdminEmails) {
    if (!staffMap.has(envEmail)) {
      const existingCustomer = await getCustomerByEmail(envEmail).catch(() => null);
      if (existingCustomer) {
        staffMap.set(envEmail, {
          id: existingCustomer.id,
          email: existingCustomer.email,
          firstName: existingCustomer.first_name || "Admin",
          lastName: existingCustomer.last_name || "",
          displayName:
            `${existingCustomer.first_name || ""} ${existingCustomer.last_name || ""}`.trim() ||
            envEmail.split("@")[0],
          role: existingCustomer.role === "editor" ? "editor" : "administrator",
          avatarUrl:
            existingCustomer.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(envEmail)}`,
          isEnvAdmin: true,
        });
      } else {
        const cleanName = envEmail
          .split("@")[0]
          .replace(/[-_.0-9]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim();
        staffMap.set(envEmail, {
          id: 9000 + staffMap.size,
          email: envEmail,
          firstName: cleanName.split(" ")[0] || "Admin",
          lastName: cleanName.split(" ").slice(1).join(" ") || "",
          displayName: cleanName,
          role: "administrator",
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(envEmail)}`,
          isEnvAdmin: true,
        });
      }
    } else {
      const existing = staffMap.get(envEmail)!;
      existing.isEnvAdmin = true;
    }
  }

  return Array.from(staffMap.values());
}

export async function createStaffCustomer(data: {
  email: string;
  first_name: string;
  last_name: string;
  role: "administrator" | "shop_manager" | "editor";
  password?: string;
}): Promise<WCCustomer> {
  if (!isWooConfigured()) throw new WCApiError(503, "WooCommerce API offline");
  return wcFetch<WCCustomer>("/customers", {
    method: "POST",
    body: {
      ...data,
      username: data.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + Math.floor(Math.random() * 1000),
    },
  });
}

export async function deleteStaffCustomer(id: number): Promise<void> {
  if (!isWooConfigured()) throw new WCApiError(503, "WooCommerce API offline");
  await wcFetch(`/customers/${id}?force=true`, { method: "DELETE" });
}
