import type { Metadata } from "next";
import Link from "next/link";
import MobileDock from "@/components/MobileDock";
import HamburgerMenu from "@/components/HamburgerMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SIDESTAGE — live music di kotamu", template: "%s · SIDESTAGE" },
  description: "Community-powered concert discovery for Indonesia. Find gigs, concerts and festivals by city, date and genre.",
};

export const viewport = { viewportFit: "cover" as const };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-paper text-ink antialiased min-h-screen flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-xl focus:bg-red-500 focus:px-4 focus:py-2 focus:text-sm focus:font-bold">Langsung ke konten</a>
        {/* floating glass header pill — logo centered */}
        <header className="fixed top-3 inset-x-0 z-50 px-4">
          <div className="mx-auto flex items-center justify-center max-w-[560px] h-12 rounded-[22px] glass-strong border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5)] px-3">

            <Link href="/" className="flex items-center" aria-label="SIDESTAGE — beranda">
              <img src="/brand/wordmark-red.png" alt="SIDESTAGE" className="h-7 w-auto" />
            </Link>
            <div className="hidden sm:block absolute right-4">
              <HamburgerMenu direction="down" align="right" size="sm" />
            </div>
          </div>
        </header>
        <main id="main" className="flex-1 w-full pt-20 pb-6">{children}</main>

        {/* footer — 4 kolom ala referensi */}
        <footer className="border-t border-zinc-800 pt-12 pb-40 px-4 sm:pb-6">
          <div className="max-w-[1200px] mx-auto grid gap-10 sm:grid-cols-[1fr_auto_auto]">
            <div>
              <img src="/brand/wordmark-red.png" alt="SIDESTAGE" className="h-9 w-auto" />
              <p className="text-sm text-zinc-400 mt-4 max-w-[280px] leading-relaxed">Agenda live music komunitas — setiap listing punya sumber yang dicek manusia, bukan robot.</p>
            </div>
            <nav aria-label="Jelajah" className="sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Jelajah</p>
              <ul className="space-y-3">
                <li><Link href="/explore" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Semua event</Link></li>
                <li><Link href="/?type=gig" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Gig</Link></li>
                <li><Link href="/?type=concert" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Konser</Link></li>
                <li><Link href="/?type=festival" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Festival</Link></li>
              </ul>
            </nav>
            <nav aria-label="Komunitas" className="sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Komunitas</p>
              <ul className="space-y-3">
                <li><Link href="/request" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Request artis</Link></li>
                <li><Link href="/submit" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Submit event</Link></li>
                <li><Link href="/struk" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Make a List</Link></li>
                <li><Link href="/login" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Masuk / Login</Link></li>
              </ul>
            </nav>
          </div>
          <div className="max-w-[1200px] mx-auto mt-10">
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">SIDESTAGE — gig, konser &amp; festival dengan sumber tercatat. Poster © masing-masing promotor; pembelian tiket tetap terjadi di situs resmi promotor.</p>
            <hr className="border-zinc-800 my-5" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">© 2026 SIDESTAGE. All rights reserved.</p>
          </div>
        </footer>

        {/* mobile floating dock — hamburger menu */}
        <MobileDock />
        <div className="sm:hidden h-20" />
      </body>
    </html>
  );
}
