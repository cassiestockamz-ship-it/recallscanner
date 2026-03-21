export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="h-4 w-48 bg-slate-100 rounded mb-6 animate-pulse" />
      <div className="h-8 w-72 bg-slate-100 rounded mb-2 animate-pulse" />
      <div className="h-4 w-80 bg-slate-100 rounded mb-8 animate-pulse" />
      <div className="bg-blue-50 rounded-lg p-6 mb-10">
        <div className="h-6 w-56 bg-blue-100 rounded mb-3 animate-pulse" />
        <div className="h-12 w-full max-w-xl bg-blue-100 rounded animate-pulse" />
      </div>
      <div className="h-6 w-48 bg-slate-100 rounded mb-3 animate-pulse" />
      <div className="flex flex-wrap gap-2 mb-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 w-20 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-6 w-32 bg-slate-100 rounded mb-4 animate-pulse" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-lg p-5 mb-4">
          <div className="h-4 w-48 bg-slate-100 rounded mb-2 animate-pulse" />
          <div className="h-3 w-full bg-slate-50 rounded mb-1 animate-pulse" />
          <div className="h-3 w-3/4 bg-slate-50 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
