import { fetchAllOrders } from "@/services/admin";
import { OrdersLedgerClient } from "@/components/admin/OrdersLedgerClient";

export const revalidate = 30;

export default async function AdminOrdersPage() {
  const orders = await fetchAllOrders("all");
  return <OrdersLedgerClient initialOrders={orders} />;
}
