"use client";
import { useEffect, useState } from "react";

type Row = { id: number; title: string; slug: string; status: string; type: string; starts_at: string; created_at: string; city: string; display_name: string | null };

export default function AdminClient() {
  const [data, setData] = useState<{ queue: Row[]; reports: any[]; log: any[] } | null>(null);
  const [err, setErr] = useState("");
  const [mergeInto, setMergeInto] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/events");
    if (r.ok) setData(await r.json()); else setErr((await r.json().catch(() => ({}))).error || "Unauthorized");
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

  if (err) return <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-sm text-red-700">{err}. Login sebagai admin dulu (demo: admin@panggung.demo).</div>;
  if (!data) return <p className="text-sm text-muted">Memuat…</p>;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-bold text-sm mb-2">Antrean review ({data.queue.filter(e => e.status === "pending_review").length} pending)</h2>
        <ul className="space-y-2">
          {data.queue.map(e => (
            <li key={e.id} className="rounded-xl border border-line bg-zinc-900 p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{e.title}</p>
                  <p className="text-xs text-muted">{e.type} · {e.city} · {e.starts_at.slice(0, 16).replace("T", " ")} · oleh {e.display_name || "?"} · status: {e.status}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {e.status === "pending_review" && <>
                    <button className="btn text-xs px-2 py-1" disabled={busy} onClick={() => act(e.id, "approve")}>Approve</button>
                    <button className="btn-ghost text-xs px-2 py-1" disabled={busy} onClick={() => act(e.id, "reject")}>Reject</button>
                    <button className="btn-ghost text-xs px-2 py-1" disabled={busy} onClick={() => act(e.id, "cancel")}>Cancel</button>
                  </>}
                  {e.status === "verified" && <button className="btn-ghost text-xs px-2 py-1" disabled={busy} onClick={() => act(e.id, "cancel")}>Cancel</button>}
                </div>
              </div>
              <div className="flex gap-1.5 mt-2">
                <input className="input text-xs py-1" placeholder="ID event utama utk merge…" value={mergeInto[e.id] || ""} onChange={ev => setMergeInto(m => ({ ...m, [e.id]: ev.target.value }))} />
                <button className="btn-ghost text-xs px-2 py-1 shrink-0" disabled={busy || !mergeInto[e.id]} onClick={() => act(e.id, "merge", { duplicate_of: Number(mergeInto[e.id]) })}>Merge</button>
              </div>
            </li>
          ))}
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
