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
      <body className="bg-paper text-ink antialiased min-h-screen flex flex-col">
        <header className="border-b border-line bg-white sticky top-0 z-40">
          <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-black text-lg tracking-tight text-accent">Panggung</Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="hover:text-accent">Events</Link>
              <Link href="/request" className="hover:text-accent">Request artist</Link>
              <Link href="/submit" className="rounded bg-accent text-white px-3 py-1.5 hover:opacity-90">Submit event</Link>
              <Link href="/login" className="text-muted hover:text-ink">Login</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted">
          Panggung MVP — demo build. Event data is DEMO seed data, not real events. Not a ticketing platform.
        </footer>
      </body>
    </html>
  );
}
