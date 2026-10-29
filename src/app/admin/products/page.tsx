import { getAllProducts } from "@/services/woocommerce";
import { ProductManagerClient } from "@/components/admin/ProductManagerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getAllProducts({ status: "any", revalidate: 60 });
  return <ProductManagerClient initialProducts={products} />;
}
