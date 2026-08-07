"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WCSalesReport {
  total_sales: string;
  net_sales: string;
  total_orders: number;
  total_items: number;
  totals: Record<
    string,
    {
      sales: string;
      orders: number;
      items: number;
    }
  >;
}

interface WCTopSeller {
  product_id: number;
  name: string;
  quantity: number;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [report, setReport] = useState<WCSalesReport | null>(null);
  const [topSellers, setTopSellers] = useState<WCTopSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [salesRes, sellersRes] = await Promise.all([
          fetch(`/api/admin/reports/sales?period=${period}`),
          fetch("/api/admin/reports/top-sellers")
        ]);
        const salesData = await salesRes.json();
        const sellersData = await sellersRes.json();
        
        if (Array.isArray(salesData) && salesData.length > 0) {
          setReport(salesData[0]);
        }
        if (Array.isArray(sellersData)) {
          setTopSellers(sellersData);
        }
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period]);

  const chartData = report?.totals
    ? Object.entries(report.totals).map(([dateStr, data]) => {
        let label = dateStr;
        if (dateStr.length === 7) {
          // YYYY-MM
          const d = new Date(dateStr + "-01T00:00:00");
          label = d.toLocaleDateString("en-US", { month: "short" });
        } else {
          // YYYY-MM-DD
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            label = `${parts[1]}/${parts[2]}`;
          }
        }
        return {
          name: label,
          sales: parseFloat(data.sales || "0"),
        };
      })
    : [];

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Analytics Overview</h1>
          <p className="text-sm text-charcoal/60">Monitor your store's performance and sales trends.</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="cursor-pointer rounded-lg border border-charcoal/10 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm focus:border-gold-light focus:outline-none focus:ring-1 focus:ring-gold-light"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="year">This Year (Monthly)</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-[500px] w-full items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-light border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Sales" value={`₹${report?.total_sales || "0.00"}`} />
            <StatCard title="Net Sales" value={`₹${report?.net_sales || "0.00"}`} />
            <StatCard title="Orders Placed" value={report?.total_orders || 0} />
            <StatCard title="Items Purchased" value={report?.total_items || 0} />
          </div>

          <div className="mb-8 overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-8 font-display text-lg font-bold">Net Sales Over Time</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    itemStyle={{ color: "#0F172A", fontWeight: "bold" }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`₹${(Number(value) || 0).toFixed(2)}`, "Net Sales"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#C89B3C" 
                    strokeWidth={4} 
                    dot={{ r: 5, fill: "#C89B3C", strokeWidth: 0 }} 
                    activeDot={{ r: 8, fill: "#0F172A", stroke: "#C89B3C", strokeWidth: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-6 font-display text-lg font-bold">Top Products Sold</h2>
            {topSellers.length === 0 ? (
              <p className="text-sm text-charcoal/50">No top sellers data available for this period.</p>
            ) : (
              <div className="divide-y divide-charcoal/10">
                {topSellers.map((ts, idx) => (
                  <div key={ts.product_id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/5 text-sm font-bold text-navy">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-charcoal">{ts.name}</span>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold tracking-wide text-emerald-600">
                      {ts.quantity} SOLD
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
      <h3 className="text-sm font-medium tracking-wide text-charcoal/60 uppercase">{title}</h3>
      <p className="mt-3 font-display text-3xl font-black tracking-tight text-navy">{value}</p>
    </div>
  );
}
