export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8 animate-pulse">
        <div>
          <div className="h-8 w-72 rounded-2xl bg-slate-300 mb-2" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-44 rounded-2xl bg-slate-300" />
          <div className="h-12 w-32 rounded-2xl bg-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm" />
        ))}
      </div>

      <div className="h-96 w-full rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm animate-pulse flex flex-col justify-center items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-navy mb-4" />
        <p className="font-display text-xs font-black tracking-wider text-slate-500 uppercase">
          Synchronizing Live Ledger &amp; POS Registers...
        </p>
      </div>
    </div>
  );
}
