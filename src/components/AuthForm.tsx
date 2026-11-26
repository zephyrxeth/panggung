"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [name, setName] = useState("");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [fieldErr, setFieldErr] = useState<{ email?: string; pw?: string }>({});
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(""); setFieldErr({});
    const errs: typeof fieldErr = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.email = "Format email gak valid.";
    if (mode === "register" && pw.length < 8) errs.pw = "Password minimal 8 karakter.";
    if (Object.keys(errs).length) { setFieldErr(errs); return; }
    setBusy(true);
    try {
      const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "login" ? { email, password: pw } : { display_name: name, email, password: pw }) });
      const d = await r.json();
      if (r.ok) { router.push("/"); router.refresh(); }
      else setMsg(d.error || "Gagal");
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-black tracking-tight">{mode === "login" ? "Masuk" : "Daftar"}</h1>
      <p className="text-sm text-muted">Akun cuma dibutuhkan buat submit event, mark interest, dan request artis. Browsing bebas tanpa akun. Pseudonym oke.</p>
      <form onSubmit={submit} className="rounded-xl border border-line bg-zinc-900 p-4 space-y-3">
        {mode === "register" && (
          <label className="block text-sm"><span className="text-muted text-xs">Nama tampil (boleh pseudonym)</span>
            <input className="input mt-1" value={name} onChange={e => setName(e.target.value)} required maxLength={60} /></label>
        )}
        <label className="block text-sm"><span className="text-muted text-xs">Email</span>
          <input className={`input mt-1 ${fieldErr.email ? "!border-red-500" : ""}`} type="email" value={email} onChange={e => setEmail(e.target.value)} required aria-invalid={!!fieldErr.email} />
          {fieldErr.email && <span className="text-xs text-red-500 mt-1 block">{fieldErr.email}</span>}</label>
        <label className="block text-sm"><span className="text-muted text-xs">Password {mode === "register" && "(min 8 karakter)"}</span>
          <span className="relative block">
            <input className={`input mt-1 pr-12 ${fieldErr.pw ? "!border-red-500" : ""}`} type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} required minLength={mode === "register" ? 8 : 1} aria-invalid={!!fieldErr.pw} />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-muted hover:text-red-400" aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}>{showPw ? "Hide" : "Show"}</button>
          </span>
          {fieldErr.pw && <span className="text-xs text-red-500 mt-1 block">{fieldErr.pw}</span>}</label>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "…" : mode === "login" ? "Masuk" : "Daftar"}</button>
      </form>
      <p className="text-sm text-muted text-center">
        {mode === "login" ? <>Belum punya akun? <a className="text-accent underline" href="/register">Daftar</a></> : <>Sudah punya akun? <a className="text-accent underline" href="/login">Masuk</a></>}
      </p>
    </div>
  );
}
