import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getEventBySlug, eventSources, eventArtists, interestCount, searchEvents } from "@/lib/queries";
import EventCard from "@/components/EventCard";
import InterestButton from "@/components/InterestButton";
import ReportDialog from "@/components/ReportDialog";

export const dynamic = "force-dynamic";
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const e = getEventBySlug(slug);
  if (!e) return { title: "Event not found" };
  return {
    title: e.title,
    description: `${e.type} di ${e.city} — ${new Date(e.starts_at).toLocaleDateString("id-ID", { dateStyle: "full" })}.`,
    openGraph: { title: e.title, description: `${e.city} · ${e.venue_name || e.venue_text || "Venue TBA"}` },
  };
}

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const e = getEventBySlug(slug);
  if (!e) notFound();
  const sources = eventSources(e.id);
  const artists = eventArtists(e.id);
  const interested = interestCount(e.id);
  const d = new Date(e.starts_at);
  const cancelled = e.status === "cancelled";

  return (
    <article className="space-y-5 max-w-[1440px] mx-auto px-4">
      {cancelled && <div className="rounded-lg bg-zinc-200 text-zinc-700 px-4 py-3 text-sm font-semibold">Event ini dibatalkan. Cek sumber resmi untuk info refund.</div>}
      {e.status === "pending_review" && <div className="rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-3 text-sm text-zinc-200">Listing ini masih <b>pending review</b> moderator dan belum diverifikasi.</div>}
      {e.status === "rejected" && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">Listing ini ditolak moderator.</div>}
      {e.title.startsWith("[DEMO]") && <div className="rounded-lg border border-dashed border-red-500/40 bg-zinc-900 px-4 py-3 text-sm text-muted"><b>DEMO data.</b> Ini data seed demo, bukan event sungguhan.</div>}

      {/* poster hero: blurred backdrop + floating poster */}
      <header className="relative overflow-hidden rounded-2xl border border-white/10 -mx-4">
        {e.poster_path && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.poster_path} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover scale-125 blur-2xl opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          </>
        )}
        <div className={`relative grid gap-5 p-5 sm:p-7 ${e.poster_path ? "sm:grid-cols-[minmax(0,280px)_1fr] items-center" : ""}`}>
          {e.poster_path && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.poster_path} alt={`Poster ${e.title}`} className="w-full max-w-[280px] mx-auto rounded-2xl border border-white/15 shadow-[0_16px_64px_rgba(239,68,68,0.3)]" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">{e.type} · {e.city}</p>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight mt-2">{e.title}</h1>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className={e.status === "verified" ? "badge-verified" : e.status === "cancelled" ? "badge-cancelled" : e.status === "pending_review" ? "badge-pending" : e.status === "updated" ? "badge-updated" : "badge-rejected"}>
                {e.status.replace("_", " ")}
              </span>
              <span className={e.verification_status === "unverified" ? "badge-unverified" : "badge-verified"}>
                {e.verification_status === "official" ? "Official source" : e.verification_status === "source_checked" ? "Source checked" : "Source unverified"}
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-300">
              {d.toLocaleDateString("id-ID", { dateStyle: "full" })} · {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB<br />
              {e.venue_name || e.venue_text || "Venue TBA"}
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-line bg-zinc-900 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted text-xs">Waktu</p><p className="font-semibold">{d.toLocaleDateString("id-ID", { dateStyle: "full" })}<br />{d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</p></div>
          <div><p className="text-muted text-xs">Lokasi</p><p className="font-semibold">{e.venue_name || e.venue_text || "Venue TBA"}<br />{e.city}</p></div>
          <div><p className="text-muted text-xs">Harga</p><p className="font-semibold">{e.price_info || "TBA"}</p></div>
          <div><p className="text-muted text-xs">Minat</p><p className="font-semibold">{interested} orang tertarik</p></div>
        </div>
        {artists.length > 0 && (
          <div>
            <p className="text-muted text-xs mb-1">Lineup</p>
            <p className="text-sm font-semibold">{artists.map((a, i) => <span key={a.slug}>{i > 0 && ", "}<Link className="hover:text-accent" href={`/request?artist=${a.slug}`}>{a.name}</Link></span>)}</p>
          </div>
        )}
        <p className="text-sm text-muted leading-relaxed">{e.description}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {e.ticket_url ? (
            <a className="btn" href={e.ticket_url} target="_blank" rel="noopener noreferrer">Tiket resmi ↗</a>
          ) : sources.length > 0 ? (
            <a className="btn" href={sources[0].source_url} target="_blank" rel="noopener noreferrer">Info & tiket via sumber ↗</a>
          ) : (
            <span className="btn-ghost text-muted cursor-default">Link tiket resmi belum tersedia</span>
          )}
          <InterestButton eventId={e.id} initialCount={interested} disabled={cancelled} />
        </div>
        <p className="text-[11px] text-muted">SIDESTAGE bukan platform tiket — pembelian terjadi di situs resmi event.</p>
      </section>

      <section className="rounded-xl border border-line bg-zinc-900 p-4">
        <h2 className="text-sm font-bold mb-2">Sumber informasi</h2>
        <ul className="space-y-1.5 text-sm">
          {sources.map((s, i) => (
            <li key={i} className="flex justify-between gap-2">
              <a className="text-accent underline break-all" href={s.source_url} target="_blank" rel="noopener noreferrer">{s.source_url}</a>
              <span className="text-xs text-muted shrink-0">{s.source_type} · cek {s.checked_at.slice(0, 10)}</span>
            </li>
          ))}
          {sources.length === 0 && <li className="text-muted">Tidak ada sumber tercatat.</li>}
        </ul>
        <p className="text-[11px] text-muted mt-2">Dikontribusikan oleh {e.display_name || "anonim"} ({e.submitted_by_role}).</p>
      </section>

      {/* related events */}
      {(() => {
        const related = searchEvents({ city: e.city }).filter(r => r.id !== e.id).slice(0, 3);
        if (related.length === 0) return null;
        return (
          <section className="pt-2">
            <h2 className="text-lg font-black uppercase tracking-tight mb-3">Sekitar <span className="text-red-400">{e.city}</span></h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {related.map(r => <li key={r.id}><EventCard e={r} /></li>)}
            </ul>
          </section>
        );
      })()}

      <ReportDialog eventId={e.id} />
    </article>
  );
}
