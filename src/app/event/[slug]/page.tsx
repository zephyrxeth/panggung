import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getEventBySlug, eventSources, eventArtists, interestCount } from "@/lib/queries";
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
    <article className="space-y-5">
      {cancelled && <div className="rounded-lg bg-zinc-200 text-zinc-700 px-4 py-3 text-sm font-semibold">Event ini dibatalkan. Cek sumber resmi untuk info refund.</div>}
      {e.status === "pending_review" && <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">Listing ini masih <b>pending review</b> moderator dan belum diverifikasi.</div>}
      {e.status === "rejected" && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">Listing ini ditolak moderator.</div>}
      {e.title.startsWith("[DEMO]") && <div className="rounded-lg border border-dashed border-amber-400/40 bg-zinc-900 px-4 py-3 text-sm text-muted"><b>DEMO data.</b> Ini data seed demo, bukan event sungguhan.</div>}

      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-accent">{e.type} · {e.city}</p>
        <h1 className="text-2xl font-black leading-tight mt-1">{e.title}</h1>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className={e.status === "verified" ? "badge-verified" : e.status === "cancelled" ? "badge-cancelled" : e.status === "pending_review" ? "badge-pending" : e.status === "updated" ? "badge-updated" : "badge-rejected"}>
            {e.status.replace("_", " ")}
          </span>
          <span className={e.verification_status === "unverified" ? "badge-unverified" : "badge-verified"}>
            {e.verification_status === "official" ? "Official source" : e.verification_status === "source_checked" ? "Source checked" : "Source unverified"}
          </span>
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
          ) : (
            <span className="btn-ghost text-muted cursor-default">Link tiket resmi belum tersedia</span>
          )}
          <InterestButton eventId={e.id} initialCount={interested} disabled={cancelled} />
        </div>
        <p className="text-[11px] text-muted">Panggung bukan platform tiket — pembelian terjadi di situs resmi event.</p>
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

      <ReportDialog eventId={e.id} />
    </article>
  );
}
