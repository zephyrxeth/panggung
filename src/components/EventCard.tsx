import { utcDate } from "@/lib/tz";
import Link from "next/link";
import type { EventRow } from "@/lib/queries";

const STATUS_BADGE: Record<string, string> = {
  verified: "badge-verified", pending_review: "badge-pending",
  cancelled: "badge-cancelled", rejected: "badge-rejected", updated: "badge-updated",
};
const STATUS_LABEL: Record<string, string> = {
  verified: "Verified", pending_review: "Pending", cancelled: "Cancelled",
  rejected: "Rejected", updated: "Updated",
};
const TYPE_ICON: Record<string, string> = { gig: "♪", concert: "◉", festival: "✷" };

export default function EventCard({ e }: { e: EventRow }) {
  const date = utcDate(e.starts_at);
  const day = date.getDate();
  const month = date.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
  return (
    <Link href={`/event/${e.slug}`} aria-label={`${e.title} — ${e.type} di ${e.city}, ${date.toLocaleDateString("id-ID", { day: "numeric", month: "long", timeZone: "Asia/Jakarta" })}`} className="group block focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:outline-none rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)] ring-1 ring-white/10">
      {/* poster full-bleed, teks overlay di bawah */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        {e.poster_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.poster_path} alt={`Poster ${e.title}`} loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-stone-950 to-red-950/40">
            <span className="text-6xl text-red-500/50 font-black">{TYPE_ICON[e.type] || "♪"}</span>
          </div>
        )}

        {/* date badge — glass, kiri atas */}
        <div className="absolute top-3 left-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 px-3 py-2 text-center shadow-lg">
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/90 leading-tight">{month}</span>
          <span className="block text-2xl font-black leading-none text-white mt-0.5">{day}</span>
        </div>

        {/* status badge (non-verified saja) */}
        <div className="absolute top-3 right-3">{e.status !== "verified" && <span className={STATUS_BADGE[e.status] || "badge-unverified"}>{STATUS_LABEL[e.status] || e.status}</span>}</div>

        {/* gradient bawah — judul + kategori-tempat saja */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute bottom-0 left-4 right-4 pb-5">
          <h3 className="text-white font-black uppercase leading-tight text-xl line-clamp-2 drop-shadow-md">{e.title}</h3>
          <p className="text-white/80 text-xs font-normal uppercase tracking-wide mt-1.5">{e.type} - {e.venue_name || e.venue_text || e.city}</p>
        </div>
      </div>
    </Link>
  );
}
