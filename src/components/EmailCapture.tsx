"use client";

import { useState } from "react";

interface VehicleAlert {
  make: string;
  model: string;
  year?: number | string | null;
  vin?: string;
}

interface Props {
  vehicleName?: string;
  variant?: "inline" | "banner";
  // When set, the form is a per-vehicle recall alert signup and sends the vehicle with the email.
  alertFor?: VehicleAlert;
}

export default function EmailCapture({ vehicleName, variant = "inline", alertFor }: Props) {
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
        body: JSON.stringify({
          email,
          vehicle: alertFor ? [alertFor.year, alertFor.make, alertFor.model].filter(Boolean).join(" ") : vehicleName,
          ...(alertFor ? { make: alertFor.make, model: alertFor.model, year: alertFor.year, vin: alertFor.vin } : {}),
        }),
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

  if (status === "success" && alertFor) {
    return (
      <div className="rounded-lg p-4 bg-safe-light">
        <p className="text-safe font-medium text-sm">You&apos;re on the list for the {alertFor.make} {alertFor.model}. We&apos;ll email you if NHTSA issues a new recall for it.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={`rounded-lg p-4 ${variant === "banner" ? "bg-safe-light border border-green-200" : "bg-safe-light"}`}>
        <p className="text-safe font-medium text-sm">You&apos;re on the list. We&apos;ll email you once when vehicle recall alerts open, so you can pick your vehicle.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg ${variant === "banner" ? "bg-blue-50 border border-blue-100 p-6" : "bg-surface p-4"}`}>
      <div className="mb-2">
        <h3 className="font-semibold text-sm text-slate-800">
          {alertFor ? "Email me if NHTSA issues a new recall for this vehicle" : "Email me when vehicle recall alerts open"}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {alertFor
            ? `We save your email and this vehicle${alertFor.vin ? ", including its VIN," : ""} only to send this alert. No sharing, unsubscribe in one click. For urgent safety concerns, check your VIN directly or contact NHTSA.`
            : "Recall alerts by vehicle are coming. We\u2019ll send one email when they open so you can pick your vehicle, nothing else. No sharing, unsubscribe in one click. For urgent safety concerns, check your VIN directly or contact NHTSA."}
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
      <p className="text-[11px] text-slate-400 mt-2">
        By subscribing you agree to our <a href="/privacy" className="hover:text-brand underline">privacy policy</a>. We do not share, sell, or resell email addresses.
      </p>
    </div>
  );
}
