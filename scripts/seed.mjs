// DEMO seed — every event title is prefixed [DEMO] and MUST NOT be presented as a real event.
// Run: npm run seed   (idempotent: wipes and reseeds)
import Database from "better-sqlite3";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const DB_PATH = process.env.PANGGUNG_DB || path.join(process.cwd(), "data", "panggung.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(fs.readFileSync(path.join(process.cwd(), "src", "db", "schema.sql"), "utf8"));

const hash = (pw) => { const s = crypto.randomBytes(16).toString("hex"); return `${s}:${crypto.scryptSync(pw, s, 32).toString("hex")}`; };

for (const t of ["scout_contributions","moderation_log","reports","artist_requests","event_interest","event_genres","event_artists","event_sources","sessions","events","artists","genres","venues","cities","users"]) db.exec(`DELETE FROM ${t}`);

const city = db.prepare("INSERT INTO cities (name, region) VALUES (?, ?)");
const cities = {};
for (const [n, r] of [["Jakarta","DKI Jakarta"],["Bandung","Jawa Barat"],["Yogyakarta","DI Yogyakarta"],["Surabaya","Jawa Timur"],["Semarang","Jawa Tengah"],["Denpasar","Bali"]])
  cities[n] = city.run(n, r).lastInsertRowid;

const venue = db.prepare("INSERT INTO venues (city_id, name) VALUES (?, ?)");
const venues = { jakarta1: venue.run(cities.Jakarta, "Venue Demo Hall (Jakarta)").lastInsertRowid,
  jakarta2: venue.run(cities.Jakarta, "Venue Demo Amphitheatre").lastInsertRowid,
  bandung1: venue.run(cities.Bandung, "Venue Demo Warehouse").lastInsertRowid,
  yogya1: venue.run(cities.Yogyakarta, "Venue Demo Culture Park").lastInsertRowid,
  surabaya1: venue.run(cities.Surabaya, "Venue Demo Arena").lastInsertRowid };

const genre = db.prepare("INSERT INTO genres (name) VALUES (?)");
const genres = {};
for (const g of ["Indie","Rock","Pop","Hip-Hop","Electronic","Jazz","Folk","Metal"]) genres[g] = genre.run(g).lastInsertRowid;

const artist = db.prepare("INSERT INTO artists (name, slug, genre_id) VALUES (?, ?, ?)");
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const artists = {};
for (const [n, g] of [["Band Demo Satu","Indie"],["Demo Rock Trio","Rock"],["DJ Demo Elektronik","Electronic"],["Demo Jazz Quartet","Jazz"],["Demo Folk Duo","Folk"],["Demo Rap Crew","Hip-Hop"],["Demo Metal Lokal","Metal"]])
  artists[n] = artist.run(n, slugify(n), genres[g]).lastInsertRowid;

const adminId = db.prepare("INSERT INTO users (display_name, email, password_hash, role) VALUES (?, ?, ?, 'admin')")
  .run("Mod Demo", "admin@panggung.demo", hash("demo12345")).lastInsertRowid;
const scoutId = db.prepare("INSERT INTO users (display_name, email, password_hash, role) VALUES (?, ?, ?, 'scout')")
  .run("scout.pseudonym", "scout@panggung.demo", hash("demo12345")).lastInsertRowid;
const fanId = db.prepare("INSERT INTO users (display_name, email, password_hash, role) VALUES (?, ?, ?, 'scout')")
  .run("fan.demo", "fan@panggung.demo", hash("demo12345")).lastInsertRowid;

const insEvent = db.prepare(`INSERT INTO events
  (title, slug, description, type, starts_at, ends_at, city_id, venue_id, venue_text, ticket_url, price_info, status, verification_status, created_by, submitted_by_role)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const iso = (d) => new Date(d).toISOString();
const events = [
  ["[DEMO] Night of Local Indie", "concert", "Jakarta", "jakarta1", "Band Demo Satu,Demo Folk Duo", "Indie", 12, "verified", "source_checked", 150000],
  ["[DEMO] Warehouse Session Vol. 3", "gig", "Bandung", "bandung1", "Demo Rock Trio", "Rock", 5, "verified", "source_checked", 75000],
  ["[DEMO] Electronic Sundown", "festival", "Denpasar", null, "DJ Demo Elektronik", "Electronic", 30, "verified", "unverified", 250000],
  ["[DEMO] Jazz at the Park", "gig", "Yogyakarta", "yogya1", "Demo Jazz Quartet", "Jazz", 9, "verified", "source_checked", 100000],
  ["[DEMO] Rap Showcase", "concert", "Surabaya", "surabaya1", "Demo Rap Crew", "Hip-Hop", 20, "verified", "unverified", 120000],
  ["[DEMO] Metal Night Out", "gig", "Semarang", null, "Demo Metal Lokal", "Metal", 3, "cancelled", "source_checked", 90000],
  ["[DEMO] Folk Evening (pending)", "gig", "Jakarta", "jakarta2", "Demo Folk Duo", "Folk", 15, "pending_review", "unverified", 80000],
  ["[DEMO] Big Demo Fest (pending)", "festival", "Bandung", null, "Band Demo Satu,Demo Rock Trio,Demo Rap Crew", "Indie", 45, "pending_review", "unverified", 300000],
];

let n = 0;
for (const [title, type, cityName, vKey, artistList, genreName, daysFromNow, status, verif, price] of events) {
  const starts = iso(Date.now() + Number(daysFromNow) * 86400e3);
  const id = insEvent.run(title, slugify(title), "DEMO seed data — not a real event. Replace before any public launch.",
    type, starts, null, cities[cityName], vKey ? venues[vKey] : null, vKey ? "" : "Venue TBA (demo)", null,
    `Rp ${Number(price).toLocaleString("id-ID")} (demo price)`, status, verif, scoutId, "scout").lastInsertRowid;
  for (const [i, name] of artistList.split(",").entries())
    db.prepare("INSERT OR IGNORE INTO event_artists (event_id, artist_id, lineup_order) VALUES (?, ?, ?)").run(id, artists[name], i);
  db.prepare("INSERT OR IGNORE INTO event_genres (event_id, genre_id) VALUES (?, ?)").run(id, genres[genreName]);
  db.prepare("INSERT INTO event_sources (event_id, source_url, source_type, submitted_by) VALUES (?, ?, ?, ?)")
    .run(id, "https://example.com/demo-source/" + slugify(title), "website", scoutId);
  db.prepare("INSERT INTO scout_contributions (user_id, event_id, contribution_type, validation_status, reputation_points) VALUES (?, ?, 'submitted', ?, ?)")
    .run(scoutId, id, status === "pending_review" ? "pending" : "validated", status === "pending_review" ? 0 : 10);
  n++;
}

// interest + artist requests (demo)
const verifiedIds = db.prepare("SELECT id FROM events WHERE status='verified'").all().map(r => r.id);
db.prepare("INSERT OR IGNORE INTO event_interest (user_id, event_id) VALUES (?, ?)").run(fanId, verifiedIds[0]);
db.prepare("INSERT OR IGNORE INTO event_interest (user_id, event_id) VALUES (?, ?)").run(scoutId, verifiedIds[0]);
for (const city of ["Jakarta","Bandung","Yogyakarta"]) {
  db.prepare("INSERT OR IGNORE INTO artist_requests (user_id, artist_id, city_id) VALUES (?, ?, ?)").run(fanId, artists["Demo Rock Trio"], cities[city]);
}
db.prepare("INSERT OR IGNORE INTO artist_requests (user_id, artist_id, city_id) VALUES (?, ?, ?)").run(fanId, artists["DJ Demo Elektronik"], cities.Jakarta);
db.prepare("INSERT OR IGNORE INTO artist_requests (user_id, artist_id, city_id) VALUES (?, ?, ?)").run(scoutId, artists["DJ Demo Elektronik"], cities.Jakarta);

console.log(`Seeded ${n} DEMO events, 3 users, 6 cities.`);
console.log("DEMO logins (dev only): admin@panggung.demo / demo12345 (admin), scout@panggung.demo / demo12345");
