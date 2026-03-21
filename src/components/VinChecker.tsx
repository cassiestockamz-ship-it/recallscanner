"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VinChecker() {
  const [vin, setVin] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = vin.trim().toUpperCase();
    if (cleaned.length !== 17) {
      setError("VIN must be exactly 17 characters");
      return;
    }
    if (/[IOQ]/.test(cleaned)) {
      setError("VINs cannot contain I, O, or Q");
      return;
    }
    setError("");
    router.push(`/vin/${cleaned}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl" id="vin-checker">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={vin}
          onChange={(e) => {
            setVin(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="Enter your 17-digit VIN"
          maxLength={17}
          className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg cursor-pointer"
        >
          Check Recalls
        </button>
      </div>
      {error && <p className="mt-2 text-danger text-sm">{error}</p>}
      <p className="mt-2 text-xs text-slate-400">
        Your VIN is on your registration, insurance card, or driver&apos;s side dashboard.
      </p>
    </form>
  );
}
