export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="h-4 w-24 bg-slate-100 rounded mb-6 animate-pulse" />
      <div className="h-8 w-56 bg-slate-100 rounded mb-2 animate-pulse" />
      <div className="h-5 w-48 bg-slate-100 rounded mb-6 animate-pulse" />
      <div className="bg-white border border-border rounded-lg p-5 mb-6">
        <div className="h-6 w-40 bg-slate-100 rounded mb-3 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-3 w-12 bg-slate-50 rounded mb-1 animate-pulse" />
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-20 bg-slate-100 rounded-lg mb-8 animate-pulse" />
    </div>
  );
}
