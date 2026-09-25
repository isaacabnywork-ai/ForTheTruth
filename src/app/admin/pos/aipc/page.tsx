import { PosTerminalClient } from "@/components/admin/pos/PosTerminalClient";
import fs from "fs";
import path from "path";
import type { Product, WCCategory } from "@/types/product";
import { getAllProducts } from "@/services/woocommerce";

// Disable static rendering so it reads the fresh JSON stock every time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AipcPosTerminalPage() {
  const dataPath = path.join(process.cwd(), "src/data/aipc_books.json");
  const fileContent = fs.readFileSync(dataPath, "utf8");
  const aipcData = JSON.parse(fileContent);

  // Fetch all real products to grab their images and correct ISBNs
  const mainProducts = await getAllProducts({ revalidate: 3600 });
  const mainProductMap = new Map<string, Product>();
  for (const p of mainProducts) {
    if (p.sku) {
      mainProductMap.set(p.sku.toLowerCase(), p);
    }
  }

  const products: Product[] = aipcData.map((item: any, index: number) => {
    // Treat invalid or empty MRPs as 0 to avoid NaN
    const regularPrice = item.MRP ? String(item.MRP) : "0";
    const salePrice = item["AIPC Special Price"] ? String(item["AIPC Special Price"]) : "0";
    const qty = typeof item["AIPC QTY"] === "number" ? item["AIPC QTY"] : 0;
    const skuLower = (item.SKU || "").toLowerCase();
    const realProduct = mainProductMap.get(skuLower);
    
    return {
      id: 100000 + index, // Fake ID
      name: item.Name || "Unknown Book",
      slug: skuLower,
      permalink: "",
      description: "",
      short_description: "",
      sku: item.SKU || "",
      price: salePrice,
      regular_price: regularPrice,
      sale_price: salePrice,
      on_sale: parseFloat(regularPrice) > parseFloat(salePrice),
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
