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
    <Link href={`/event/${e.slug}`} className="card group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
              {TYPE_ICON[e.type] || "♪"} {e.type}
            </span>
            <span className={STATUS_BADGE[e.status] || "badge-unverified"}>{STATUS_LABEL[e.status] || e.status}</span>
            {e.verification_status === "unverified" && e.status === "verified" && <span className="badge-unverified">source unverified</span>}
          </div>
          <h3 className="font-bold mt-1 leading-snug group-hover:text-amber-300 transition-colors">{e.title}</h3>
          <p className="text-sm text-muted mt-0.5">{dateStr} · {timeStr} · {e.city}{e.venue_name ? ` — ${e.venue_name}` : e.venue_text ? ` — ${e.venue_text}` : ""}</p>
          {e.artists && <p className="text-sm mt-1 truncate text-zinc-300">Lineup: {e.artists}</p>}
          {e.price_info && <p className="text-sm text-muted mt-0.5">{e.price_info}</p>}
        </div>
        <time className="text-center shrink-0 rounded-lg border border-zinc-700 px-2.5 py-1.5 bg-stone-950 group-hover:border-amber-400/60 transition-colors" dateTime={e.starts_at}>
          <span className="block text-[10px] uppercase text-amber-400/80">{date.toLocaleDateString("id-ID", { month: "short" })}</span>
          <span className="block text-xl font-black leading-none">{date.getDate()}</span>
        </time>
      </div>
    </Link>
  );
}
