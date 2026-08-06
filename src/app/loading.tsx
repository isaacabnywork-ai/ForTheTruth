export default function GlobalLoading() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer glowing book icon or spinner */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-navy border-r-gold shadow-lg" />
        <span className="absolute text-xl">📖</span>
      </div>
      <h3 className="font-display text-lg font-black tracking-tight text-navy">
        Opening Shelf &amp; Fetching Catalog...
      </h3>
      <p className="mt-1 text-xs font-semibold text-slate-400">
        Connecting to For The Truth theological registry...
      </p>

      {/* Quick visual skeleton placeholders */}
      <div className="mt-8 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xs">
            <div className="h-44 w-28 rounded-lg bg-slate-200/80 mb-4" />
            <div className="h-4 w-3/4 rounded-md bg-slate-200/80 mb-2" />
            <div className="h-3 w-1/2 rounded-md bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
