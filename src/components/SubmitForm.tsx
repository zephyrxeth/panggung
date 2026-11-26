"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitForm({ cities }: { cities: { id: number; name: string; venues: { id: number; name: string }[] }[] }) {
  const [form, setForm] = useState({ title: "", type: "gig", starts_at: "", city_id: cities[0]?.id || "", venue_id: "", venue_text: "", description: "", source_url: "", source_type: "instagram", ticket_url: "", price_info: "", artist_names: "" });
  const [poster, setPoster] = useState<{ poster_path: string } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; link?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const city = cities.find(c => c.id === Number(form.city_id));

  async function uploadPoster(file: File) {
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (r.ok) setPoster(d); else setMsg({ ok: false, text: d.error });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      const payload = { ...form, city_id: Number(form.city_id), venue_id: form.venue_id ? Number(form.venue_id) : null, artist_names: form.artist_names.split(",").map(s => s.trim()).filter(Boolean) };
      const r = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (r.status === 401) setMsg({ ok: false, text: "Login dulu buat submit event." });
      else if (r.status === 409) setMsg({ ok: false, text: `Kemungkinan duplikat: "${d.duplicate_of?.title}" sudah ada. Kalau event yang sama, jangan submit ulang.` });
      else if (r.ok) { setMsg({ ok: true, text: "Terkirim! Masuk antrean review moderator (status: pending).", link: d.slug }); router.refresh(); }
      else setMsg({ ok: false, text: d.error || "Gagal" });
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-xl border border-line bg-zinc-900 p-4 space-y-3">
        <label className="block text-sm"><span className="text-muted text-xs">Nama event *</span>
          <input className="input mt-1" value={form.title} onChange={e => set("title", e.target.value)} required maxLength={140} /></label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-sm"><span className="text-muted text-xs">Tipe</span>
            <select className="input mt-1" value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="gig">Gig</option><option value="concert">Concert</option><option value="festival">Festival</option>
            </select></label>
          <label className="block text-sm"><span className="text-muted text-xs">Tanggal &amp; jam mulai *</span>
            <input className="input mt-1" type="datetime-local" value={form.starts_at} onChange={e => set("starts_at", e.target.value)} required /></label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-sm"><span className="text-muted text-xs">Kota *</span>
            <select className="input mt-1" value={form.city_id} onChange={e => { set("city_id", e.target.value); set("venue_id", ""); }}>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></label>
          <label className="block text-sm"><span className="text-muted text-xs">Venue terdaftar</span>
            <select className="input mt-1" value={form.venue_id} onChange={e => set("venue_id", e.target.value)}>
              <option value="">— Tulis manual di bawah —</option>
              {city?.venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select></label>
        </div>
        <label className="block text-sm"><span className="text-muted text-xs">Nama venue (kalau belum terdaftar)</span>
          <input className="input mt-1" value={form.venue_text} onChange={e => set("venue_text", e.target.value)} maxLength={200} /></label>
        <label className="block text-sm"><span className="text-muted text-xs">Lineup (pisah dengan koma)</span>
          <input className="input mt-1" value={form.artist_names} onChange={e => set("artist_names", e.target.value)} placeholder="Band A, Band B" /></label>
        <label className="block text-sm"><span className="text-muted text-xs">Deskripsi</span>
          <textarea className="input mt-1" rows={3} value={form.description} onChange={e => set("description", e.target.value)} maxLength={2000} /></label>
        <label className="block text-sm"><span className="text-muted text-xs">Info harga</span>
          <input className="input mt-1" value={form.price_info} onChange={e => set("price_info", e.target.value)} placeholder="cth: Presale Rp 150rb" /></label>
      </div>

      <div className="rounded-xl border border-line bg-zinc-900 p-4 space-y-3">
        <p className="text-sm font-bold">Sumber / bukti * <span className="font-normal text-muted text-xs">(wajib — link ke pengumuman asli)</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-sm"><span className="text-muted text-xs">Jenis sumber</span>
            <select className="input mt-1" value={form.source_type} onChange={e => set("source_type", e.target.value)}>
              {["instagram", "x", "tiktok", "website", "ticketing", "other"].map(s => <option key={s} value={s}>{s}</option>)}
            </select></label>
          <label className="block text-sm"><span className="text-muted text-xs">URL sumber *</span>
            <input className="input mt-1" type="url" value={form.source_url} onChange={e => set("source_url", e.target.value)} placeholder="https://instagram.com/…" required /></label>
        </div>
        <label className="block text-sm"><span className="text-muted text-xs">Poster / bukti (png/jpg/webp, maks 2MB)</span>
          <input className="input mt-1" type="file" accept="image/png,image/jpeg,image/webp" onChange={e => e.target.files?.[0] && uploadPoster(e.target.files[0])} /></label>
        {poster && <p className="text-sm text-emerald-700">Poster terunggah ✓</p>}
        <label className="block text-sm"><span className="text-muted text-xs">Link tiket resmi (opsional)</span>
          <input className="input mt-1" type="url" value={form.ticket_url} onChange={e => set("ticket_url", e.target.value)} placeholder="https://…" /></label>
      </div>

      {msg && <div className={`rounded-lg px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
        {msg.text} {msg.link && <Link href={`/event/${msg.link}`} className="underline">lihat halaman event</Link>}
      </div>}
      <button className="btn w-full sm:w-auto" disabled={busy}>{busy ? "Mengirim…" : "Submit untuk review"}</button>
      <p className="text-[11px] text-muted">Submission masuk antrean moderasi. Listing baru tampil publik setelah disetujui. Jangan repost artwork tanpa izin — cukup link sumbernya.</p>
    </form>
  );
}
