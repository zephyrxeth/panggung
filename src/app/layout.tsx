import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SIDESTAGE — live music di kotamu", template: "%s · SIDESTAGE" },
  description: "Community-powered concert discovery for Indonesia. Find gigs, concerts and festivals by city, date and genre.",
};

const NAV = [
  { href: "/", label: "Home", icon: "◆" },
  { href: "/explore", label: "Jelajah", icon: "✦" },
  { href: "/request", label: "Request", icon: "♪" },
  { href: "/submit", label: "Submit", icon: "✚" },
];

export const viewport = { viewportFit: "cover" as const };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-paper text-ink antialiased min-h-screen flex flex-col">
        {/* floating glass header pill — logo centered */}
        <header className="fixed top-3 inset-x-0 z-50 px-4">
          <div className="mx-auto flex items-center justify-center max-w-[560px] h-12 rounded-[22px] glass-strong border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5)] px-3">
            <nav className="hidden sm:flex items-center gap-4 text-[13px] font-medium absolute left-4">
              <Link href="/explore" className="text-zinc-300 hover:text-red-300">Jelajah</Link>
              <Link href="/request" className="text-zinc-300 hover:text-red-300">Request</Link>
            </nav>
            <Link href="/" className="flex items-center" aria-label="SIDESTAGE — beranda">
              <img src="/brand/wordmark-red.png" alt="SIDESTAGE" className="h-7 w-auto" />
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-[13px] font-medium absolute right-4">
              <Link href="/submit" className="rounded-xl bg-red-500 text-white px-3 py-1.5 font-semibold hover:bg-red-400 transition-colors">Submit</Link>
              <Link href="/login" className="text-muted hover:text-red-300">Login</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 w-full pt-20 pb-6">{children}</main>

        {/* footer — 4 kolom ala referensi */}
        <footer className="border-t border-zinc-800 pt-12 pb-6 px-4 pb-24 sm:pb-6">
          <div className="max-w-[1200px] mx-auto grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <img src="/brand/wordmark-red.png" alt="SIDESTAGE" className="h-9 w-auto" />
              <p className="text-sm text-zinc-400 mt-4 max-w-[280px] leading-relaxed">Agenda live music komunitas — setiap listing punya sumber yang dicek manusia, bukan robot.</p>
            </div>
            <nav aria-label="Jelajah">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Jelajah</p>
              <ul className="space-y-3">
                <li><Link href="/explore" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Semua event</Link></li>
                <li><Link href="/?type=gig" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Gig</Link></li>
                <li><Link href="/?type=concert" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Konser</Link></li>
                <li><Link href="/?type=festival" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Festival</Link></li>
              </ul>
            </nav>
            <nav aria-label="Komunitas">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Komunitas</p>
              <ul className="space-y-3">
                <li><Link href="/request" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Request artis</Link></li>
                <li><Link href="/submit" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Submit event</Link></li>
                <li><Link href="/login" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-300 transition-colors">Masuk / Login</Link></li>
              </ul>
            </nav>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Kepercayaan</p>
              <ul className="space-y-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <li className="flex gap-2"><span className="text-red-400">✓</span> Sumber terverifikasi</li>
                <li className="flex gap-2"><span className="text-red-400">◉</span> Dimoderasi komunitas</li>
                <li className="flex gap-2"><span className="text-red-400">◎</span> Bukan platform tiket</li>
              </ul>
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto mt-10">
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">SIDESTAGE — gig, konser &amp; festival dengan sumber tercatat. Poster © masing-masing promotor; pembelian tiket tetap terjadi di situs resmi promotor.</p>
            <hr className="border-zinc-800 my-5" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">© 2026 SIDESTAGE. All rights reserved.</p>
          </div>
        </footer>

        {/* mobile floating dock nav */}
        <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="mx-auto max-w-[320px] grid grid-cols-4 rounded-[24px] glass-strong shadow-[0_12px_40px_rgba(0,0,0,0.55)] border border-white/15 py-2">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className="flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400 active:text-red-300">
                <span className="text-base leading-none text-red-400">{n.icon}</span>{n.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="sm:hidden h-20" />
      </body>
    </html>
  );
}
