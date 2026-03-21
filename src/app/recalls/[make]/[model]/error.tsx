"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-slate-500 mb-6">
        We couldn&apos;t load the recall data. The NHTSA API may be temporarily unavailable.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
