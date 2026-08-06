export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 animate-pulse">
        {/* Book Physical Mockup Placeholder */}
        <div className="md:col-span-5 flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-slate-100/60 p-8 min-h-[460px]">
          <div className="h-80 w-56 rounded-2xl bg-slate-300 shadow-2xl" />
        </div>

        {/* Title, Author & Buy Options Skeleton */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-24 rounded-full bg-slate-200" />
              <div className="h-6 w-20 rounded-full bg-slate-200" />
            </div>
            <div className="h-10 w-4/5 rounded-2xl bg-slate-300" />
            <div className="h-5 w-1/2 rounded-xl bg-slate-200" />
            
            <div className="h-8 w-32 rounded-xl bg-slate-300 pt-2" />
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200/60">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-4/5 rounded bg-slate-200" />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="h-14 flex-1 rounded-2xl bg-slate-300 shadow-sm" />
            <div className="h-14 w-14 rounded-2xl bg-slate-200 shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
