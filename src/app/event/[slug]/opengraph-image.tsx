import { ImageResponse } from "next/og";
import { getEventBySlug } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = Promise<{ slug: string }>;

export default async function OgImage({ params }: { params: Params }) {
  const { slug } = await params;
  const e = getEventBySlug(slug);
  if (!e) return new ImageResponse(<div style={{ background: "#0a0a0a", width: "100%", height: "100%" }} />, size);
  const d = new Date(e.starts_at);
  const dateStr = d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex",
        background: "linear-gradient(135deg, #1c0e0e 0%, #0a0a0a 60%)",
        fontFamily: "sans-serif", color: "#f5f5f4",
      }}>
        {e.poster_path && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.poster_path} width={480} height={630} style={{ objectFit: "cover" }} alt="" />
        )}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, color: "#ef4444", fontWeight: 800, textTransform: "uppercase", letterSpacing: 2 }}>
            <span>◆</span><span>{e.type} · {e.city}</span>
          </div>
          <div style={{ fontSize: e.title.length > 60 ? 44 : 56, fontWeight: 900, lineHeight: 1.1, marginTop: 20, textTransform: "uppercase" }}>
            {e.title}
          </div>
          <div style={{ fontSize: 28, color: "#a1a1aa", marginTop: 24 }}>{dateStr}</div>
          <div style={{ fontSize: 28, color: "#a1a1aa" }}>{e.venue_name || e.venue_text || "Venue TBA"}</div>
          <div style={{ fontSize: 26, color: "#ef4444", fontWeight: 800, marginTop: 24 }}>{e.price_info || "Info tiket di sumber resmi"}</div>
          <div style={{ fontSize: 20, color: "#71717a", marginTop: 32 }}>SIDESTAGE — live music di kotamu</div>
        </div>
      </div>
    ),
    size
  );
}
