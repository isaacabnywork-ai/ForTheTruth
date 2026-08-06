import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Retail POS Terminal & Admin | For The Truth",
  description: "Point of Sale Cashier Terminal and Retail Management Hub for ABNY Books.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
