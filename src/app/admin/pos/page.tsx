import { getAllProducts, getCategories } from "@/services/woocommerce";
import { PosTerminalClient } from "@/components/admin/pos/PosTerminalClient";

export const revalidate = 60; // Re-fetch inventory every 60 seconds

export default async function PosTerminalPage() {
  const [products, categories] = await Promise.all([
    getAllProducts({ revalidate: 60 }),
    getCategories(),
  ]);

  return <PosTerminalClient initialProducts={products} categories={categories} />;
}
