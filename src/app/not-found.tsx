import Link from "next/link";
import VinChecker from "@/components/VinChecker";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-slate-500 mb-8">
        The page you&apos;re looking for doesn&apos;t exist. Try checking your vehicle by VIN instead.
      </p>
      <div className="flex justify-center mb-8">
        <VinChecker />
      </div>
      <div className="flex justify-center gap-4">
        <Link href="/" className="text-brand hover:underline font-medium">
          Go Home
        </Link>
        <Link href="/recalls" className="text-brand hover:underline font-medium">
          Browse All Brands
        </Link>
      </div>
    </div>
  );
}
