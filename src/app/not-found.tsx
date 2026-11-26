import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-8xl font-black tracking-tighter text-red-400">404</p>
      <h1 className="font-bold text-xl uppercase mt-3">Gak ada di lineup</h1>
      <p className="text-sm text-muted mt-2 max-w-sm mx-auto">Halaman atau event yang lu cari gak ketemu — mungkin udah dicabut atau salah alamat.</p>
      <div className="mt-6 flex justify-center gap-3 flex-wrap">
        <Link href="/" className="btn">Balik ke agenda</Link>
        <Link href="/explore" className="btn-ghost">Jelajah</Link>
        <Link href="/request" className="btn-ghost">Request event</Link>
      </div>
    </div>
  );
}
