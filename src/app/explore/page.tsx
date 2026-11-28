import { Suspense } from "react";
import { searchEvents, cities, genres } from "@/lib/queries";
import EventCard from "@/components/EventCard";
import FilterForm from "@/components/FilterForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore — SIDESTAGE" };

type SP = Promise<Record<string, string | undefined>>;

export default async function Explore({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = sp.q || "", city = sp.city || "", genre = sp.genre || "",
    type = sp.type || "", from = sp.from || "", to = sp.to || "",
    sort = (sp.sort || "soonest") as "soonest" | "latest" | "newest";
  const events = searchEvents({ q, city, genre, type, from, to, sort });

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto px-4">
      <header className="pt-4">
        <h1 className="text-4xl font-black uppercase tracking-tight">
          Jelajah <span className="stroke-text">sidestage</span>
        </h1>
        <p className="text-sm text-muted mt-1">{events.length} event live · semua listing punya sumber terverifikasi</p>
      </header>

      {/* sticky filter bar */}
      <FilterForm className="sticky top-16 z-20 glass-strong rounded-2xl p-2.5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <input name="q" defaultValue={q} placeholder="Cari event / artis…" aria-label="Cari event atau artis" className="input col-span-2 !py-1.5 text-sm sm:flex-1 sm:min-w-[140px]" />
        <select name="city" defaultValue={city} aria-label="Filter kota" className="input !py-1.5 text-sm">
          <option value="">Semua kota</option>
          {cities().map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select name="genre" defaultValue={genre} aria-label="Filter genre" className="input !py-1.5 text-sm">
          <option value="">Semua genre</option>
          {genres().map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>
        <select name="type" defaultValue={type} aria-label="Filter tipe" className="input !py-1.5 text-sm">
          <option value="">Semua tipe</option>
          <option value="gig">Gig ♪</option>
          <option value="concert">Konser ◉</option>
          <option value="festival">Festival ✷</option>
        </select>
        <select name="sort" defaultValue={sort || "soonest"} aria-label="Urutkan" className="input !py-1.5 text-sm">
          <option value="soonest">Terdekat dulu</option>
          <option value="latest">Paling akhir</option>
          <option value="newest">Baru ditambahkan</option>
        </select>
        <button className="btn col-span-2 !py-1.5 text-sm sm:col-span-1 sm:!px-4">SET</button>
        {(q || city || genre || type || from || to) && (
          <a href="/explore" className="btn col-span-2 !py-1.5 text-sm sm:col-span-1 sm:!px-4 text-center bg-transparent border border-white/25 text-zinc-200">Reset</a>
        )}
      </FilterForm>

      <Suspense fallback={null}>
        {events.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="font-bold text-lg uppercase">Nihil hasil</p>
            <p className="text-sm text-muted mt-1">Filter terlalu ketat, atau eventnya belum ada di SIDESTAGE.</p>
            <a href="/request" className="btn mt-4 inline-block">Request event ini</a>
          </div>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pb-6">
            {events.map((e, i) => (
              <li key={e.id} data-reveal style={{ "--reveal-delay": `${(i % 5) * 60}ms` } as React.CSSProperties}>
                <EventCard e={e} />
              </li>
            ))}
          </ul>
        )}
      </Suspense>
    </div>
  );
}
