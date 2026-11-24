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
      <section className="relative overflow-hidden">
        <div className="min-h-[78vh] flex flex-col justify-center relative">
          <StageBeams />
          <div className="relative z-10 mx-auto max-w-3xl px-4 pt-28 pb-20 text-center">
            <p className="text-[11px] uppercase tracking-[0.4em] text-red-400/80 font-bold">● now showing — all cities</p>
            <h1 className="mt-5 font-black tracking-tighter leading-[0.85]">
              <span className="block text-[15vw] sm:text-8xl uppercase">
                <span className="stroke-text">Live</span>{" "}
                <span className="text-zinc-100">music</span>
              </span>
              <span className="block text-[11vw] sm:text-7xl uppercase mt-1">
                <span className="shine">di kotamu</span>
              </span>
            </h1>
            <p className="mt-6 text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
              Gig, konser, festival — ditemukan bareng komunitas, bukan robot.
            </p>
            <form method="get" className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input name="q" defaultValue={q} placeholder="Artis, venue, event…" className="input sm:flex-1 !bg-stone-950/70 !border-zinc-700 backdrop-blur-sm" />
              <button className="btn shrink-0">Cari gig ✦</button>
            </form>
            <p className="mt-3 text-[11px] text-zinc-500">
              Browsing gratis tanpa akun ·{" "}
              <a href="#lineup" className="text-red-400/90 underline decoration-red-400/30 underline-offset-2">lihat lineup di bawah</a>
            </p>
          </div>
        </div>

        {/* diagonal red ticker */}
        <div className="relative z-10 rotate-[-1.2deg] scale-105 rounded-xl py-2.5 glass-strong shadow-[0_8px_32px_rgba(239,68,68,0.25)] border border-red-500/40">
          <Marquee duration="30s">
            {Array.from({ length: 6 }).flatMap((_, i) => (
              <span key={i} className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-100 whitespace-nowrap">
                Submit event &nbsp;◆&nbsp; Request artis &nbsp;◆&nbsp; Demand signal &nbsp;◆&nbsp;
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ── lineup marquee ── */}
      <div className="border-b border-zinc-800 bg-stone-950 py-4" id="lineup">
        <Marquee duration="45s">
          {["★", ...events.map(e => (e.artists || e.title.replace("[DEMO]", "").trim()).toUpperCase())].flatMap((label, i) => (
            <span key={i} className="text-base sm:text-lg font-extrabold whitespace-nowrap">
              <span className={label === "★" ? "text-red-500" : "text-zinc-600 hover:text-red-300 transition-colors"}>{label}</span>
              <span className="mx-4 text-red-600/60">✕</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── listing ── */}
      <div className="px-4 py-8 space-y-5">
        <h2 className="text-3xl font-black uppercase tracking-tight">
          Agenda <span className="stroke-text">live</span>
        </h2>
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
              <p className="font-bold text-lg uppercase">Panggungnya sepi</p>
              <p className="text-sm text-muted mt-1">Coba hapus filter, atau <Link href="/request" className="text-red-400 underline">request artisnya</Link> biar promoter lihat minatnya.</p>
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
