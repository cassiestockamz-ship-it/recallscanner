import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "RecallScanner — Free Vehicle Recall Check by VIN",
    template: "%s | RecallScanner",
  },
  description:
    "Check if your car has any open safety recalls. Free VIN recall lookup powered by official NHTSA data. Search by make, model, or VIN number.",
  metadataBase: new URL("https://www.recallscanner.com"),
  openGraph: {
    type: "website",
    siteName: "RecallScanner",
    title: "RecallScanner — Free Vehicle Recall Check",
    description: "Check if your car has any open safety recalls. Free VIN lookup powered by NHTSA data.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
