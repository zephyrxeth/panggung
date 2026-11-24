import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Panggung — temukan live music di kotamu", template: "%s · Panggung" },
  description: "Community-powered concert discovery for Indonesia. Find gigs, concerts and festivals by city, date and genre.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-paper text-ink antialiased min-h-screen flex flex-col grain">
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-stone-950/85 backdrop-blur-md">
          <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-black text-lg tracking-tight text-red-400 flex items-center gap-1.5">
              <span aria-hidden>◆</span> Panggung
            </Link>
            <nav className="flex items-center gap-3 sm:gap-4 text-sm font-medium">
              <Link href="/" className="text-zinc-300 hover:text-red-300">Events</Link>
              <Link href="/request" className="text-zinc-300 hover:text-red-300">Request</Link>
              <Link href="/submit" className="rounded bg-red-400 text-stone-950 px-3 py-1.5 font-semibold hover:bg-red-300">Submit</Link>
              <Link href="/login" className="text-muted hover:text-red-300">Login</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">{children}</main>
        <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
          Panggung MVP — demo build. Semua event di halaman ini adalah data <b>[DEMO]</b>, bukan event sungguhan. Bukan platform tiket.
        </footer>
      </body>
    </html>
  );
}
