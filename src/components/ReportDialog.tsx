"use client";
import { useState } from "react";

const REASONS = [
  ["wrong_date", "Tanggal/salah info"], ["cancelled", "Event batal"], ["duplicate", "Duplikat listing"],
  ["suspicious_link", "Link mencurigakan"], ["other", "Lainnya"],
];

export default function ReportDialog({ eventId }: { eventId: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("wrong_date");
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const r = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event_id: eventId, reason, detail }) });
    if (r.ok) setDone(true); else setError((await r.json().catch(() => ({}))).error || "Gagal mengirim laporan");
  }

  if (!open) return <button className="text-sm text-muted underline" onClick={() => setOpen(true)}>Laporkan masalah pada listing ini</button>;
  return (
    <div className="rounded-xl border border-line bg-zinc-900 p-4">
      <h2 className="text-sm font-bold mb-2">Laporkan listing</h2>
      {done ? <p className="text-sm text-emerald-700">Laporan diterima. Moderator akan mengeceknya. Terima kasih!</p> : (
        <form onSubmit={submit} className="space-y-2">
          <select className="input" value={reason} onChange={e => setReason(e.target.value)}>
            {REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <textarea className="input" rows={2} placeholder="Detail (opsional)" value={detail} onChange={e => setDetail(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button className="btn">Kirim laporan</button>
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Batal</button>
          </div>
        </form>
      )}
    </div>
  );
}
