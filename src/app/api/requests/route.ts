import { NextResponse } from "next/server";
import { db } from "@/db";
import { artistRequestStats } from "@/lib/queries";
import { getUser, AuthError } from "@/lib/auth";
import { apiError, rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ requests: artistRequestStats() });
}

// POST { artist_id | artist_name, city_id } — one request per user+artist+city
export async function POST(req: Request) {
  try {
    const user = getUser(req);
    if (!user) throw new AuthError("Login required to request an artist");
    if (!rateLimit(`request:${user.id}`, 10, 3600)) return NextResponse.json({ error: "Rate limit" }, { status: 429 });
    const b = await req.json().catch(() => ({})) as any;
    let artistId = Number(b.artist_id);
    if (!artistId && b.artist_name) {
      const name = String(b.artist_name).trim().slice(0, 80);
      if (!name) return NextResponse.json({ error: "artist_name empty" }, { status: 400 });
      const { slugify } = await import("@/db");
      const aSlug = slugify(name);
      db.prepare("INSERT INTO artists (name, slug) VALUES (?, ?) ON CONFLICT(slug) DO NOTHING").run(name, aSlug);
      artistId = (db.prepare("SELECT id FROM artists WHERE slug = ?").get(aSlug) as any).id;
    }
    const cityId = Number(b.city_id);
    if (!artistId || !cityId) return NextResponse.json({ error: "artist and city required" }, { status: 400 });
    try {
      db.prepare("INSERT INTO artist_requests (user_id, artist_id, city_id) VALUES (?, ?, ?)").run(user.id, artistId, cityId);
    } catch {
      return NextResponse.json({ error: "You already requested this artist in this city" }, { status: 409 });
    }
    const n = (db.prepare("SELECT COUNT(*) n FROM artist_requests WHERE artist_id=? AND city_id=?").get(artistId, cityId) as any).n;
    return NextResponse.json({ ok: true, total_requests: n });
  } catch (e) { return apiError(e); }
}
