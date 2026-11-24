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
  const chips = [
    { label: "Semua", v: "", icon: "★" },
    { label: "Gig", v: "gig", icon: "♪" },
    { label: "Konser", v: "concert", icon: "◉" },
    { label: "Festival", v: "festival", icon: "✷" },
  ];

  return (
    <div className="-mx-4 -mt-6">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="min-h-[70vh] flex flex-col justify-center relative">
          <StageBeams />
          <div className="relative z-10 mx-auto max-w-3xl px-4 pt-28 pb-16 text-center">
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
            <form method="get" className="mt-8 max-w-lg mx-auto glass rounded-2xl p-2 flex gap-2">
              <input name="q" defaultValue={q} placeholder="Acara apa yang lu cari?" className="input !border-0 !bg-transparent flex-1" />
              <button className="btn shrink-0">Cari ✦</button>
            </form>
            <div className="mt-4 flex justify-center gap-2 flex-wrap">
              {chips.map(c => (
                <Link key={c.v} href={c.v ? `/?type=${c.v}` : "/"} className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${type === c.v ? "bg-red-500 text-white" : "glass text-zinc-300 hover:border-red-400/50"}`}>
                  {c.icon} {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* diagonal glass ticker — promoter logos */}
        <div className="relative z-10 rotate-[-1.2deg] scale-105 rounded-xl py-3 glass-strong shadow-[0_8px_32px_rgba(239,68,68,0.25)] border border-red-500/40">
          <Marquee duration="60s">
            {[0, 1].map(rep => (
              <span key={rep} className="flex items-center gap-10 whitespace-nowrap pr-10" aria-hidden={rep === 1}>
                {[["/logos/dwp.png", "Djakarta Warehouse Project"], ["/logos/ismayalive.svg", "Ismaya Live"],
                  ["/logos/prambananjazz.png", "Prambanan Jazz Festival"], ["/logos/jfp.png", "Java Festival Production"],
                  ["/logos/pestapora.svg", "Pestapora"], ["/logos/soundrenaline.png", "Soundrenaline"]].map(([src, name], i) => (
                  <span key={i} className="flex items-center gap-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={name} title={name} className="h-5 sm:h-6 w-auto object-contain opacity-80" loading="lazy" />
                    <span className="text-red-500/50 text-xs">◆</span>
                  </span>
                ))}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ── lineup marquee ── */}
      <div className="border-b border-zinc-800 bg-stone-950 py-4" id="lineup">
        <Marquee duration="80s">
          {["★", ...events.map(e => (e.artists || e.title.replace("[DEMO]", "").trim()).toUpperCase())].flatMap((label, i) => (
            <span key={i} className="text-base sm:text-lg font-extrabold whitespace-nowrap">
              <span className={label === "★" ? "text-red-500" : "text-zinc-600 hover:text-red-300 transition-colors"}>{label}</span>
              <span className="mx-4 text-red-600/60">✕</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── listing: poster grid ── */}
      <div className="px-4 py-8 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-3xl font-black uppercase tracking-tight">
            Agenda <span className="stroke-text">live</span>
          </h2>
          <form method="get" className="flex gap-2 flex-wrap">
            <select name="city" defaultValue={city} className="input !w-auto text-xs py-1.5">
              <option value="">Semua kota</option>
              {cities().map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select name="genre" defaultValue={genre} className="input !w-auto text-xs py-1.5">
              <option value="">Semua genre</option>
              {genres().map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
            {from && <input type="hidden" name="from" value={from} />}
            {type && <input type="hidden" name="type" value={type} />}
          </form>
        </div>

        <Suspense fallback={null}>
          {events.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="font-bold text-lg uppercase">Panggungnya sepi</p>
              <p className="text-sm text-muted mt-1">Coba hapus filter, atau <Link href="/request" className="text-red-400 underline">request artisnya</Link> biar promoter lihat minatnya.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {events.map(e => <li key={e.id}><EventCard e={e} /></li>)}
            </ul>
          )}
        </Suspense>
      </div>
    </div>
  );
}
