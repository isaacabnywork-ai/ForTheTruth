import type { Metadata } from "next";
import { StoreMaintenancePage } from "@/components/common/StoreMaintenancePage";

export const metadata: Metadata = {
  title: "Catalog Maintenance",
  description: "Our online bookstore catalog is temporarily undergoing scheduled maintenance.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return <StoreMaintenancePage />;
}
