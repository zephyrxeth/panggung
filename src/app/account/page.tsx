"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Me = { user: { id: number; display_name: string; email: string; role: string } | null };

export default function AccountPage() {
  const [me, setMe] = useState<Me["user"] | undefined>(undefined); // undefined = loading
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then((d: Me) => setMe(d.user)).catch(() => setMe(null));
  }, []);

  async function logout() {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/auth/logout", { method: "POST" });
      if (!r.ok) throw new Error();
      window.location.href = "/";
    } catch { setErr("Gagal logout, coba lagi."); setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Akun</h1>

      {me === undefined && (
        <div className="glass rounded-2xl p-6 text-sm text-zinc-400" role="status">Memuat…</div>
      )}

      {me === null && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <p className="text-sm text-zinc-300">Lu belum login.</p>
          <div className="flex gap-3">
            <Link href="/login" className="btn">Login</Link>
            <Link href="/register" className="btn-ghost">Daftar</Link>
          </div>
        </div>
      )}

      {me && (
        <div className="glass rounded-2xl p-6 space-y-5">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-500">Nama</div>
            <div className="text-zinc-100 font-semibold mt-1 break-words">{me.display_name}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-500">Email</div>
            <div className="text-zinc-300 mt-1 break-words">{me.email}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-500">Role</div>
            <div className="mt-1">
              <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200">
                {me.role === "admin" ? "Admin" : me.role === "scout" ? "Scout" : "Member"}
              </span>
              {me.role === "admin" && (
                <Link href="/admin" className="ml-3 text-xs text-red-300 hover:text-red-200 underline underline-offset-2">Buka dashboard moderasi</Link>
              )}
            </div>
          </div>
          {err && <p className="text-sm text-red-400" role="alert">{err}</p>}
          <button onClick={logout} disabled={busy} className="btn-ghost w-full">
            {busy ? "Keluar…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
