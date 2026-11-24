// Real gigs sourced from Fasticket & Scenepass (public listings, covers © respective EOs).
import Database from 'libsql';
const db = new Database(process.env.TURSO_DATABASE_URL, { authToken: process.env.TURSO_AUTH_TOKEN });

const gigs = [
  { title: 'Kolektif Burung Biru: ROAR', slug: 'kolektif-burung-biru-roar-2026', type: 'gig',
    starts_at: '2026-12-04T12:00:00Z', venue: 'Gedung SMK Negeri 3 Jombang', city: 'Jombang',
    desc: 'Gig indie di Jombang. Tiket via Fasticket.',
    price: 'Mulai Rp 75.000', poster: 'https://cdn.fasticket.id/events/covers/01M7VVV9T5KDWX50HB74AQATMN.jpg',
    src: 'https://fasticket.id/acara/kolektif-burung-biru-roar', artists: ['Kolektif Burung Biru'] },
  { title: 'BEKASI AMBYAR X KOPLOVE', slug: 'bekasi-ambyar-koplove-2026', type: 'festival',
    starts_at: '2026-12-11T09:00:00Z', venue: 'Grand Kamala Lagoon', city: 'Bekasi',
    desc: 'Festival koplo & dangdut di Bekasi. Tiket via Fasticket.',
    price: 'Mulai Rp 88.000', poster: 'https://cdn.fasticket.id/events/covers/01M51SWBRF2N06N3HX0NH12EW7.png',
    src: 'https://fasticket.id/acara/bekasi-ambyar-x-koplove', artists: [] },
  { title: 'SWARA PRAMBANAN 2026', slug: 'swara-prambanan-2026', type: 'concert',
    starts_at: '2026-12-31T11:00:00Z', venue: 'Candi Prambanan', city: 'Yogyakarta',
    desc: 'Konser tahun baru dengan latar Candi Prambanan. Tiket via Fasticket.',
    price: 'Mulai Rp 50.000', poster: 'https://cdn.fasticket.id/events/covers/01M72T0V2JSGZZC4C6NTJWKF79.png',
    src: 'https://fasticket.id/acara/swara-prambanan-2026', artists: [] },
  { title: 'GRAB IT FAST 2027', slug: 'grab-it-fast-2027', type: 'festival',
    starts_at: '2027-01-30T03:00:00Z', venue: 'Vivo Mall Bogor', city: 'Bogor',
    desc: 'Festival musik di Bogor. Tiket via Fasticket.',
    price: 'Mulai Rp 85.000', poster: 'https://cdn.fasticket.id/events/covers/01KZZK7209YJSVZF272A6PB1DZ.png',
    src: 'https://fasticket.id/acara/grab-it-fast-2027', artists: [] },
  { title: 'LOYAL GIGS: THE RUMJACKS LIVE IN BANDUNG', slug: 'loyal-gigs-rumjacks-bandung', type: 'gig',
    starts_at: '2026-12-06T12:00:00Z', venue: 'BIKASOGA, Bandung', city: 'Bandung',
    desc: 'Celtic-punk The Rumjacks (Australia) live di Bandung. Tiket via Scenepass.',
    price: 'Mulai Rp 75.000', poster: 'https://scenepass.id/storage/events/thumbnail/s0WqPTdhixB2QgSVXDWqL1rJPqa4vqhjObycIUQO.jpg',
    src: 'https://scenepass.id/events/loyal-gigs-the-rumjacks-live-in-bandung-1793351662', artists: ['The Rumjacks'] },
];

const admin = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get();
const adminId = admin ? admin.id : null;
const getCity = (name) => {
  const row = db.prepare('SELECT id FROM cities WHERE lower(name)=lower(?)').get(name);
  if (row) return row.id;
  const info = db.prepare("INSERT INTO cities (name, region) VALUES (?, '')").run(name);
  return Number(info.lastInsertRowid);
};
let added = 0;
for (const g of gigs) {
  if (db.prepare('SELECT id FROM events WHERE slug=?').get(g.slug)) { console.log('skip', g.slug); continue; }
  const cid = getCity(g.city);
  const info = db.prepare(
    `INSERT INTO events (title, slug, description, type, starts_at, city_id, venue_text, poster_path, price_info,
       status, verification_status, created_by, submitted_by_role)
     VALUES (?,?,?,?,?,?,?,?,?,'verified','source_checked',?,'community')`
  ).run(g.title, g.slug, g.desc, g.type, g.starts_at, cid, g.venue, g.poster, g.price, adminId);
  const eid = Number(info.lastInsertRowid);
  db.prepare("INSERT INTO event_sources (event_id, source_url, source_type, checked_at) VALUES (?,?,'website',datetime('now'))").run(eid, g.src);
  for (const a of g.artists) {
    const aslug = a.toLowerCase().normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
    db.prepare('INSERT INTO artists (name, slug) VALUES (?, ?) ON CONFLICT(slug) DO NOTHING').run(a, aslug);
    const ar = db.prepare('SELECT id FROM artists WHERE slug=?').get(aslug);
    db.prepare('INSERT OR IGNORE INTO event_artists (event_id, artist_id, lineup_order) VALUES (?, ?, 0)').run(eid, ar.id);
  }
  added++;
}
console.log('added:', added);
