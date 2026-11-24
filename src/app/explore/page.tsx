import { Suspense } from "react";
import { searchEvents, cities, genres } from "@/lib/queries";
import EventCard from "@/components/EventCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore — Panggung" };

type SP = Promise<Record<string, string | undefined>>;

export default async function Explore({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = sp.q || "", city = sp.city || "", genre = sp.genre || "",
    type = sp.type || "", from = sp.from || "", to = sp.to || "";
  const events = searchEvents({ q, city, genre, type, from, to });

  return (
    <div className="space-y-5">
      <header className="pt-4">
        <h1 className="text-4xl font-black uppercase tracking-tight">
          Jelajah <span className="stroke-text">panggung</span>
        </h1>
        <p className="text-sm text-muted mt-1">{events.length} event live · semua listing punya sumber terverifikasi</p>
      </header>

      {/* sticky filter bar */}
      <form method="get" className="sticky top-14 z-20 glass-strong rounded-2xl p-2.5 flex flex-wrap gap-2 items-center">
        <input name="q" defaultValue={q} placeholder="Cari event / artis…" className="input !w-auto flex-1 min-w-[140px] !py-1.5 text-sm" />
        <select name="city" defaultValue={city} className="input !w-auto !py-1.5 text-sm">
          <option value="">Semua kota</option>
          {cities().map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select name="genre" defaultValue={genre} className="input !w-auto !py-1.5 text-sm">
          <option value="">Semua genre</option>
          {genres().map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>
        <select name="type" defaultValue={type} className="input !w-auto !py-1.5 text-sm">
          <option value="">Semua tipe</option>
          <option value="gig">Gig ♪</option>
          <option value="concert">Konser ◉</option>
          <option value="festival">Festival ✷</option>
        </select>
        <button className="btn !py-1.5 !px-4 text-sm">Filter</button>
        {(q || city || genre || type || from || to) && (
          <a href="/explore" className="text-xs text-red-300 underline shrink-0">reset</a>
        )}
      </form>

      <Suspense fallback={null}>
        {events.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="font-bold text-lg uppercase">Nihil hasil</p>
            <p className="text-sm text-muted mt-1">Filter terlalu ketat, atau eventnya belum ada di Panggung.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-6">
            {events.map(e => <li key={e.id}><EventCard e={e} /></li>)}
          </ul>
        )}
      </Suspense>
    </div>
  );
}
