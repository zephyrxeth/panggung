import Link from "next/link";
import { cities } from "@/lib/queries";
import AuthUserPicker from "@/components/AuthUserPicker";
import { artistRequestStats } from "@/lib/queries";

export const dynamic = "force-dynamic";
type SP = Promise<Record<string, string | undefined>>;

export const metadata = { title: "Request artis" };

export default async function RequestPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const stats = artistRequestStats();
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-black tracking-tight">Tour Radar — request artis ke kotamu</h1>
        <p className="text-sm text-muted mt-1">Ngalihin artis yang belum diumumin main di kotamu. Satu user boleh satu request per artis/kota. <b>Request bukan komitmen beli tiket</b> — ini sinyal minat buat promoter.</p>
      </section>

      <AuthUserPicker cities={cities()} prefillArtist={sp.artist || ""} />

      <section>
        <h2 className="font-bold text-sm mb-2">Sinyal paling ramai</h2>
        {stats.length === 0 ? (
          <p className="text-sm text-muted rounded-xl border border-dashed border-line bg-zinc-900 p-6 text-center">Belum ada request. Jadi yang pertama!</p>
        ) : (
          <ul className="space-y-2">
            {stats.map((s, i) => (
              <li key={`${s.slug}-${s.city}`} className="flex items-center justify-between rounded border border-line bg-zinc-900 px-4 py-2.5">
                <span className="text-sm"><b>{i + 1}. {s.name}</b> <span className="text-muted">di {s.city}</span></span>
                <span className="text-sm font-black text-accent">{s.requests} request</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
