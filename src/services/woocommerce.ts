/**
 * WooCommerce REST API client — SERVER-SIDE ONLY.
 * Never import this from a "use client" component: it holds API secrets.
 */
import { getServerEnv } from "@/config/env";
import type { Product, ProductReview, WCCategory } from "@/types/product";

const API_BASE = "/wp-json/wc/v3";
const MAX_RETRIES = 2;

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** ISR revalidation window in seconds. Default 1 hour. GET only. */
  revalidate?: number;
  searchParams?: Record<string, string | number | boolean | undefined>;
}

async function wcFetchRaw(
  path: string,
  opts: FetchOptions = {}
): Promise<Response> {
  const env = getServerEnv();
  const url = new URL(`${env.NEXT_PUBLIC_WORDPRESS_URL}${API_BASE}${path}`);
  for (const [k, v] of Object.entries(opts.searchParams ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }

  const auth = Buffer.from(
    `${env.WOOCOMMERCE_API_KEY}:${env.WOOCOMMERCE_API_SECRET}`
  ).toString("base64");
  const isGet = (opts.method ?? "GET") === "GET";

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: opts.method ?? "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        next: isGet ? { revalidate: opts.revalidate ?? 3600 } : undefined,
        cache: isGet ? undefined : "no-store",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error(`WooCommerce API Error (${res.status}):`, text);
        throw new WCApiError(res.status, text);
      }
      return res;
    } catch (err) {
      lastError = err;
      if (err instanceof WCApiError) throw err; // don't retry client errors
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }
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
  include?: number[];
  revalidate?: number;
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
    status: "publish",
  };
}

export async function getProducts(q: ProductQuery = {}): Promise<Product[]> {
  return wcFetch<Product[]>("/products", {
    searchParams: productParams(q),
    revalidate: q.revalidate,
  });
}

export interface PagedProducts {
  products: Product[];
  total: number;
  totalPages: number;
}

export async function getProductsPaged(
  q: ProductQuery = {}
): Promise<PagedProducts> {
  const res = await wcFetchRaw("/products", {
    searchParams: productParams(q),
    revalidate: q.revalidate ?? 600,
  });
  return {
    products: (await res.json()) as Product[],
    total: parseInt(res.headers.get("x-wp-total") ?? "0", 10),
    totalPages: parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
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
}

export async function getProduct(id: number): Promise<Product> {
  return wcFetch<Product>(`/products/${id}`);
}

// ---------- Categories ----------

export async function getCategories(): Promise<WCCategory[]> {
  return wcFetch<WCCategory[]>("/products/categories", {
    searchParams: { per_page: 100, hide_empty: true },
    revalidate: 86400,
  });
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
  return wcFetch<ProductReview[]>("/products/reviews", {
    searchParams: { product: productId, per_page: 20 },
    revalidate: 600,
  });
}

export async function createReview(data: {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
}): Promise<ProductReview> {
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
  return wcFetch<WCCustomer>("/customers", { method: "POST", body: data });
}

export async function getCustomerByEmail(
  email: string
): Promise<WCCustomer | null> {
  const res = await wcFetch<WCCustomer[]>("/customers", {
    searchParams: { email, per_page: 1, role: "all" },
    revalidate: 0,
  });
  return res[0] ?? null;
}

export async function updateCustomer(
  id: number,
  data: Partial<WCCustomer>
): Promise<WCCustomer> {
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
  return wcFetch<WCOrder>("/orders", { method: "POST", body: data });
}

export async function updateOrder(
  id: number,
  data: unknown
): Promise<WCOrder> {
  return wcFetch<WCOrder>(`/orders/${id}`, { method: "PUT", body: data });
}

export async function getOrder(id: number): Promise<WCOrder> {
  return wcFetch<WCOrder>(`/orders/${id}`, { revalidate: 0 });
}

export async function getOrdersByCustomer(
  customerId: number
): Promise<WCOrder[]> {
  return wcFetch<WCOrder[]>("/orders", {
    searchParams: { customer: customerId, per_page: 50, orderby: "date", order: "desc" },
    revalidate: 0,
  });
}

export async function getOrdersByEmail(
  email: string,
  customerId?: number
): Promise<WCOrder[]> {
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
  return wcFetch<WCSalesReport[]>("/reports/sales", {
    searchParams: { period },
    revalidate: 60, // 1 minute cache for admin dashboard
  });
}

export interface WCTopSeller {
  product_id: number;
  name: string;
  quantity: number;
}

export async function getTopSellersReport(): Promise<WCTopSeller[]> {
  return wcFetch<WCTopSeller[]>("/reports/top_sellers", {
    searchParams: { period: "year" },
    revalidate: 3600,
  });
}

// ---------- Extended Customers ----------

export async function getAllCustomersPaged(
  page: number = 1,
  search?: string
): Promise<{ customers: WCCustomer[]; total: number; totalPages: number }> {
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
  return wcFetch<Product[]>("/products", {
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
}

/** Fetch all downloads available to a customer */
export async function getCustomerDownloads(customerId: number): Promise<WCDownloadLink[]> {
  return wcFetch<WCDownloadLink[]>(`/customers/${customerId}/downloads`, {
    revalidate: 0,
  });
}

/** Create a free order for a downloadable product (sets status=completed so download is available immediately) */
export async function createFreeOrder(opts: {
  productId: number;
  productName: string;
  customerId: number;
  billing: Record<string, string>;
}): Promise<WCOrder> {
  return createOrder({
    customer_id: opts.customerId,
    status: "completed",
    payment_method: "free",
    payment_method_title: "Free Download",
    billing: opts.billing,
    shipping: opts.billing,
    line_items: [{ product_id: opts.productId, quantity: 1 }],
    set_paid: true,
  });
}

