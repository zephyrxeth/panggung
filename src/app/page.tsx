import Link from "next/link";
import { Suspense } from "react";
import { searchEvents, cities, genres, siteStats, upcomingEvents, topDemandEvent } from "@/lib/queries";
import FilterForm from "@/components/FilterForm";
import EventCard from "@/components/EventCard";
import Marquee from "@/components/Marquee";
import StageBeams from "@/components/StageBeams";

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
  const stats = siteStats();
  const upcoming = upcomingEvents(5);
  const demand = topDemandEvent();
  const chips = [
    { label: "Semua", v: "", icon: "★" },
    { label: "Gig", v: "gig", icon: "♪" },
    { label: "Konser", v: "concert", icon: "◉" },
    { label: "Festival", v: "festival", icon: "✷" },
  ];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero-dark relative overflow-hidden">
        <div className="min-h-[70vh] flex flex-col justify-center relative">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(5,5,5,0.82) 0%, rgba(5,5,5,0.55) 45%, rgba(24,10,10,0.85) 100%)" }} />
            <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to top, rgba(24,10,10,1), rgba(24,10,10,0))" }} />
            <div className="absolute inset-0 opacity-60 mix-blend-screen pointer-events-none">
              <StageBeams overlay />
            </div>
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-4 pt-28 pb-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.4em] text-red-400/80 font-bold">● now showing — all cities</p>
            <h1 className="mt-5 font-black tracking-tighter leading-[0.85]">
              <span className="block text-[15vw] sm:text-9xl uppercase">
                <span className="stroke-text">Live</span> <span className="text-zinc-100">music</span>
              </span>
              <span className="block text-[11vw] sm:text-8xl uppercase mt-1">
                <span className="text-zinc-100">di kotamu</span>
              </span>
            </h1>
            <p className="mt-6 text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
              Gig, konser, festival — setiap listing punya sumber yang dicek manusia, bukan robot.
            </p>
            <p className="mt-5 flex justify-center gap-3 flex-wrap text-xs font-bold uppercase tracking-wide">
              <span className="rounded-full glass px-3 py-1 text-zinc-300">{stats.events} event terverifikasi</span>
              <span className="rounded-full glass px-3 py-1 text-zinc-300">{stats.cities} kota</span>
              <span className="rounded-full glass px-3 py-1 text-zinc-300">{stats.artists} artis di lineup</span>
            </p>
            <form method="get" className="mt-7 max-w-2xl mx-auto glass rounded-2xl p-2 flex gap-2" aria-label="Cari event">
              <input name="q" defaultValue={q} placeholder="Acara apa yang lu cari?" aria-label="Cari event" className="input !border-0 !bg-transparent flex-1" />
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
                {PROMOTERS.map((p, i) => (
                  <span key={i} className="flex items-center gap-10">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" title={`Buka situs ${p.name}`} aria-label={p.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.logo} alt={p.name} className="h-5 sm:h-6 w-auto object-contain opacity-80 hover:opacity-100 hover:scale-110 transition-all" loading="lazy" />
                    </a>
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
          {["★", ...events.map(e => (e.artists || e.title).toUpperCase())].flatMap((label, i) => (
            <span key={i} className="text-base sm:text-lg font-extrabold whitespace-nowrap">
              <span className={label === "★" ? "text-red-500" : "text-zinc-600 hover:text-red-300 transition-colors"}>{label}</span>
              <span className="mx-4 text-red-600/60">✕</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── agenda: poster grid ── */}
      <div className="px-4 py-8 space-y-5 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
            Agenda <span className="stroke-text">live</span>
          </h2>
          <FilterForm className="flex gap-2 flex-wrap">
            <select name="city" defaultValue={city} aria-label="Filter kota" className="input !w-auto text-xs py-1.5">
              <option value="">Semua kota</option>
              {cities().map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select name="genre" defaultValue={genre} aria-label="Filter genre" className="input !w-auto text-xs py-1.5">
              <option value="">Semua genre</option>
              {genres().map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
            {from && <input type="hidden" name="from" value={from} />}
            {type && <input type="hidden" name="type" value={type} />}
          </FilterForm>
        </div>

        <Suspense fallback={null}>
          {events.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="font-bold text-lg uppercase">Eventnya sepi</p>
              <p className="text-sm text-muted mt-1">Coba hapus filter, atau <Link href="/request" className="text-red-400 underline">request artisnya</Link> biar promoter lihat minatnya.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {events.map(e => <li key={e.id}><EventCard e={e} /></li>)}
            </ul>
          )}
        </Suspense>
      </div>

      {/* ── cara kerja ── */}
      <div className="px-4 py-10 max-w-[1440px] mx-auto">
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
          Kenapa <span className="stroke-text">bisa dipercaya</span>
        </h2>
        <p className="text-sm text-muted mb-6 mt-2">Bukan scraping otomatis. Setiap event lewat tiga langkah sebelum muncul di agenda.</p>
        <ol className="grid sm:grid-cols-3 gap-3">
          {[
            { n: "01", t: "Scout submit", d: "Komunitas kirim event beserta link sumber resmi — poster, tanggal, venue, harga." },
            { n: "02", t: "Moderasi & verifikasi", d: "Admin mengecek sumbernya. Listing dapat status source_checked atau official sebelum tampil." },
            { n: "03", t: "Demand naik", d: "Pengunjung menandai \"aku ikut\". Angka minat jadi sinyal buat promoter dan EO." },
          ].map(s => (
            <li key={s.n} className="group card p-5">
              <p className="text-red-400 font-black text-3xl">{s.n}</p>
              <p className="font-bold mt-2 uppercase tracking-wide text-sm">{s.t}</p>
              <p className="text-sm text-muted mt-1.5 leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* ── demand signal moment ── */}
      <div className="px-4 py-14 text-center">
        {demand && demand.interest > 0 ? (
          <>
            <p className="text-[11px] uppercase tracking-[0.4em] text-red-400/80 font-bold">● demand signal — live dari komunitas</p>
            <p className="text-4xl sm:text-7xl font-black tracking-tighter uppercase leading-[1.05] max-w-4xl mx-auto mt-6">
              <span className="text-red-400">{demand.interest}</span> org mau nonton{" "}
              <Link href={`/event/${demand.event.slug}`} className="shine">{demand.event.title}</Link>
              {" "}di {demand.event.venue_name || demand.event.venue_text || demand.event.city}.
            </p>
            <Link href={`/event/${demand.event.slug}`} className="btn inline-block mt-8">Ikut bilang aku mau →</Link>
          </>
        ) : (
          <>
            <p className="text-4xl sm:text-7xl font-black tracking-tighter uppercase leading-[1.05] max-w-4xl mx-auto">
              Jadi yang pertama bilang <span className="text-red-400">&quot;aku mau nonton.&quot;</span>
            </p>
            <Link href="/request" className="btn inline-block mt-8">Request artis →</Link>
          </>
        )}
      </div>

      {/* ── promoter directory ── */}
      <div className="px-4 py-10 max-w-[1440px] mx-auto" id="promoters">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-1">
          Promoter <span className="stroke-text">&amp; festival</span>
        </h2>
        <p className="text-sm text-muted mb-5">Organisasi di balik panggung-panggung besar Indonesia — klik buka situs resmi mereka untuk tiket & info langsung.</p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PROMOTERS.map(p => (
            <li key={p.name}>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="group card flex flex-col items-center text-center gap-3 py-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.logo} alt={`Logo ${p.name}`} className="h-8 sm:h-10 w-auto max-w-[140px] object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all" loading="lazy" />
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-300 group-hover:text-red-300 transition-colors block">{p.name}</span>
                <span className="text-[11px] text-muted leading-snug block">{p.tagline}</span>
                <span className="text-[11px] font-bold text-red-400 mt-auto">Situs resmi ↗</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted mt-3">Logo © masing-masing promotor — ditampilkan untuk atribusi & navigasi, bukan endorsement.</p>
      </div>

      {/* ── trust ── */}
      <div className="px-4 py-10 border-t border-zinc-800/60 max-w-[1440px] mx-auto">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { t: "Sumber tercatat.", d: "Setiap listing punya link sumber dan tanggal pengecekan — bisa lu cek sendiri di halaman event." },
            { t: "Dimoderasi.", d: "Manusia yang verifikasi, bukan bot. Event tanpa sumber tidak lolos." },
            { t: "Bukan platform tiket.", d: "Pembelian tetap terjadi di situs resmi promotor. SIDESTAGE cuma bantu lu nemuin panggungnya." },
          ].map(x => (
            <div key={x.t}>
              <h3 className="font-black text-xl uppercase tracking-tight">{x.t}</h3>
              <p className="text-sm text-muted mt-1.5 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
