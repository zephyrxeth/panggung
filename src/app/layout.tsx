import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SIDESTAGE — live music di kotamu", template: "%s · SIDESTAGE" },
  description: "Community-powered concert discovery for Indonesia. Find gigs, concerts and festivals by city, date and genre.",
  icons: { icon: "/brand/logo-red.png" },
};

const NAV = [
  { href: "/", label: "Index", icon: "01" },
  { href: "/explore", label: "Jelajah", icon: "02" },
  { href: "/request", label: "Request", icon: "03" },
  { href: "/submit", label: "Submit", icon: "04" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-paper text-ink antialiased min-h-screen flex flex-col">
        {/* floating header — brutalist plate, logo centered */}
        <header className="fixed top-3 inset-x-0 z-50 px-4">
          <div className="mx-auto flex items-center justify-center max-w-[560px] h-12 border-2 border-line bg-paper/95 shadow-[4px_4px_0_#A11A17] px-3">
            <nav className="hidden sm:flex items-center gap-4 text-[13px] font-bold uppercase tracking-wide absolute left-4">
              <Link href="/explore" className="text-zinc-300 hover:text-accent">Jelajah</Link>
              <Link href="/request" className="text-zinc-300 hover:text-accent">Request</Link>
            </nav>
            <Link href="/" className="font-black text-base sm:text-lg tracking-tight text-ink flex items-center gap-2 uppercase">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-red.png" alt="Logo Sidestage" className="h-6 w-auto" />
              <span>SIDESTAGE</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-[13px] font-bold uppercase tracking-wide absolute right-4">
              <Link href="/submit" className="bg-accent text-ink px-3 py-1.5 font-extrabold hover:shadow-[3px_3px_0_#D2CEC7] transition-shadow">Submit</Link>
              <Link href="/login" className="text-muted hover:text-accent">Login</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 pt-20 pb-6">{children}</main>

        {/* trust footer */}
        <footer className="rule py-8 px-4 pb-24 sm:pb-8 text-xs text-muted space-y-2">
          <div className="mx-auto max-w-3xl flex flex-wrap gap-x-5 gap-y-1.5 font-extrabold uppercase tracking-wide text-zinc-400">
            <span>✓ sumber terverifikasi</span>
            <span>✓ dimoderasi komunitas</span>
            <span>✓ bukan platform tiket</span>
          </div>
          <p className="max-w-3xl mx-auto">SIDESTAGE MVP. Event berprefix <b>[DEMO]</b> adalah data seed, sisanya event nyata dengan sumber tercatat — pembelian tiket tetap terjadi di situs resmi promotor.</p>
        </footer>

        {/* mobile floating dock */}
        <nav className="sm:hidden fixed bottom-3 inset-x-0 z-40 px-4">
          <div className="mx-auto max-w-[320px] grid grid-cols-4 border-2 border-line bg-paper/95 shadow-[4px_4px_0_#A11A17] py-2">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className="flex flex-col items-center gap-0.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-zinc-400 active:text-accent">
                <span className="text-[9px] text-accent leading-none">{n.icon}</span>{n.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="sm:hidden h-20" />
      </body>
    </html>
  );
}
