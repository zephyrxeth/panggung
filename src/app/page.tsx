import Link from "next/link";
import { Suspense } from "react";
import { searchEvents, cities, genres } from "@/lib/queries";
import EventCard from "@/components/EventCard";
import StageBeams from "@/components/StageBeams";
import Marquee from "@/components/Marquee";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function Home({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = sp.q || ""; const city = sp.city || ""; const genre = sp.genre || "";
  const type = sp.type || ""; const from = sp.from || ""; const to = sp.to || "";
  const events = searchEvents({ q, city, genre, type, from, to });

  return (
    <div className="-mx-4 -mt-6">
      {/* ── HERO: the stage ── */}
      <section className="relative -mt-14 overflow-hidden">
        <div className="min-h-[68vh] sm:min-h-[72vh] flex flex-col justify-center relative">
          <StageBeams />
          <div className="relative z-10 mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-400/80 font-semibold">community-powered live music</p>
            <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tighter leading-[0.95]">
              <span className="shine">Live music</span>
              <br />
              <span className="text-zinc-100">di kotamu</span>
            </h1>
            <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
              Gig, konser, festival — ditemukan bareng komunitas, bukan robot. Masukin nama artis yang lu pengen lihat; biar promoternya dengar.
            </p>
            <form method="get" className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input name="q" defaultValue={q} placeholder="Artis, venue, event…" className="input sm:flex-1 !bg-stone-950/60 !border-zinc-700 backdrop-blur-sm" />
              <button className="btn shrink-0">Cari gig ✦</button>
            </form>
            <p className="mt-3 text-[11px] text-zinc-500">
              Browsing gratis tanpa akun ·{" "}
              <a href="#lineup" className="text-amber-400/90 underline decoration-amber-400/30 underline-offset-2">lihat lineup di bawah</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── artist marquee strip ── */}
      <div className="border-y border-zinc-800 bg-stone-950/80 py-3" id="lineup">
        <Marquee duration="30s">
          {["★", ...events.map(e => e.artists || e.title.replace("[DEMO]", "").trim())].flatMap((label, i) => (
            <span key={i} className="text-sm text-zinc-400 whitespace-nowrap">
              <span className={label === "🔥" ? "" : "hover:text-amber-300 transition-colors"}>{label}</span>
              <span className="mx-3 text-amber-400/50">◆</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── search + listing ── */}
      <div className="px-4 py-8 space-y-5">
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
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-8 text-center">
              <p className="text-2xl mb-2">✦</p>
              <p className="font-semibold">Belum ada event yang cocok</p>
              <p className="text-sm text-muted mt-1">Coba hapus filter, atau <Link href="/request" className="text-amber-400 underline">request artisnya</Link> biar promoter lihat minatnya.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {events.map(e => <li key={e.id}><EventCard e={e} /></li>)}
            </ul>
          )}
        </Suspense>
      </div>
    </div>
  );
}
