// Moderation flow tests — isolated temp SQLite DB, fixture admin session.
// Never touches production: SIDESTAGE_DB points at a temp file before any import.
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { readFileSync } from "fs";

const dir = mkdtempSync(join(tmpdir(), "sidestage-test-"));
process.env.SIDESTAGE_DB = join(dir, "test.db");
process.env.NODE_ENV = "test";

const { db } = await import("../src/db/index.ts");
const schema = readFileSync(new URL("../src/db/schema.sql", import.meta.url), "utf8");
for (const stmt of schema.split(";")) {
  if (stmt.trim()) { try { db.exec(stmt); } catch { /* idempotent DDL */ } }
}

// seed minimal fixture
db.exec(`INSERT INTO cities (id, name, region) VALUES (1, 'Jakarta', 'DKI')`);
db.exec(`INSERT INTO users (id, display_name, email, password_hash, role) VALUES (1, 'Admin', 'a@t.dev', 'x:y', 'admin'), (2, 'User', 'u@t.dev', 'x:y', 'user')`);
const ev = db.prepare(`INSERT INTO events (title, slug, description, type, starts_at, city_id, status, verification_status, created_by)
  VALUES ('Test Gig','test-gig','desc','gig','2026-12-01 12:00:00',1,'pending_review','unverified',2)`).run();
const eventId = Number(ev.lastInsertRowid);
db.prepare("INSERT INTO event_sources (event_id, source_url, source_type, submitted_by) VALUES (?, 'https://ig.com/x', 'instagram', 2)").run(eventId);
const adminToken = "a".repeat(48), userToken = "b".repeat(48);
db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, 1, datetime('now','+1 hour'))").run(adminToken);
db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, 2, datetime('now','+1 hour'))").run(userToken);

const { POST } = await import("../src/app/api/admin/events/route.ts");

let fail = 0;
const check = (name, cond) => { if (!cond) fail++; console.log(`${cond ? "PASS" : "FAIL"} ${name}`); };

async function moderate(token, body) {
  const r = await POST(new Request("http://local/api/admin/events", {
    method: "POST", headers: { "content-type": "application/json", cookie: `pg_session=${token}` },
    body: JSON.stringify(body),
  }));
  return { status: r.status, json: await r.json() };
}

// 1 + 2 + 3: admin approves -> status verified + verification source_checked + checked_at set
let res = await moderate(adminToken, { id: eventId, action: "approve", reason: "source looked fine" });
check("admin approve returns 200", res.status === 200);
let row = db.prepare("SELECT status, verification_status FROM events WHERE id = ?").get(eventId);
check("approval publishes event", row.status === "verified");
check("approval sets verification source_checked", row.verification_status === "source_checked");
let src = db.prepare("SELECT checked_at FROM event_sources WHERE event_id = ?").get(eventId);
check("approval stamps source checked_at", !!src.checked_at);

// 6: moderation log preserves action + reason
let log = db.prepare("SELECT action, reason, moderator_id FROM moderation_log WHERE target_id = ? ORDER BY id DESC LIMIT 1").get(eventId);
check("log action approve", log && log.action === "approve");
check("log preserves reason + moderator", log && log.reason.includes("source looked fine") && log.moderator_id === 1);

// 4: re-verify existing public event -> official, status unchanged
res = await moderate(adminToken, { id: eventId, action: "verify", verification_status: "official" });
check("verify returns 200", res.status === 200);
row = db.prepare("SELECT status, verification_status FROM events WHERE id = ?").get(eventId);
check("re-verify keeps publication status", row.status === "verified");
check("re-verify upgrades to official", row.verification_status === "official");

// 5: unauthorized users cannot moderate
res = await moderate(userToken, { id: eventId, action: "approve" });
check("non-admin rejected (403)", res.status === 403);
res = await POST(new Request("http://local/api/admin/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: eventId, action: "approve" }) }));
check("anonymous rejected (401)", res.status === 401);
row = db.prepare("SELECT status FROM events WHERE id = ?").get(eventId);
check("event untouched after failed attempts", row.status === "verified");

process.exit(fail ? 1 : 0);
