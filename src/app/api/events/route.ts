import { NextResponse } from "next/server";
import { db } from "@/db";
import { searchEvents } from "@/lib/queries";
import { getUser, AuthError } from "@/lib/auth";
import { apiError, uniqueSlug, rateLimit } from "@/lib/api";
import { wibLocalToUtc } from "@/lib/tz";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const events = searchEvents({
    q: sp.get("q") || undefined,
    city: sp.get("city") || undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    genre: sp.get("genre") || undefined,
    type: sp.get("type") || undefined,
  });
  return NextResponse.json({ events });
}

const VALID_TYPES = ["gig", "concert", "festival"];
const VALID_SOURCES = ["instagram", "x", "tiktok", "website", "ticketing", "other"];

export async function POST(req: Request) {
  try {
    const user = await (async () => { const u = getUser(req); if (!u) throw new AuthError("Login required to submit an event"); return u; })();
    if (!rateLimit(`submit:${user.id}`, 5, 3600)) return NextResponse.json({ error: "Rate limit: max 5 submissions/hour" }, { status: 429 });
    const b = await req.json().catch(() => ({})) as any;
    const { title, type, starts_at, city_id, venue_id, venue_text, description, source_url, source_type, ticket_url, price_info, artist_names, poster_path } = b;
    if (!title || !starts_at || !city_id || !source_url)
      return NextResponse.json({ error: "title, starts_at, city_id, source_url are required" }, { status: 400 });
    if (!VALID_TYPES.includes(type)) return NextResponse.json({ error: "invalid type" }, { status: 400 });
    if (!VALID_SOURCES.includes(source_type || "other")) return NextResponse.json({ error: "invalid source_type" }, { status: 400 });
    if (!/^https?:\/\//i.test(source_url)) return NextResponse.json({ error: "source_url must be a http(s) URL" }, { status: 400 });
    if (ticket_url && !/^https?:\/\//i.test(ticket_url)) return NextResponse.json({ error: "ticket_url must be a http(s) URL" }, { status: 400 });
    if (poster_path && !/^(\/uploads\/|https?:\/\/)/i.test(poster_path)) return NextResponse.json({ error: "invalid poster_path" }, { status: 400 });
    const cityRow = db.prepare("SELECT id FROM cities WHERE id = ?").get(city_id) as any;
    if (!cityRow) return NextResponse.json({ error: "city_id does not exist" }, { status: 400 });
    let startsUtc: string;
    try { startsUtc = wibLocalToUtc(String(starts_at)); }
    catch { return NextResponse.json({ error: "starts_at must be a datetime-local value (WIB)" }, { status: 400 }); }
    if (venue_id) {
      const v = db.prepare("SELECT id FROM venues WHERE id = ? AND city_id = ?").get(venue_id, city_id) as any;
      if (!v) return NextResponse.json({ error: "selected venue does not belong to the selected city" }, { status: 400 });
    }

    // duplicate detection: title+date+city, or date+city+venue
    const dup = db.prepare(
      `SELECT id, title, slug, status FROM events
       WHERE lower(title)=lower(?) AND date(starts_at)=date(?) AND city_id=?
         AND status IN ('pending_review','verified','updated')`
    ).get(String(title).trim(), starts_at, city_id) as any;
    if (dup) return NextResponse.json({ error: "Possible duplicate", duplicate_of: dup, hint: "A similar event already exists. If it's the same event, do not submit." }, { status: 409 });

    const slug = uniqueSlug("events", title);
    const tx = db.transaction(() => {
      const info = db.prepare(
        `INSERT INTO events (title, slug, description, type, starts_at, city_id, venue_id, venue_text, poster_path, ticket_url, price_info, status, verification_status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', 'unverified', ?)`
      ).run(String(title).trim().slice(0, 140), slug, String(description || "").slice(0, 2000), type,
            startsUtc, city_id, venue_id || null, String(venue_text || "").slice(0, 200),
            poster_path || null, ticket_url && /^https?:\/\//i.test(ticket_url) ? ticket_url : null,
            String(price_info || "").slice(0, 140), user.id);
      const eventId = info.lastInsertRowid as number;
      db.prepare("INSERT INTO event_sources (event_id, source_url, source_type, submitted_by) VALUES (?, ?, ?, ?)")
        .run(eventId, source_url, source_type || "other", user.id);
      for (const [i, name] of (artist_names || []).slice(0, 10).entries()) {
        const n = String(name).trim(); if (!n) continue;
        const aSlug = uniqueSlug("artists", n);
        const a = db.prepare("INSERT INTO artists (name, slug) VALUES (?, ?) ON CONFLICT(slug) DO NOTHING").run(n.slice(0, 80), aSlug);
        const artistId = (a.changes ? a.lastInsertRowid : (db.prepare("SELECT id FROM artists WHERE slug=?").get(aSlug) as any).id) as number;
        db.prepare("INSERT OR IGNORE INTO event_artists (event_id, artist_id, lineup_order) VALUES (?, ?, ?)").run(eventId, artistId, i);
      }
      db.prepare("INSERT INTO scout_contributions (user_id, event_id, contribution_type) VALUES (?, ?, 'submitted')").run(user.id, eventId);
      return eventId;
    });
    const eventId = tx();
    return NextResponse.json({ ok: true, event_id: eventId, slug, status: "pending_review" }, { status: 201 });
  } catch (e) { return apiError(e); }
}
