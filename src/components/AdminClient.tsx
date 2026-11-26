"use client";
import { useEffect, useState } from "react";
import { utcDate } from "@/lib/tz";

type Row = {
  id: number; title: string; slug: string; status: string; type: string; starts_at: string;
  created_at: string; city: string; display_name: string | null;
  venue_name: string | null; venue_text: string; poster_path: string | null;
  price_info: string; description: string; ticket_url: string | null; verification_status: string;
  sources: { source_url: string; source_type: string; checked_at: string | null }[];
  artists: string[];
};

const VERIF_BADGE: Record<string, { label: string; cls: string }> = {
  official: { label: "Official source", cls: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" },
  source_checked: { label: "Source checked", cls: "bg-sky-500/20 text-sky-300 border border-sky-500/40" },
  unverified: { label: "Source unverified", cls: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/40" },
};

function wib(dt: string) {
  return utcDate(dt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "short" }) + " WIB";
}

export default function AdminClient() {
  const [data, setData] = useState<{ queue: Row[]; reports: any[]; log: any[] } | null>(null);
  const [err, setErr] = useState("");
  const [mergeInto, setMergeInto] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [verifChoice, setVerifChoice] = useState<Record<number, string>>({});

  async function load() {
    const r = await fetch("/api/admin/events");
    if (r.ok) setData(await r.json()); else setErr((await r.json().catch(() => ({}))).error || "Unauthorized — login sebagai admin dulu.");
  }
  useEffect(() => { load(); }, []);

  async function act(id: number, action: string, extra: object = {}) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, ...extra }) });
      const d = await r.json();
      if (!r.ok) setErr(d.error); else setErr("");
      await load();
    } finally { setBusy(false); }
  }

  if (err) return <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-sm text-red-700">{err}</div>;
  if (!data) return <p className="text-sm text-muted">Memuat…</p>;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-bold text-sm mb-2">Antrean review ({data.queue.filter(e => e.status === "pending_review").length} pending)</h2>
        <ul className="space-y-2">
          {data.queue.map(e => {
            const open = !!expanded[e.id];
            const vb = VERIF_BADGE[e.verification_status] || VERIF_BADGE.unverified;
            return (
              <li key={e.id} className="rounded-xl border border-line bg-zinc-900 p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      <a href={`/event/${e.slug}`} target="_blank" className="hover:text-red-300 underline-offset-2 hover:underline" title="Buka halaman event">{e.title}</a>
                    </p>
                    <p className="text-xs text-muted">
                      {e.type} · {e.city} · {wib(e.starts_at)} · oleh {e.display_name || "?"} · status: {e.status} ·{" "}
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${vb.cls}`}>{vb.label}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {e.status === "pending_review" && <>
                      <button className="btn text-xs px-2 py-1" disabled={busy} onClick={() => act(e.id, "approve", { verification_status: verifChoice[e.id] || "source_checked" })}>Approve</button>
                      <button className="btn-ghost text-xs px-2 py-1" disabled={busy} onClick={() => act(e.id, "reject")}>Reject</button>
                      <button className="btn-ghost text-xs px-2 py-1" disabled={busy} onClick={() => act(e.id, "cancel")}>Cancel</button>
                    </>}
                    {e.status !== "pending_review" && <>
                      <select className="input text-xs py-1 !w-auto" value={verifChoice[e.id] || "source_checked"} onChange={ev => setVerifChoice(m => ({ ...m, [e.id]: ev.target.value }))} aria-label="Status verifikasi sumber">
                        <option value="source_checked">Source checked</option>
                        <option value="official">Official</option>
                      </select>
                      <button className="btn-ghost text-xs px-2 py-1" disabled={busy} onClick={() => act(e.id, "verify", { verification_status: verifChoice[e.id] || "source_checked" })}>Verify</button>
                      <button className="btn-ghost text-xs px-2 py-1" disabled={busy} onClick={() => act(e.id, "cancel")}>Cancel</button>
                    </>}
                    <button className="btn-ghost text-xs px-2 py-1" onClick={() => setExpanded(m => ({ ...m, [e.id]: !open }))} aria-expanded={open}>{open ? "Tutup" : "Detail"}</button>
                  </div>
                </div>

                {open && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr] border-t border-line pt-3">
                    {e.poster_path && (
                      // eslint-disable-next-line @next/link/no-http-url
                      <img src={e.poster_path} alt={`Poster ${e.title}`} className="rounded-lg border border-line w-[120px] aspect-[3/4] object-cover" />
                    )}
                    <div className="space-y-2 text-xs">
                      <p><span className="text-muted">Venue:</span> {e.venue_name || e.venue_text || "TBA"}</p>
                      <p><span className="text-muted">Harga:</span> {e.price_info || "—"}</p>
                      <p><span className="text-muted">Lineup:</span> {e.artists.length ? e.artists.join(", ") : "—"}</p>
                      <p><span className="text-muted">Deskripsi:</span> {e.description || "—"}</p>
                      <p><span className="text-muted">Sumber (wajib dicek):</span></p>
                      <ul className="space-y-1">
                        {e.sources.map((s, i) => (
                          <li key={i} className="flex items-center gap-2 flex-wrap">
                            <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-red-300 underline break-all">{s.source_type}: {s.source_url}</a>
                            <span className={`text-[10px] font-bold uppercase rounded px-1 py-0.5 ${s.checked_at ? "bg-sky-500/20 text-sky-300" : "bg-amber-500/20 text-amber-300"}`}>{s.checked_at ? "checked" : "unchecked"}</span>
                          </li>
                        ))}
                        {e.sources.length === 0 && <li className="text-amber-300">⚠ Tidak ada sumber tercatat!</li>}
                      </ul>
                      {e.ticket_url && <p><span className="text-muted">Tiket:</span> <a href={e.ticket_url} target="_blank" rel="noopener noreferrer" className="text-red-300 underline break-all">{e.ticket_url}</a></p>}
                      <div className="flex gap-1.5 pt-1">
                        <input className="input text-xs py-1" placeholder="ID event utama utk merge…" value={mergeInto[e.id] || ""} onChange={ev => setMergeInto(m => ({ ...m, [e.id]: ev.target.value }))} />
                        <button className="btn-ghost text-xs px-2 py-1 shrink-0" disabled={busy || !mergeInto[e.id]} onClick={() => act(e.id, "merge", { duplicate_of: Number(mergeInto[e.id]) })}>Merge</button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-bold text-sm mb-2">Laporan terbuka ({data.reports.length})</h2>
        {data.reports.length === 0 ? <p className="text-sm text-muted">Tidak ada laporan.</p> : (
          <ul className="space-y-2">{data.reports.map(r => (
            <li key={r.id} className="rounded border border-line bg-zinc-900 px-3 py-2 text-sm">
              <b>{r.reason}</b> pada “{r.title}” — {r.detail || "tanpa detail"} <span className="text-xs text-muted">({r.created_at})</span>
            </li>))}</ul>
        )}
      </section>

      <section>
        <h2 className="font-bold text-sm mb-2">Log moderasi terakhir</h2>
        <ul className="text-xs text-muted space-y-1">
          {data.log.map(l => <li key={l.id}>#{l.target_type} {l.target_id} · <b>{l.action}</b> oleh {l.moderator} · {l.created_at} {l.reason && `· ${l.reason}`}</li>)}
          {data.log.length === 0 && <li>Belum ada aktivitas.</li>}
        </ul>
      </section>
    </div>
  );
}
