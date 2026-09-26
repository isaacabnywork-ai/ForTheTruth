import { PosTerminalClient } from "@/components/admin/pos/PosTerminalClient";
import { supabase } from "@/lib/supabaseClient";
import type { Product, WCCategory } from "@/types/product";
import { getAllProducts } from "@/services/woocommerce";

// Disable static rendering so it reads the fresh stock every time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AipcPosTerminalPage() {
  // 1. Fetch from Supabase instead of local JSON
  const { data: aipcData, error } = await supabase
    .from("aipc_books")
    .select("*")
    .order("id", { ascending: true });

  if (error || !aipcData) {
    console.error("Failed to load AIPC stock from Supabase", error);
  }

  // 2. Fetch all real products to grab their images
  const mainProducts = await getAllProducts({ revalidate: 3600 });
  const mainProductMap = new Map<string, Product>();
  for (const p of mainProducts) {
    if (p.sku) {
      mainProductMap.set(p.sku.toLowerCase(), p);
    }
  }

  const products: Product[] = (aipcData || []).map((item: any) => {
    const salePrice = item.PRICE ? String(item.PRICE) : "0";
    const regularPrice = salePrice; // We didn't migrate MRP, so just match sale price
    const qty = typeof item["AIPC QTY"] === "number" ? item["AIPC QTY"] : 0;
    
    // We stored the SKU inside the AUTHOR column temporarily during migration
    const skuLower = (item.AUTHOR || "").toLowerCase();
    const realProduct = mainProductMap.get(skuLower);
    
    return {
      id: item.id,
      name: item.TITLE || "Unknown Book",
      slug: skuLower,
      permalink: "",
      description: "",
      short_description: "",
      sku: item.AUTHOR || "", 
      price: salePrice,
      regular_price: regularPrice,
      sale_price: salePrice,
      on_sale: false,
      stock_status: qty > 0 ? "instock" : "outofstock",
      stock_quantity: qty,
      average_rating: "0",
      rating_count: 0,
      images: realProduct?.images || [],
      categories: [{ id: 999, name: "AIPC Conference", slug: "aipc" }],
      attributes: realProduct?.attributes || [
        { id: 1, name: "ISBN", options: [String(item.ISBN || "")] }
      ],
      meta_data: realProduct?.meta_data || []
    };
  });

  const categories: WCCategory[] = [
    { id: 999, name: "AIPC Conference", slug: "aipc", count: products.length }
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
