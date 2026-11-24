import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Panggung — temukan live music di kotamu", template: "%s · Panggung" },
  description: "Community-powered concert discovery for Indonesia. Find gigs, concerts and festivals by city, date and genre.",
};

const NAV = [
  { href: "/", label: "Home", icon: "◆" },
  { href: "/explore", label: "Jelajah", icon: "✦" },
  { href: "/request", label: "Request", icon: "♪" },
  { href: "/submit", label: "Submit", icon: "✚" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-paper text-ink antialiased min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-stone-950/85 backdrop-blur-md">
          <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-black text-base sm:text-lg tracking-tight text-red-400 flex items-center gap-1.5 mr-auto">
              <span aria-hidden>◆</span> Panggung
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <Link href="/explore" className="text-zinc-300 hover:text-red-300">Jelajah</Link>
              <Link href="/request" className="text-zinc-300 hover:text-red-300">Request</Link>
              <Link href="/submit" className="rounded-xl bg-red-500 text-white px-4 py-1.5 font-semibold hover:bg-red-400 transition-colors">Submit</Link>
              <Link href="/login" className="text-muted hover:text-red-300">Login</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">{children}</main>

        {/* trust footer */}
        <footer className="border-t border-zinc-800 py-8 px-4 text-xs text-zinc-500 space-y-2">
          <div className="mx-auto max-w-3xl flex flex-wrap gap-x-5 gap-y-1.5 font-semibold uppercase tracking-wide text-zinc-400">
            <span>✓ sumber terverifikasi</span>
            <span>✓ dimoderasi komunitas</span>
            <span>✓ bukan platform tiket</span>
          </div>
          <p className="max-w-3xl mx-auto">Panggung MVP. Event dengan prefix <b>[DEMO]</b> adalah data seed, sisanya event nyata dengan sumber tercatat — pembelian tiket tetap terjadi di situs resmi promotor.</p>
        </footer>

        {/* mobile floating dock nav — iOS glass */}
        <nav className="sm:hidden fixed bottom-3 inset-x-0 z-40 px-4">
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
