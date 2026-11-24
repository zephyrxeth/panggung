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
  const date = new Date(e.starts_at);
  const day = date.getDate();
  const month = date.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
  return (
    <Link href={`/event/${e.slug}`} className="card block overflow-hidden">
      {/* poster / fallback */}
      <div className="relative aspect-[3/4] overflow-hidden bg-eclipse">
        {e.poster_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.poster_path} alt={`Poster ${e.title}`} loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl text-accent/60 font-black">{TYPE_ICON[e.type] || "♪"}</span>
          </div>
        )}
        {/* date plate */}
        <div className="absolute top-2 left-2 border border-ink bg-accent text-ink px-2 py-0.5 text-center">
          <span className="block text-[9px] uppercase tracking-wide leading-none pt-0.5">{month}</span>
          <span className="block text-lg font-black leading-none">{day}</span>
        </div>
        {e.status !== "verified" && <div className="absolute top-2 right-2"><span className={STATUS_BADGE[e.status] || "badge-unverified"}>{STATUS_LABEL[e.status] || e.status}</span></div>}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#171213] to-transparent" />
        <p className="absolute bottom-2 left-3 right-3 text-[11px] font-extrabold uppercase tracking-wide text-ravine">
          {TYPE_ICON[e.type] || "♪"} {e.type} · {e.city}
        </p>
      </div>
      {/* body */}
      <div className="p-3 border-t-2 border-line">
        <h3 className="font-extrabold text-sm leading-snug line-clamp-2 uppercase">{e.title}</h3>
        <p className="text-xs text-muted mt-1 truncate">{e.venue_name || e.venue_text || e.city}</p>
        {e.price_info ? (
          <p className="mt-1.5 text-xs font-extrabold text-accent uppercase">Mulai {e.price_info.replace(/^Mulai |^From /i, "")}</p>
        ) : e.artists ? (
          <p className="mt-1.5 text-xs text-muted truncate">Lineup: {e.artists}</p>
        ) : (
          <p className="mt-1.5 text-xs text-muted">{date.toLocaleDateString("id-ID", { weekday: "long" })}</p>
        )}
      </div>
    </Link>
  );
}
