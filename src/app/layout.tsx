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
  alternates: { canonical: "/" },
  other: {
    "fo-verify": "0de8eafd-ebbf-4e98-87b2-ce4df95195f7",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7557739369186741" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(new URLSearchParams(location.search).has('notrack')){localStorage.setItem('_no_track','1')}if(localStorage.getItem('_no_track')==='1')return;var s=sessionStorage.getItem('_sid');if(!s){s=Math.random().toString(36).slice(2)+Date.now().toString(36);sessionStorage.setItem('_sid',s)}var d=screen.width<768?'mobile':screen.width<1024?'tablet':'desktop';fetch('https://project-dash-psi.vercel.app/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id:'dea4c76d-7ba5-43a4-ab7e-16975ccc876f',path:location.pathname,referrer:document.referrer||null,device_type:d,session_id:s}),keepalive:true}).catch(function(){})}catch(e){}})();` }} />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-700 focus:rounded focus:shadow-lg">
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
