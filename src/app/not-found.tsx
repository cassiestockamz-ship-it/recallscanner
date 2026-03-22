import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-5xl font-bold text-brand mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-slate-800 mb-3">Page Not Found</h2>
      <p className="text-slate-500 mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <nav className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="px-5 py-2.5 bg-brand text-white font-medium rounded-lg hover:bg-brand-light transition-colors"
        >
          Homepage
        </Link>
        <Link
          href="/vin"
          className="px-5 py-2.5 bg-white text-brand border border-brand font-medium rounded-lg hover:bg-blue-50 transition-colors"
        >
          VIN Check
        </Link>
        <Link
          href="/recalls"
          className="px-5 py-2.5 bg-white text-brand border border-brand font-medium rounded-lg hover:bg-blue-50 transition-colors"
        >
          All Brands
        </Link>
        <Link
          href="/most-recalled"
          className="px-5 py-2.5 bg-white text-brand border border-brand font-medium rounded-lg hover:bg-blue-50 transition-colors"
        >
          Most Recalled
        </Link>
      </nav>
    </div>
  );
}
