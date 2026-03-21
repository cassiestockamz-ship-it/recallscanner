"use client";

import { useState } from "react";

interface Props {
  vehicleName?: string;
  variant?: "inline" | "banner";
}

export default function EmailCapture({ vehicleName, variant = "inline" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, vehicle: vehicleName }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={`rounded-lg p-4 ${variant === "banner" ? "bg-safe-light border border-green-200" : "bg-safe-light"}`}>
        <p className="text-safe font-medium text-sm">You&apos;re subscribed! We&apos;ll notify you of new recalls.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg ${variant === "banner" ? "bg-blue-50 border border-blue-100 p-6" : "bg-surface p-4"}`}>
      <div className="mb-2">
        <h3 className="font-semibold text-sm text-slate-800">
          {vehicleName
            ? `Get alerts for ${vehicleName} recalls`
            : "Get recall alerts for your vehicle"}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          We&apos;ll email you when a new recall is issued. No spam, unsubscribe anytime.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-danger text-xs mt-1">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
