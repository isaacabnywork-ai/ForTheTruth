import { getAllProducts } from "@/services/woocommerce";
import { ProductManagerClient } from "@/components/admin/ProductManagerClient";

export const revalidate = 30;

export default async function AdminProductsPage() {
  const products = await getAllProducts({ revalidate: 60 });
  return <ProductManagerClient initialProducts={products} />;
}
