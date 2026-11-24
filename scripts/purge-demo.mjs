import Database from 'libsql';
const db = new Database(process.env.TURSO_DATABASE_URL, { authToken: process.env.TURSO_AUTH_TOKEN });
const demos = db.prepare("SELECT id FROM events WHERE title LIKE '[DEMO]%'").all();
const ids = demos.map(d => d.id);
console.log('demo events:', ids.length);
for (const t of ['interests','reports','event_artists','event_sources'])
  for (const id of ids) db.prepare(`DELETE FROM ${t} WHERE event_id=?`).run(id);
const r = db.prepare("DELETE FROM events WHERE title LIKE '[DEMO]%'").run();
console.log('deleted:', r.changes, '| remaining:', db.prepare("SELECT count(*) c FROM events").get().c);
