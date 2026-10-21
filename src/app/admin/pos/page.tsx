import { getAllProducts, getCategories } from "@/services/woocommerce";
import { PosTerminalClient } from "@/components/admin/pos/PosTerminalClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PosTerminalPage() {
  const [products, categories] = await Promise.all([
    getAllProducts({ revalidate: 60 }),
    getCategories(),
  ]);

  return <PosTerminalClient initialProducts={products} categories={categories} />;
}
