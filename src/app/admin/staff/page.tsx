import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminGuard";
import { getSessionToken } from "@/lib/session";
import { getServerEnv } from "@/config/env";
import { StaffManagerClient } from "@/components/admin/StaffManagerClient";

export const metadata = {
  title: "Staff & Access — ABNY Admin",
  description: "Manage who has access to the ABNY admin portal.",
};

export default async function StaffPage() {
  const admin = await requireAdmin();
  if (!admin) return null;

  const token = await getSessionToken();
  const env = getServerEnv();

  let users: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    role: string;
    avatarUrl: string;
    isFallback?: boolean;
  }[] = [];
  let isFallback = false;

  // If using the fallback token, only show the current user
  if (!token || token.startsWith("admin:") || token.startsWith("google:")) {
    isFallback = true;
    users = [
      {
        id: 9999,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        displayName: admin.displayName,
        role: "administrator",
        avatarUrl: admin.avatarUrl ?? "",
        isFallback: true,
      },
    ];
  } else {
    try {
      const res = await fetch(
        `${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users?roles=administrator,shop_manager,editor&per_page=100&context=edit`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const wpUsers = await res.json();
        users = wpUsers.map((u: {
          id: number;
          name: string;
          email?: string;
          roles?: string[];
          avatar_urls?: Record<string, string>;
        }) => ({
          id: u.id,
          email: u.email ?? "",
          firstName: u.name?.split(" ")[0] ?? "",
          lastName: u.name?.split(" ").slice(1).join(" ") ?? "",
          displayName: u.name,
          role: u.roles?.[0] ?? "editor",
          avatarUrl: u.avatar_urls?.["96"] ?? "",
        }));
      } else {
        // WordPress available but errored — show fallback
        isFallback = true;
        users = [
          {
            id: admin.id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            displayName: admin.displayName,
            role: "administrator",
            avatarUrl: admin.avatarUrl ?? "",
          },
        ];
      }
    } catch {
      isFallback = true;
      users = [];
    }
  }

  return (
    <StaffManagerClient
      initialUsers={users}
      isFallback={isFallback}
      currentUserEmail={admin.email}
    />
  );
}
