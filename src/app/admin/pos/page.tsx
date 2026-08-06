import { getProducts, getCategories } from "@/services/woocommerce";
import { PosTerminalClient } from "@/components/admin/pos/PosTerminalClient";

export const revalidate = 60; // Re-fetch inventory every 60 seconds

export default async function PosTerminalPage() {
  const [products, categories] = await Promise.all([
    getProducts({ perPage: 100, revalidate: 60 }),
    getCategories(),
  ]);

  return <PosTerminalClient initialProducts={products} categories={categories} />;
}
