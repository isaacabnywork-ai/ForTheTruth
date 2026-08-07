"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface WCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<WCCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let url = `/api/admin/customers?page=${page}`;
        if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.customers) {
          setCustomers(data.customers);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page, debouncedSearch]);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Customers Directory</h1>
          <p className="text-sm text-charcoal/60">
            View and search through all {total > 0 ? total : ""} registered users.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-charcoal/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-shadow focus:border-gold-light focus:ring-1 focus:ring-gold-light shadow-sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-charcoal/80">
            <thead className="bg-navy/5 text-xs font-bold uppercase tracking-wider text-charcoal">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-charcoal/50">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold-light border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-charcoal/50">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-navy/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-charcoal/10">
                          {c.avatar_url ? (
                            <Image src={c.avatar_url} alt={c.first_name} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-navy">
                              {c.first_name?.charAt(0).toUpperCase() || c.email.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-navy">
                          {c.first_name || c.last_name ? `${c.first_name} ${c.last_name}` : "Unnamed"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{c.email}</td>
                    <td className="px-6 py-4 text-right text-charcoal/50 font-mono text-xs">#{c.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-charcoal/10 px-6 py-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-lg border border-charcoal/10 px-4 py-2 text-sm font-semibold text-navy hover:bg-navy/5 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-charcoal/60">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="rounded-lg border border-charcoal/10 px-4 py-2 text-sm font-semibold text-navy hover:bg-navy/5 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
