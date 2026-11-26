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
    <Link href={`/event/${e.slug}`} aria-label={`${e.title} — ${e.type} di ${e.city}, ${date.toLocaleDateString("id-ID", { day: "numeric", month: "long", timeZone: "Asia/Jakarta" })}`} className="group block rounded-2xl focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:outline-none rounded-2xl overflow-hidden glass transition-all duration-500 hover:border-red-400/60 hover:-translate-y-1">
      {/* poster / fallback */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        {e.poster_path ? (
          <>
            {/* blurred cover backdrop so the full poster can be shown with object-contain without letterbox bars */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.poster_path} alt="" aria-hidden loading="lazy"
              className="absolute inset-0 h-full w-full object-cover scale-110 blur-md opacity-60" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.poster_path} alt={`Poster ${e.title}`} loading="lazy"
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center bg-gradient-to-br from-zinc-900 via-stone-950 to-red-950/40">
            <span className="text-4xl text-red-500/50 font-black">{TYPE_ICON[e.type] || "♪"}</span>
            <span className="text-sm font-black uppercase leading-snug line-clamp-3 text-zinc-200">{e.title}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-red-300/80">{e.type} · {e.city}</span>
          </div>
        )}
        {/* date pill */}
        <div className="absolute top-2 left-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-1 text-center">
          <span className="block text-[9px] uppercase tracking-wide text-red-400">{month}</span>
          <span className="block text-lg font-black leading-none text-white">{day}</span>
        </div>
        {/* status */}
        <div className="absolute top-2 right-2">{e.status !== "verified" && <span className={STATUS_BADGE[e.status] || "badge-unverified"}>{STATUS_LABEL[e.status] || e.status}</span>}</div>
        {/* gradient bottom for text */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 to-transparent" />
        <p className="absolute bottom-2 left-3 right-3 text-[11px] font-bold uppercase tracking-wide text-red-300">
          {TYPE_ICON[e.type] || "♪"} {e.type} · {e.city}
        </p>
      </div>
      {/* body */}
      <div className="p-3">
        <h3 className="font-bold text-sm leading-snug line-clamp-2 uppercase group-hover:text-red-300 transition-colors">{e.title}</h3>
        <p className="text-xs text-muted mt-1 truncate">{e.venue_name || e.venue_text || e.city}</p>
        {e.price_info ? (
          <p className="mt-1.5 text-xs font-bold text-red-300">Mulai {e.price_info.replace(/^Mulai |^From /i, "")}</p>
        ) : e.artists ? (
          <p className="mt-1.5 text-xs text-zinc-400 truncate">Lineup: {e.artists}</p>
        ) : (
          <p className="mt-1.5 text-xs text-zinc-500">{date.toLocaleDateString("id-ID", { weekday: "long" })}</p>
        )}
      </div>
    </Link>
  );
}
