import { scoutProfile } from "@/lib/queries";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
type Params = Promise<{ id: string }>;

export default async function ScoutPage({ params }: { params: Params }) {
  const { id } = await params;
  const p = scoutProfile(Number(id));
  if (!p) notFound();
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black tracking-tight">{p.user.display_name}</h1>
        <p className="text-sm text-muted">Concert Scout sejak {p.user.created_at.slice(0, 10)} · <b className="text-accent">{p.points} poin reputasi</b> <span className="text-xs">(dari kontribusi tervalidasi, bukan jumlah submit)</span></p>
      </header>
      <section className="space-y-2">
        <h2 className="font-bold text-sm">Kontribusi</h2>
        {p.contributions.length === 0 ? <p className="text-sm text-muted">Belum ada kontribusi.</p> : p.contributions.map((c, i) => (
          <div key={i} className="flex justify-between rounded border border-line bg-zinc-900 px-3 py-2 text-sm">
            <span><a className="underline decoration-line hover:text-accent" href={`/event/${c.slug}`}>{c.title}</a> <span className="text-xs text-muted">({c.contribution_type})</span></span>
            <span className={c.validation_status === "validated" ? "badge-verified" : c.validation_status === "rejected" ? "badge-rejected" : "badge-pending"}>{c.validation_status}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
