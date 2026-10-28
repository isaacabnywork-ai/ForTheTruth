import { requireAdmin } from "@/lib/adminGuard";
import { getStaffMembers } from "@/services/woocommerce";
import { StaffManagerClient } from "@/components/admin/StaffManagerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Staff & Access — For The Truth Admin",
  description: "Manage who has access to the For The Truth admin portal.",
};

export default async function StaffPage() {
  const admin = await requireAdmin();
  if (!admin) return null;

  const staff = await getStaffMembers().catch(() => []);
  const isFallback = staff.length === 0;

  const users =
    staff.length > 0
      ? staff
      : [
          {
            id: admin.id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            displayName: admin.displayName,
            role: "administrator",
            avatarUrl: admin.avatarUrl ?? "",
            isFallback: true,
            isEnvAdmin: true,
          },
        ];

  return (
    <StaffManagerClient
      initialUsers={users}
      isFallback={isFallback}
      currentUserEmail={admin.email}
    />
  );
}
