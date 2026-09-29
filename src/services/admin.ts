import { wcFetch } from "./woocommerce";
import type { WCOrder } from "./woocommerce";
import type { Product } from "@/types/product";
import { isWooConfigured } from "@/config/env";

export interface AdminStatsSnapshot {
  totalRevenue: number;
  totalOrders: number;
  posRevenue: number;
  posOrderCount: number;
  onlineRevenue: number;
  onlineOrderCount: number;
  lowStockCount: number;
  recentOrders: WCOrder[];
  lowStockProducts: Product[];
}

export async function getAdminOverview(): Promise<AdminStatsSnapshot> {
  if (!isWooConfigured()) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      posRevenue: 0,
      posOrderCount: 0,
      onlineRevenue: 0,
      onlineOrderCount: 0,
      lowStockCount: 0,
      recentOrders: [],
      lowStockProducts: [],
    };
  }

  try {
    // Fetch latest 50 orders — cache for 30 seconds to reduce WooCommerce load
    const orders = await wcFetch<WCOrder[]>("/orders", {
      searchParams: { per_page: 50, orderby: "date", order: "desc" },
      revalidate: 30,
    });

  // Fetch products — cache for 60 seconds (stock changes less frequently)
  const products = await wcFetch<Product[]>("/products", {
    searchParams: { per_page: 100, status: "publish" },
    revalidate: 60,
  });

  let totalRevenue = 0;
  let posRevenue = 0;
  let posOrderCount = 0;
  let onlineRevenue = 0;
  let onlineOrderCount = 0;

  for (const order of orders) {
    const total = parseFloat(order.total) || 0;
    if (order.status !== "cancelled" && order.status !== "refunded" && order.status !== "failed") {
      totalRevenue += total;
      const isPos = order.payment_method_title?.toLowerCase().includes("pos") ||
                    order.payment_method === "pos" ||
                    order.billing?.first_name === "Walk-in";
      if (isPos) {
        posRevenue += total;
        posOrderCount += 1;
      } else {
        onlineRevenue += total;
        onlineOrderCount += 1;
      }
    }
  }

  const lowStockProducts = products.filter((p) => {
    if (typeof p.stock_quantity === "number") {
      return p.stock_quantity <= 5;
    }
    return p.stock_status === "outofstock" || p.stock_status === "onbackorder";
  });

    return {
      totalRevenue,
      totalOrders: orders.length,
      posRevenue,
      posOrderCount,
      onlineRevenue,
      onlineOrderCount,
      lowStockCount: lowStockProducts.length,
      recentOrders: orders.slice(0, 10),
      lowStockProducts: lowStockProducts.slice(0, 6),
    };
  } catch (err) {
    console.error("Failed to load admin overview:", err);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      posRevenue: 0,
      posOrderCount: 0,
      onlineRevenue: 0,
      onlineOrderCount: 0,
      lowStockCount: 0,
      recentOrders: [],
      lowStockProducts: [],
    };
  }
}

export interface CreatePosOrderInput {
  paymentMethod: "Cash" | "UPI" | "Card";
  lineItems: { product_id: number; quantity: number; total?: string }[];
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  discountAmount?: number;
  notes?: string;
}

export async function submitPosOrder(input: CreatePosOrderInput): Promise<WCOrder> {
  const orderPayload = {
    payment_method: "pos",
    payment_method_title: `POS In-Store (${input.paymentMethod})`,
    status: "completed",
    billing: {
      first_name: input.customerName || "Walk-in",
      last_name: input.customerName ? "" : "Customer",
      email: input.customerEmail || "pos-walkin@forthetruth.in",
      phone: input.customerPhone || "0000000000",
      address_1: "In-Store Counter",
      city: "Store POS",
      country: "IN",
    },
    line_items: input.lineItems,
    meta_data: [
      { key: "created_via", value: "abny_pos_terminal" },
      { key: "payment_mode", value: input.paymentMethod },
      { key: "cashier_notes", value: input.notes || "" },
      ...(input.discountAmount ? [{ key: "pos_discount_applied", value: String(input.discountAmount) }] : []),
    ],
  };

  return wcFetch<WCOrder>("/orders", {
    method: "POST",
    body: orderPayload,
  });
}

export async function updateProductInventory(
  productId: number,
  data: {
    stock_quantity?: number;
    regular_price?: string;
    sale_price?: string;
    stock_status?: "instock" | "outofstock" | "onbackorder";
  }
): Promise<Product> {
  const payload: Record<string, unknown> = { ...data };
  if (data.stock_quantity !== undefined) {
    payload.manage_stock = true;
    payload.stock_status = data.stock_quantity > 0 ? "instock" : "outofstock";
  }
  return wcFetch<Product>(`/products/${productId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function fetchAllOrders(status?: string): Promise<WCOrder[]> {
  if (!isWooConfigured()) return [];
  try {
    const params: Record<string, string | number> = { per_page: 50, orderby: "date", order: "desc" };
    if (status && status !== "all") {
      params.status = status;
    }
    return await wcFetch<WCOrder[]>("/orders", {
      searchParams: params,
      revalidate: 30,
    });
  } catch {
    return [];
  }
}
