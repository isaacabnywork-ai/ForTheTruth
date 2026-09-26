import { Suspense } from "react";
import { getAdminOverview } from "@/services/admin";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

// Shell renders instantly; data streams in via Suspense
export const dynamic = "force-dynamic";

async function DashboardData() {
  const stats = await getAdminOverview();
  return <AdminDashboardClient stats={stats} />;
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="h-8 w-80 rounded-2xl bg-slate-200 mb-2" />
          <div className="h-4 w-64 rounded bg-slate-100" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-44 rounded-2xl bg-slate-200" />
          <div className="h-12 w-32 rounded-2xl bg-slate-100" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 rounded-3xl border border-slate-200 bg-white shadow-sm" />
        ))}
      </div>
      <div className="h-64 rounded-3xl border border-slate-200 bg-white shadow-sm" />
    </div>
  );
}
