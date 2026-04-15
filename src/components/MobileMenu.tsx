"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Gauge,
  TrendingUp,
  BookOpen,
  FileText,
  ShieldCheck,
} from "lucide-react";

/**
 * Mobile navigation drawer. Renders a hamburger button in the header on
 * phones; opens a full-height sheet over the page with every nav link.
 * The desktop header keeps its inline nav and hides this component.
 *
 * Closes automatically on route change, on Escape, and on backdrop tap.
 * Locks body scroll while open.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape + lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const links = [
    { href: "/recalls", label: "Browse brands", desc: "32 manufacturers tracked", icon: Search },
    { href: "/most-recalled", label: "Latest recalls", desc: "Newest critical campaigns", icon: Gauge },
    { href: "/trends", label: "Recall trends", desc: "By year, brand, component", icon: TrendingUp },
    { href: "/guides", label: "Guides", desc: "Plain-English walkthroughs", icon: BookOpen },
    { href: "/blog", label: "Monthly reports", desc: "Auto-generated from NHTSA", icon: FileText },
  ];

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="sm:hidden inline-flex items-center justify-center w-9 h-9 -mr-1 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
      >
        <Menu size={20} strokeWidth={2.25} />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-up"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div
            className="absolute inset-x-0 top-0 bg-white border-b border-[var(--color-border)] shadow-[0_24px_48px_-24px_rgba(15,23,42,0.35)] animate-fade-up"
            style={{ animationDuration: "220ms" }}
          >
            {/* Header row matches the real site header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--color-border)]">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-bold text-[17px] text-slate-900"
              >
                <span className="w-7 h-7 grid place-items-center rounded-lg bg-[var(--color-brand)] text-white">
                  <ShieldCheck size={16} strokeWidth={2.5} />
                </span>
                RecallScanner
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex items-center justify-center w-9 h-9 -mr-1 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <X size={20} strokeWidth={2.25} />
              </button>
            </div>

            {/* Links */}
            <nav className="p-3 space-y-1">
              {links.map((l) => {
                const Icon = l.icon;
                const active = pathname === l.href || pathname?.startsWith(l.href + "/");
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                      active
                        ? "bg-[var(--color-surface)] text-[var(--color-brand)]"
                        : "hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-9 h-9 rounded-lg grid place-items-center border transition-colors ${
                        active
                          ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                          : "bg-white border-[var(--color-border)] text-slate-500 group-hover:text-[var(--color-brand)]"
                      }`}
                    >
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-[15px]">{l.label}</div>
                      <div className="text-[12px] text-slate-500">{l.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Primary CTA */}
            <div className="p-3 pt-0">
              <Link
                href="/vin"
                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[var(--color-brand)] text-white font-semibold text-[14px] py-3 hover:bg-[#1635a1] active:scale-[0.99] transition-all"
              >
                Check a VIN
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
