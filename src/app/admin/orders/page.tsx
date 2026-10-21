import { fetchAllOrders } from "@/services/admin";
import { OrdersLedgerClient } from "@/components/admin/OrdersLedgerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await fetchAllOrders("all");
  return <OrdersLedgerClient initialOrders={orders} />;
}
