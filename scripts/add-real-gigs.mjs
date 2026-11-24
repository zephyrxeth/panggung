// Real upcoming gigs (sourced via AsiaLive365, posters © respective promoters).
// status: verified, verification_status: source_checked. Poster hotlinked from promoter/CDN.
import Database from 'libsql';
const db = new Database(process.env.TURSO_DATABASE_URL, { authToken: process.env.TURSO_AUTH_TOKEN });
const CDN = 'https://cdn.sanity.io/images/d0wo52u2/production/';
const q = (w) => `?auto=format&q=75&w=800&fit=max`;
const SRC = 'https://asialive365.com/concerts/jakarta';

const gigs = [
  { title: 'Simple Plan — The Bigger Than You Think! Tour', slug: 'simple-plan-jakarta-2026', type: 'concert',
    starts_at: '2026-11-27T12:00:00Z', venue: 'Tennis Indoor Stadium Senayan', city: 1,
    desc: 'Pop-punk legenda Kanada main di Jakarta. Info & tiket lewat promotor resmi — cek sumber sebelum beli.',
    price: '', poster: CDN + '5c3cf16eb4d5ec83ef799de747f186e480d59876-2560x1440.png' + q(),
    artists: ['Simple Plan'] },
  { title: 'Joyland Sessions 2026', slug: 'joyland-sessions-2026', type: 'festival',
    starts_at: '2026-11-28T09:00:00Z', venue: 'GBK Field Senayan', city: 1,
    desc: 'Festival dua hari di GBK Field: Caribou, Slowdive, ichiko aoba, DOMi & JD BECK, Fazerdaze, Efek Rumah Kaca, Chanpan, Float.',
    price: '', poster: null, artists: ['Caribou', 'Slowdive', 'Efek Rumah Kaca', 'Fazerdaze'] },
  { title: "5 Seconds of Summer — Everyone's A Star! World Tour Asia 2026", slug: '5sos-jakarta-2026', type: 'concert',
    starts_at: '2026-12-06T12:00:00Z', venue: 'Indonesia Arena', city: 1,
    desc: 'Tur Asia 2026 5SOS di Indonesia Arena. Tiket via penjual resmi — link di sumber.',
    price: 'From Rp 910.000', poster: CDN + '3d535d87e3232f98a8f2d2a9b399ae5183e49587-1440x740.webp' + q(),
    artists: ['5 Seconds of Summer'] },
  { title: 'Boyz II Men + Dewa 19 feat. Ari Lasso & Virzha', slug: 'boyz-ii-men-dewa19-jakarta-2026', type: 'concert',
    starts_at: '2026-12-09T11:00:00Z', venue: 'Indonesia Arena', city: 1,
    desc: 'R&B Boys II Men berduet dengan Dewa 19. Harga belum termasuk pajak & biaya admin.',
    price: 'From Rp 300.000', poster: CDN + 'ce1975acfa73a9254f671da5857b6dfaff23cfb2-1600x900.jpg' + q(),
    artists: ['Boyz II Men', 'Dewa 19'] },
  { title: 'Kavana — Second Act Asia Tour 2026 in Jakarta', slug: 'kavana-jakarta-2026', type: 'concert',
    starts_at: '2026-12-12T12:00:00Z', venue: 'Balai Sarbini', city: 1,
    desc: 'Kavana tampil di Balai Sarbini, Jakarta.',
    price: 'From Rp 1.150.000', poster: null, artists: ['Kavana'] },
  { title: "Malcolm Todd — Do That Again Tour", slug: 'malcolm-todd-jakarta-2026', type: 'concert',
    starts_at: '2026-12-12T13:30:00Z', venue: 'GBK Basketball Hall, Senayan', city: 1,
    desc: 'Harga belum termasuk 10% tax dan platform fee.',
    price: 'From Rp 550.000', poster: CDN + '86c8c61e25ef261b1edf6dde3fe3f7afd95b81cc-2000x1111.png' + q(),
    artists: ['Malcolm Todd'] },
  { title: 'Djakarta Warehouse Project 2026', slug: 'dwp-2026', type: 'festival',
    starts_at: '2026-12-11T09:00:00Z', venue: 'Jakarta International Expo (JIExpo)', city: 1,
    desc: 'Festival EDM terbesar Jakarta: Alok, Afrojack, R3HAB, Axwell Λ Ingrosso, Dimension, Eli & Fur, Cosmic Gate.',
    price: '', poster: null, artists: ['Afrojack', 'Alok', 'R3HAB', 'Axwell Λ Ingrosso'] },
  { title: 'BIGBANG 2026–2027 WORLD TOUR <XX:COSMOS> in Jakarta', slug: 'bigbang-jakarta-2027', type: 'concert',
    starts_at: '2027-01-16T12:00:00Z', venue: 'Jakarta International Stadium', city: 1,
    desc: 'Dua hari: 16–17 Januari 2027. Harga belum termasuk 10% tax dan 6% platform fee.',
    price: 'From Rp 1.550.000', poster: CDN + 'ecf572a68f52a6a1fea00f0a31d092856fb8e304-1440x800.jpg' + q(),
    artists: ['BIGBANG'] },
  { title: 'WESTLIFE 25: The Anniversary World Tour — Live in Jakarta', slug: 'westlife-jakarta-2027', type: 'concert',
    starts_at: '2027-01-23T12:00:00Z', venue: 'Gelora Bung Karno Main Stadium', city: 1,
    desc: 'Tur ulang tahun 25 tahun Westlife di Stadion Utama GBK.',
    price: 'From Rp 850.000', poster: CDN + 'f0662149f59394a2926483187e0a2972b2dc8910-2880x1600.jpg' + q(),
    artists: ['Westlife'] },
  { title: "ENHYPEN WORLD TOUR 'BLOOD SAGA' in Jakarta", slug: 'enhypen-jakarta-2027', type: 'concert',
    starts_at: '2027-01-23T12:00:00Z', venue: 'Jakarta International Stadium', city: 1,
    desc: 'Harga belum termasuk 10% tax dan 6% platform fee.',
    price: 'From Rp 1.450.000', poster: null, artists: ['ENHYPEN'] },
];

