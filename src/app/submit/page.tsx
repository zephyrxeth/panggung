import { cities } from "@/lib/queries";
import { db } from "@/db";
import SubmitForm from "@/components/SubmitForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Submit event" };

export default function SubmitPage() {
  const cityRows = cities();
  const venues = db.prepare("SELECT id, name, city_id FROM venues").all() as any[];
  const enriched = cityRows.map(c => ({ ...c, venues: venues.filter(v => v.city_id === c.id).map(v => ({ id: v.id, name: v.name })) }));
  return (
    <div className="space-y-5 max-w-[1440px] mx-auto px-4">
      <section>
        <h1 className="text-2xl font-black tracking-tight">Submit event</h1>
        <p className="text-sm text-muted mt-1">Bantu komunitas nemu event baru. Wajib sertakan sumber. Listing masuk <b>Pending Review</b> dulu — gak otomatis verified.</p>
      </section>
      <SubmitForm cities={enriched as any} />
    </div>
  );
}
