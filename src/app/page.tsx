import Link from "next/link";
import { Suspense } from "react";
import { searchEvents, cities, genres } from "@/lib/queries";
import EventCard from "@/components/EventCard";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;
export default async function Home({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = sp.q || ""; const city = sp.city || ""; const genre = sp.genre || "";
  const type = sp.type || ""; const from = sp.from || ""; const to = sp.to || "";
  const events = searchEvents({ q, city, genre, type, from, to });
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-black tracking-tight">Live music di kotamu</h1>
        <p className="text-sm text-muted mt-1">Gig, konser, dan festival dari promoter &amp; Concert Scout. Browsing gratis, tanpa akun.</p>
      </section>

      <form method="get" className="grid grid-cols-2 gap-2 sm:grid-cols-6">
        <input name="q" defaultValue={q} placeholder="Cari event / artis…" className="input col-span-2 sm:col-span-2" />
        <select name="city" defaultValue={city} className="input">
          <option value="">Semua kota</option>
          {cities().map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select name="genre" defaultValue={genre} className="input">
          <option value="">Semua genre</option>
          {genres().map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>
        <select name="type" defaultValue={type} className="input">
          <option value="">Semua tipe</option>
          <option value="gig">Gig</option><option value="concert">Concert</option><option value="festival">Festival</option>
        </select>
        <div className="flex gap-2 col-span-2 sm:col-span-1">
          <input name="from" type="date" defaultValue={from} className="input" aria-label="Dari tanggal" />
          <button className="btn shrink-0">Cari</button>
        </div>
      </form>

      <Suspense fallback={null}>
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-white p-8 text-center">
            <p className="font-semibold">Belum ada event yang cocok</p>
            <p className="text-sm text-muted mt-1">Coba hapus filter, atau <Link href="/request" className="text-accent underline">request artisnya</Link> biar promoter lihat minatnya.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map(e => <li key={e.id}><EventCard e={e} /></li>)}
          </ul>
        )}
      </Suspense>
    </div>
  );
}
