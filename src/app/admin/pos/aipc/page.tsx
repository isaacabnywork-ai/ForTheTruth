import { PosTerminalClient } from "@/components/admin/pos/PosTerminalClient";
import { supabase } from "@/lib/supabaseClient";
import type { Product, WCCategory } from "@/types/product";

// Disable static rendering so it reads the fresh stock every time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AipcPosTerminalPage() {
  // Fetch AIPC books from Supabase with a hard 8-second timeout
  let aipcData: any[] = [];

  try {
    const fetchPromise = supabase
      .from("aipc_books")
      .select("*")
      .order("id", { ascending: true });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error("Supabase timeout") }), 8000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      console.error("Failed to load AIPC stock from Supabase:", error.message);
    } else {
      aipcData = data || [];
    }
  } catch (err) {
    console.error("Unexpected error fetching AIPC books:", err);
  }

  // Map Supabase rows → Product shape (no WooCommerce image lookup — avoids 30s hang)
  const products: Product[] = aipcData.map((item: any) => {
    const salePrice = item.PRICE ? String(item.PRICE) : "0";
    const qty = typeof item["AIPC QTY"] === "number" ? item["AIPC QTY"] : 0;
    const skuLower = (item.AUTHOR || "").toLowerCase();

    return {
      id: item.id,
      name: item.TITLE || "Unknown Book",
      slug: skuLower,
      permalink: "",
      description: "",
      short_description: "",
      sku: item.AUTHOR || "",
      price: salePrice,
      regular_price: salePrice,
      sale_price: salePrice,
      on_sale: false,
      stock_status: qty > 0 ? "instock" : "outofstock",
      stock_quantity: qty,
      average_rating: "0",
      rating_count: 0,
      images: [],
      categories: [{ id: 999, name: "AIPC Conference", slug: "aipc" }],
      attributes: [{ id: 1, name: "ISBN", options: [String(item.ISBN || "")] }],
      meta_data: [],
    };
  });

  const categories: WCCategory[] = [
    { id: 999, name: "AIPC Conference", slug: "aipc", count: products.length },
  ];

  return (
    <PosTerminalClient
      initialProducts={products}
      categories={categories}
      submitApiUrl="/api/admin/aipc/checkout"
      showExportButton={true}
    />
  );
}

