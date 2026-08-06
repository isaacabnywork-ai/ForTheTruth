import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const linkCls = (active: boolean) =>
    `flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition-smooth ${
      active
        ? "bg-gold-gradient text-white shadow-gold"
        : "border border-sand bg-white text-charcoal/70 shadow-card hover:border-gold hover:text-gold-dark"
    }`;

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={linkCls(false)} aria-label="Previous page">
          ←
        </Link>
      )}
      {start > 1 && (
        <>
          <Link href={href(1)} className={linkCls(false)}>1</Link>
          {start > 2 && <span className="px-1 text-charcoal/40">…</span>}
        </>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          className={linkCls(p === page)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Link>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-charcoal/40">…</span>}
          <Link href={href(totalPages)} className={linkCls(false)}>
            {totalPages}
          </Link>
        </>
      )}
      {page < totalPages && (
        <Link href={href(page + 1)} className={linkCls(false)} aria-label="Next page">
          →
        </Link>
      )}
    </nav>
  );
}
