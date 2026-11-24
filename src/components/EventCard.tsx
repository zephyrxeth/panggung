import Link from "next/link";
import type { EventRow } from "@/lib/queries";

const STATUS_BADGE: Record<string, string> = {
  verified: "badge-verified", pending_review: "badge-pending",
  cancelled: "badge-cancelled", rejected: "badge-rejected", updated: "badge-updated",
};
const STATUS_LABEL: Record<string, string> = {
  verified: "Verified", pending_review: "Pending review", cancelled: "Cancelled",
  rejected: "Rejected", updated: "Updated",
};
const TYPE_ICON: Record<string, string> = { gig: "♪", concert: "◉", festival: "✷" };

export default function EventCard({ e }: { e: EventRow }) {
  const date = new Date(e.starts_at);
  const dateStr = date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
  const timeStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return (
    <Link href={`/event/${e.slug}`} className="card group flex gap-4">
      {e.poster_path && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={e.poster_path}
          alt={`Poster ${e.title}`}
          className="hidden sm:block w-28 h-32 shrink-0 rounded-xl object-cover border border-white/10"
          loading="lazy"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                {TYPE_ICON[e.type] || "♪"} {e.type}
              </span>
              <span className={STATUS_BADGE[e.status] || "badge-unverified"}>{STATUS_LABEL[e.status] || e.status}</span>
            </div>
            <h3 className="font-bold mt-1 leading-snug uppercase group-hover:text-red-300 transition-colors">{e.title}</h3>
            <p className="text-sm text-muted mt-0.5">{dateStr} · {timeStr} · {e.city}{e.venue_name ? ` — ${e.venue_name}` : e.venue_text ? ` — ${e.venue_text}` : ""}</p>
            {e.artists && <p className="text-sm mt-1 truncate text-zinc-300">Lineup: {e.artists}</p>}
            {e.price_info && <p className="text-sm text-red-300/90 mt-0.5">{e.price_info}</p>}
          </div>
          <time className="text-center shrink-0 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 group-hover:border-red-400/60 transition-colors" dateTime={e.starts_at}>
            <span className="block text-[10px] uppercase text-red-400/80">{date.toLocaleDateString("id-ID", { month: "short" })}</span>
            <span className="block text-xl font-black leading-none">{date.getDate()}</span>
          </time>
        </div>
      </div>
    </Link>
  );
}
