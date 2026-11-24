import { db } from "@/db";

export type EventRow = {
  id: number; title: string; slug: string; description: string; type: string;
  starts_at: string; ends_at: string | null; city: string; venue_name: string | null;
  venue_text: string; poster_path: string | null; ticket_url: string | null;
  price_info: string; status: string; verification_status: string;
  submitted_by_role: string; display_name: string | null;
  genres: string | null; artists: string | null;
};

const BASE = `
  SELECT e.id, e.title, e.slug, e.description, e.type, e.starts_at, e.ends_at,
         c.name AS city, v.name AS venue_name, e.venue_text, e.poster_path,
         e.ticket_url, e.price_info, e.status, e.verification_status,
         e.submitted_by_role, u.display_name,
         (SELECT group_concat(g.name, ', ') FROM event_genres eg JOIN genres g ON g.id=eg.genre_id WHERE eg.event_id=e.id) AS genres,
         (SELECT group_concat(a.name, ', ') FROM event_artists ea JOIN artists a ON a.id=ea.artist_id WHERE ea.event_id=e.id ORDER BY ea.lineup_order) AS artists
  FROM events e
  JOIN cities c ON c.id = e.city_id
  LEFT JOIN venues v ON v.id = e.venue_id
  LEFT JOIN users u ON u.id = e.created_by`;

export function searchEvents(opts: {
  q?: string; city?: string; from?: string; to?: string; genre?: string;
  type?: string; status?: string; limit?: number;
}): EventRow[] {
  const where: string[] = []; const params: any[] = [];
  const status = opts.status || "verified";
  where.push("e.status = ?"); params.push(status);
  if (opts.q) { where.push("(e.title LIKE ? OR e.description LIKE ? OR EXISTS(SELECT 1 FROM event_artists ea JOIN artists a ON a.id=ea.artist_id WHERE ea.event_id=e.id AND a.name LIKE ?))"); const like = `%${opts.q}%`; params.push(like, like, like); }
  if (opts.city) { where.push("c.name = ?"); params.push(opts.city); }
  if (opts.from) { where.push("e.starts_at >= ?"); params.push(opts.from); }
  if (opts.to) { where.push("e.starts_at <= ?"); params.push(opts.to); }
  if (opts.genre) { where.push("EXISTS(SELECT 1 FROM event_genres eg JOIN genres g ON g.id=eg.genre_id WHERE eg.event_id=e.id AND g.name = ?)"); params.push(opts.genre); }
  if (opts.type) { where.push("e.type = ?"); params.push(opts.type); }
  return db.prepare(`${BASE} WHERE ${where.join(" AND ")} ORDER BY e.starts_at ASC LIMIT ?`)
    .all(...params, opts.limit || 50) as EventRow[];
}

export function getEventBySlug(slug: string): EventRow | null {
  return (db.prepare(`${BASE} WHERE e.slug = ?`).get(slug) as EventRow) || null;
}

export function eventSources(eventId: number) {
  return db.prepare("SELECT source_url, source_type, checked_at FROM event_sources WHERE event_id = ?")
    .all(eventId) as Array<{ source_url: string; source_type: string; checked_at: string }>;
}

export function eventArtists(eventId: number) {
  return db.prepare(
    `SELECT a.name, a.slug, ea.lineup_order, ea.role FROM event_artists ea
     JOIN artists a ON a.id = ea.artist_id WHERE ea.event_id = ? ORDER BY ea.lineup_order`).all(eventId) as {name:string;slug:string;lineup_order:number;role:string}[];
}

export function interestCount(eventId: number) {
  return (db.prepare("SELECT COUNT(*) n FROM event_interest WHERE event_id = ?").get(eventId) as any).n;
}

export function siteStats() {
  const events = (db.prepare("SELECT COUNT(*) n FROM events WHERE status='verified'").get() as any).n;
  const cityCount = (db.prepare("SELECT COUNT(DISTINCT city_id) n FROM events WHERE status='verified'").get() as any).n;
  const artists = (db.prepare("SELECT COUNT(DISTINCT artist_id) n FROM event_artists ea JOIN events e ON e.id=ea.event_id WHERE e.status='verified'").get() as any).n;
  const totalInterest = (db.prepare("SELECT COUNT(*) n FROM event_interest").get() as any).n;
  return { events, cities: cityCount, artists, totalInterest };
}

export function topDemandEvent(): { event: EventRow; interest: number } | null {
  const rows = searchEvents({ limit: 50 });
  let best: { event: EventRow; interest: number } | null = null;
  for (const e of rows) {
    const n = interestCount(e.id);
    if (!best || n > best.interest) best = { event: e, interest: n };
  }
  return best;
}

export function upcomingEvents(limit = 5) {
  return searchEvents({ from: new Date().toISOString(), limit });
}

export function cities() { return db.prepare("SELECT id, name, region FROM cities ORDER BY name").all() as {id:number;name:string;region:string}[]; }
export function genres() { return db.prepare("SELECT id, name FROM genres ORDER BY name").all() as {id:number;name:string}[]; }

export function duplicateCheck(title: string, startsAt: string, cityId: number, venueName: string) {
  return db.prepare(
    `SELECT id, title, slug, status FROM events
     WHERE lower(title) = lower(?) AND date(starts_at) = date(?) AND city_id = ?
       AND status IN ('pending_review','verified','updated')`
  ).get(title, startsAt, cityId)
  || db.prepare(
    `SELECT id, title, slug, status FROM events
     WHERE date(starts_at) = date(?) AND city_id = ? AND venue_id IS NOT NULL
       AND venue_id IN (SELECT id FROM venues WHERE lower(name) = lower(?))
       AND status IN ('pending_review','verified','updated')`
  ).get(startsAt, cityId, venueName) || null;
}

export function artistRequestStats() {
  return db.prepare(
    `SELECT a.name, a.slug, c.name AS city, COUNT(*) AS requests
     FROM artist_requests ar JOIN artists a ON a.id=ar.artist_id JOIN cities c ON c.id=ar.city_id
     GROUP BY ar.artist_id, ar.city_id ORDER BY requests DESC LIMIT 30`).all() as Array<{ name: string; slug: string; city: string; requests: number }>;
}

export function scoutProfile(id: number) {
  const user = db.prepare("SELECT id, display_name, role, created_at FROM users WHERE id = ?").get(id) as any;
  if (!user) return null;
  const contributions = db.prepare(
    `SELECT sc.contribution_type, sc.validation_status, sc.reputation_points, e.title, e.slug, e.status
     FROM scout_contributions sc JOIN events e ON e.id = sc.event_id
     WHERE sc.user_id = ? ORDER BY sc.id DESC`).all(id) as any[];
  const points = contributions.filter(c => c.validation_status === "validated").reduce((s, c) => s + c.reputation_points, 0);
  return { user, contributions, points };
}