const admin = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get();
const adminId = admin ? admin.id : null;
let added = 0, skipped = 0;
for (const g of gigs) {
  const dup = db.prepare('SELECT id FROM events WHERE slug=?').get(g.slug);
  if (dup) { skipped++; continue; }
  const info = db.prepare(
    `INSERT INTO events (title, slug, description, type, starts_at, city_id, venue_text, poster_path, price_info,
       status, verification_status, created_by, submitted_by_role)
     VALUES (?,?,?,?,?,?,?,?,?,'verified','source_checked',?,'community')`
  ).run(g.title, g.slug, g.desc, g.type, g.starts_at, g.city, g.venue, g.poster, g.price, adminId);
  const eid = Number(info.lastInsertRowid);
  db.prepare("INSERT INTO event_sources (event_id, source_url, source_type, checked_at) VALUES (?,?,'website',datetime('now'))").run(eid, SRC);
  for (const a of g.artists) {
    const aslug = a.toLowerCase().normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
    db.prepare('INSERT INTO artists (name, slug) VALUES (?, ?) ON CONFLICT(slug) DO NOTHING').run(a, aslug);
    const ar = db.prepare('SELECT id FROM artists WHERE slug=?').get(aslug);
    db.prepare('INSERT OR IGNORE INTO event_artists (event_id, artist_id, lineup_order) VALUES (?, ?, 0)').run(eid, ar.id);
  }
  added++;
}
console.log(`added: ${added}, skipped(dup): ${skipped}`);
console.log(db.prepare("SELECT count(*) c FROM events WHERE status='verified'").get());
