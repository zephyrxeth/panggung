# Panggung — Concert Discovery Platform

Concert/gig discovery berbasis komunitas (Bahasa Indonesia, mobile-first). Dibangun sesuai agent brief: MVP functional, database nyata, tanpa data/kolaborasi event palsu (semua seed data ber-prefix `[DEMO]`), arsitektur siap untuk fitur Demand Signal & promoter.

## 3 Pilar → Implementasi

1. **Discovery** — search/filter event (kata kunci, kota, genre, tipe, rentang tanggal), halaman detail (lineup, venue, sumber, harga), feed hanya event `verified|updated|cancelled`.
2. **Community-sourced listings** — siapa pun bisa submit event (`/submit`, wajib sumber URL; ticketing platform diblokir agar tidak jadi scraping), duplikat terdeteksi (judul mirip + tanggal + kota → HTTP 409 + link duplikat), semua submission masuk `pending_review` dan hanya tampil setelah moderator approve (`/admin`).
3. **Demand Signal** — "Mark me interested" per event, dan **Tour Radar**: request artis per kota, agregat di `/request`, profil scout publik `/scout/[id]` dengan poin reputasi dari kontribusi tervalidasi.

## Stack ($0)

- **Next.js 14 (App Router)** — server components untuk read, route handlers untuk API.
- **SQLite via better-sqlite3** (WAL) — DB file `data/panggung.db`. SQL portabel → migrasi Turso/Neon/Postgres nanti tinggal ganti driver.
- **Tailwind CSS** — mobile-first, light theme, satu aksen biru.
- **Auth self-hosted** — password scrypt (crypto bawaan Node), session cookie HttpOnly 30 hari, tanpa provider eksternal.
- Upload poster: filesystem lokal, ≤2MB, png/jpg/webp.

## Skema (15 tabel)

`users, cities, venues, genres, artists, events, event_genres, event_artists, event_sources, event_interest, artist_requests, reports, moderation_log, sessions, scout_contributions` — lihat `src/db/schema.sql`.

Status event: `verified | pending_review | cancelled | rejected | updated`.

## Jalankan

```bash
npm install
npm run seed     # data DEMO (idempotent, wipe+reseed)
npm run dev      # atau: npm run build && npm start
```

Server default `:3000`. Env opsional: `PANGGUNG_DB` (path DB), `PANGGUNG_SECRET`.

Demo login (dev only): `admin@panggung.demo` / `demo12345` (admin), `scout@panggung.demo` / `demo12345`.

## API

| Endpoint | Method | Catatan |
|---|---|---|
| `/api/events` | GET/POST | GET: filter q/city/genre/type/from/to. POST: submit (login, rate 5/jam, dup-check 409) |
| `/api/interest` | POST | 1 per user+event; hanya event verified/updated |
| `/api/requests` | GET/POST | Tour Radar; 1 per user+artist+kota |
| `/api/reports` | POST | 5 alasan; rate 10/jam/IP |
| `/api/upload` | POST | poster ≤2MB png/jpg/webp |
| `/api/auth/{register,login,logout}` | POST | password min 8 |
| `/api/auth/me` | GET | user session |
| `/api/admin/events` | GET/POST | requireAdmin; approve/reject/cancel/merge/edit + log |

Rate limiting in-memory per IP/user; di produksi multi-instance ganti ke Redis.

## Roadmap (sesuai brief — future)

- Email verification + anti-spam lebih kuat.
- Demand Signal dashboard promoter (agregat artist_requests + event_interest).
- Notifikasi "artis X datang ke kotamu".
- Migrasi DB ter-host (Turso/Neon) + object storage poster.
- Ingest sumber otomatis dari link publik yang dikonfirmasi (tanpa scraping yang melanggar ToS).

## Catatan integritas data

Tidak ada integrasi event nyata dan tidak ada data event nyata yang di-fabricate. Seluruh isi DB seed adalah demo bertanda `[DEMO]`. Event "nyata" hanya masuk lewat submit komunitas dengan sumber yang bisa diverifikasi moderator.
