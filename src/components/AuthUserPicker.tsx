"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthUserPicker({ cities, prefillArtist }: { cities: { id: number; name: string }[]; prefillArtist?: string }) {
  const [artist, setArtist] = useState(prefillArtist || "");
  const [cityId, setCityId] = useState(cities[0]?.id || "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ artist_name: artist, city_id: cityId }) });
      const d = await r.json();
      if (r.status === 401) setMsg({ ok: false, text: "Login dulu buat request (atau daftar — gratis)." });
      else if (r.ok) { setMsg({ ok: true, text: `Request tercatat! Total sekarang: ${d.total_requests}.` }); router.refresh(); }
      else setMsg({ ok: false, text: d.error || "Gagal" });
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-zinc-900 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted text-xs">Nama artis / band</span>
          <input className="input mt-1" value={artist} onChange={e => setArtist(e.target.value)} placeholder="cth: Band Demo Satu" required />
        </label>
        <label className="block text-sm">
          <span className="text-muted text-xs">Kota</span>
          <select className="input mt-1" value={cityId} onChange={e => setCityId(Number(e.target.value))}>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text} {msg.text.includes("Login dulu") && <a href="/login" className="underline">login</a>}</p>}
      <button className="btn" disabled={busy || !artist}>{busy ? "Mengirim…" : "Kirim request"}</button>
    </form>
  );
}
