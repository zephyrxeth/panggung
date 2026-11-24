import Link from "next/link";
import { Suspense } from "react";
import { searchEvents, cities, genres } from "@/lib/queries";
import EventCard from "@/components/EventCard";
import Marquee from "@/components/Marquee";

export const dynamic = "force-dynamic";

const PROMOTERS = [
  { name: "Djakarta Warehouse Project", logo: "/logos/dwp.png", url: "https://www.djakartawarehouseproject.com", tagline: "Festival EDM terbesar Jakarta" },
  { name: "Ismaya Live", logo: "/logos/ismayalive.svg", url: "https://www.ismayalive.com", tagline: "We The Fest, DWP" },
  { name: "Prambanan Jazz Festival", logo: "/logos/prambananjazz.png", url: "https://www.prambananjazz.com", tagline: "Jazz dengan latar candi, Yogyakarta" },
  { name: "Java Festival Production", logo: "/logos/jfp.png", url: "https://javafestivalproduction.com", tagline: "Joyland Festival & lainnya" },
  { name: "Pestapora", logo: "/logos/pestapora.svg", url: "https://pestapora.com", tagline: "Festival musik independen" },
  { name: "Soundrenaline", logo: "/logos/soundrenaline.png", url: "https://www.soundrenaline.id", tagline: "Festival musik alternatif" },
];

type SP = Promise<Record<string, string | undefined>>;

export default async function Home({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = sp.q || ""; const city = sp.city || ""; const genre = sp.genre || "";
  const type = sp.type || ""; const from = sp.from || ""; const to = sp.to || "";
  const events = searchEvents({ q, city, genre, type, from, to });
  const chips = [
    { label: "Semua", v: "" },
    { label: "Gig", v: "gig" },
    { label: "Konser", v: "concert" },
    { label: "Festival", v: "festival" },
  ];

  return (
    <div className="-mx-4 -mt-6">
      {/* ── HERO: brutalist poster plate ── */}
      <section className="relative overflow-hidden border-b-2 border-line">
        <div className="wash">
          <div className="relative z-10 mx-auto max-w-3xl px-4 pt-24 pb-14">
            {/* masthead strip */}
            <div className="flex items-center justify-between border-2 border-line bg-paper px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.3em] text-muted">
              <span className="text-accent">● now showing</span>
              <span>all cities</span>
              <span>est. 2026</span>
            </div>

            <h1 className="mt-6 font-black tracking-tighter leading-[0.82] uppercase">
              <span className="block text-[15vw] sm:text-8xl text-ink">[SIDE</span>
              <span className="block text-[15vw] sm:text-8xl"><span className="stroke-red">STAGE]</span></span>
              <span className="block text-[9vw] sm:text-5xl mt-3"><span className="shine">live music di kotamu</span></span>
            </h1>

            <p className="mt-5 text-sm sm:text-base text-muted max-w-md leading-relaxed">
              Gig, konser, festival — ditemukan bareng komunitas, bukan robot.
            </p>

            <form method="get" className="mt-7 max-w-lg border-2 border-line bg-paper flex">
              <input name="q" defaultValue={q} placeholder="Acara apa yang lu cari?" className="input !border-0 flex-1" />
              <button className="btn shrink-0 !border-0 border-l-2 !border-line">Cari →</button>
            </form>

            <div className="mt-5 flex flex-wrap gap-0">
              {chips.map(c => (
                <Link key={c.v} href={c.v ? `/?type=${c.v}` : "/"}
                  className={`border-2 border-line px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide -ml-[2px] first:ml-0 transition-colors ${type === c.v ? "bg-accent text-ink border-accent" : "text-zinc-300 hover:border-accent hover:text-accent"}`}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* diagonal logo ticker */}
          <div className="relative z-10 rotate-[-1.2deg] scale-105 border-y-2 border-line bg-paper/90 py-3 shadow-[0_10px_30px_rgba(161,26,23,0.25)]">
            <Marquee duration="60s">
              {[0, 1].map(rep => (
                <span key={rep} className="flex items-center gap-10 whitespace-nowrap pr-10" aria-hidden={rep === 1}>
                  {PROMOTERS.map((p, i) => (
                    <span key={i} className="flex items-center gap-10">
                      <a href={p.url} target="_blank" rel="noopener noreferrer" title={`Buka situs ${p.name}`} aria-label={p.name}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.logo} alt={p.name} className="h-5 sm:h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" loading="lazy" />
                      </a>
                      <span className="text-accent text-xs">◆</span>
                    </span>
                  ))}
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      </section>

      {/* ── lineup marquee ── */}
      <div className="border-b-2 border-line bg-surface py-4" id="lineup">
        <Marquee duration="80s">
          {["★", ...events.map(e => (e.artists || e.title.replace("[DEMO]", "").trim()).toUpperCase())].flatMap((label, i) => (
            <span key={i} className="text-base sm:text-lg font-extrabold whitespace-nowrap uppercase">
              <span className={label === "★" ? "text-accent" : "text-muted hover:text-accent transition-colors"}>{label}</span>
              <span className="mx-4 text-eclipse">✕</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── listing: poster grid ── */}
      <div className="px-4 py-8 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b-2 border-line pb-3">
          <h2 className="text-3xl font-black uppercase tracking-tight">Agenda <span className="text-accent">live</span></h2>
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
            <div className="card p-8 text-center">
              <p className="font-extrabold text-lg uppercase">Panggungnya sepi</p>
              <p className="text-sm text-muted mt-1">Coba hapus filter, atau <Link href="/request" className="text-accent underline">request artisnya</Link> biar promoter lihat minatnya.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {events.map(e => <li key={e.id}><EventCard e={e} /></li>)}
            </ul>
          )}
        </Suspense>
      </div>

      {/* ── promoter directory ── */}
      <div className="px-4 py-10" id="promoters">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-1 border-b-2 border-accent inline-block pb-1">Promoter &amp; festival</h2>
        <p className="text-sm text-muted mt-3 mb-5">Organisasi di balik panggung-panggung besar Indonesia — klik buka situs resmi mereka untuk tiket & info langsung.</p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PROMOTERS.map(p => (
            <li key={p.name}>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="card flex flex-col items-center text-center gap-2 py-5 px-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.logo} alt={`Logo ${p.name}`} className="h-8 sm:h-10 w-auto max-w-[140px] object-contain opacity-90" loading="lazy" />
                <span className="text-xs font-extrabold uppercase tracking-wide text-ink">{p.name}</span>
                <span className="text-[11px] text-muted leading-snug">{p.tagline}</span>
                <span className="text-[11px] font-extrabold text-accent mt-auto uppercase">Situs resmi ↗</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted mt-3">Logo © masing-masing promotor — ditampilkan untuk atribusi & navigasi, bukan endorsement.</p>
      </div>
    </div>
  );
}
