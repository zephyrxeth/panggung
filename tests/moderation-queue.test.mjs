// Coverage tambahan: moderation queue (GET) + interest duplicate prevention.
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { readFileSync } from "fs";

const dir = mkdtempSync(join(tmpdir(), "sidestage-test2-"));
process.env.SIDESTAGE_DB = join(dir, "test.db");
process.env.NODE_ENV = "test";

const { db } = await import("../src/db/index.ts");
const schema = readFileSync(new URL("../src/db/schema.sql", import.meta.url), "utf8");
for (const stmt of schema.split(";")) { if (stmt.trim()) { try { db.exec(stmt); } catch {} } }

db.exec(`INSERT INTO cities (id, name, region) VALUES (1, 'Jakarta', 'DKI')`);
db.exec(`INSERT INTO users (id, display_name, email, password_hash, role) VALUES (1, 'Admin', 'a@t.dev', 'x:y', 'admin'), (2, 'User', 'u@t.dev', 'x:y', 'user')`);
const ev = db.prepare(`INSERT INTO events (title, slug, description, type, starts_at, city_id, status, verification_status, created_by)
  VALUES ('Queue Gig','queue-gig','desc','gig','2026-12-01 12:00:00',1,'pending_review','unverified',2)`).run();
const eventId = Number(ev.lastInsertRowid);
db.prepare("INSERT INTO event_sources (event_id, source_url, source_type, submitted_by) VALUES (?, 'https://ig.com/q', 'instagram', 2)").run(eventId);
db.prepare("INSERT INTO artists (name, slug) VALUES ('Band QA', 'band-qa')").run();
db.prepare("INSERT INTO event_artists (event_id, artist_id, lineup_order) VALUES (?, (SELECT id FROM artists WHERE slug='band-qa'), 0)").run(eventId);
const adminToken = "c".repeat(48), userToken = "d".repeat(48);
db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, 1, datetime('now','+1 hour'))").run(adminToken);
db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, 2, datetime('now','+1 hour'))").run(userToken);

const adminRoute = await import("../src/app/api/admin/events/route.ts");
const interestRoute = await import("../src/app/api/interest/route.ts");

let fail = 0;
const check = (name, cond) => { if (!cond) fail++; console.log((cond ? "PASS " : "FAIL ") + name); };
const req = (url, cookie, method, body) => new Request(url, { method: method || "GET", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });

let r = await adminRoute.GET(req("http://local/api/admin/events", `pg_session=${adminToken}`));
check("queue GET 200 (admin)", r.status === 200);
let d = await r.json();
check("queue contains pending event", d.queue.some(e => e.id === eventId));
const qe = d.queue.find(e => e.id === eventId);
check("queue sources url+type", qe.sources && qe.sources[0] && qe.sources[0].source_url === "https://ig.com/q");
check("queue lineup artists", qe.artists && qe.artists.includes("Band QA"));
check("queue exposes verif+poster+price fields", ["verification_status","poster_path","price_info","description","venue_text"].every(k => k in qe));
check("queue sorted pending first", d.queue[0].status === "pending_review");

r = await adminRoute.GET(req("http://local/api/admin/events", `pg_session=${userToken}`));
check("queue GET user 403", r.status === 403);
r = await adminRoute.GET(req("http://local/api/admin/events"));
check("queue GET anon 401", r.status === 401);

db.exec("UPDATE events SET status='verified' WHERE id = 1");
r = await interestRoute.POST(req("http://local/api/interest", `pg_session=${userToken}`, "POST", { event_id: eventId }));
check("interest add 200", r.status === 200);
d = await r.json();
const count1 = d.interested;
r = await interestRoute.POST(req("http://local/api/interest", `pg_session=${userToken}`, "POST", { event_id: eventId }));
d = await r.json();
check("duplicate interest not double-count", d.interested === count1 && count1 === 1);
const nRows = db.prepare("SELECT COUNT(*) n FROM event_interest WHERE event_id = ? AND user_id = 2").get(eventId).n;
check("single interest row in DB", nRows === 1);
r = await interestRoute.POST(req("http://local/api/interest", undefined, "POST", { event_id: eventId }));
check("interest anonymous 401", r.status === 401);

process.exit(fail ? 1 : 0);
