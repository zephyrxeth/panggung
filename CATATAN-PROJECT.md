# SIDESTAGE — Catatan Project (buat REN)

> Panduan singkat buat lu yang nggak ngoding. Simpen file ini, kalau lupa tinggal buka.

## URL
- **Situs utama:** https://2341s.my.id (custom domain, SSL aktif)
- **Alias Vercel:** https://panggung.vercel.app (tetap jalan, sama project)
- **Repo kode:** https://github.com/zephyrxeth/panggung (public, branch `main`)
- **Nama lama:** "Panggung" — masih dipakai di nama repo & subdomain Vercel (nggak bisa di-rename), brand resmi sekarang **SIDESTAGE**

## Akun & layanan (semua $0 / free tier)
| Layanan | Buat apa | Akses |
|---|---|---|
| Vercel | hosting Next.js | vercel.com, akun `zephyrxeth-4643` |
| Turso | database libSQL | turso.tech, DB `z3p-dtb` (Singapore) |
| indo.domains | domain `2341s.my.id` | app.indo.domains |
| GitHub | kode | akun `zephyrxeth` |

## Identitas
- **Nama:** SIDESTAGE [SS]
- **Logo:** raven (linocut) — 3 versi di `public/brand/`: `logo-red.png` (untuk bg gelap), `logo-black.png` (untuk bg terang), `logo-ravine.png`
- **Palette LOCKED (jangan diubah):**
  - Kokushoku Black `#171213` — background gelap
  - Young Night `#242323` — surface/kartu
  - Eclipse `#3D3837` — garis/border
  - Mechrite Red `#A11A17` — accent utama
  - Ravine `#D2CEC7` — teks terang
- **Style:** iOS glass, rounded, motion kalem, kontras merah di gelap. (Brutalism sempat dicoba, di-revert — liat commit "Revert to glass visual system".)

## Data
- **15 event, SEMUA nyata** dengan sumber tercatat (tabel `event_sources`). Data `[DEMO]` sudah dibersihkan total.
- Sumber poster: CDN AsiaLive365 (Sanity), Fasticket, Scenepass — poster © masing-masing promotor
- Halaman `/submit` bisa dipakai siapa pun buat submit event (masuk antrian review admin di `/admin`)
- Login demo (buat cek panel admin): `admin@panggung.demo` / `demo12345`

## Yang AMAN lu utak-atik di Vercel dashboard
- Domains, Deployments (lihat), Analytics

## Yang JANGAN disentuh
- Settings → Environment Variables (`TURSO_*` — situs mati kalau hilang)
- Turso database (delete = semua data hilang)
- Settings → Git (disconnect repo)
- Redeploy dengan opsi "Override"

## Ritual deploy (dikerjain Kaairn)
1. Edit kode → `npx next build` → verify BUILD_OK
2. `vercel --prod` → READY
3. git commit + push
4. Screenshot mobile + desktop → verify visual

## Known issues / backlog
- Upload poster user via `/submit` bersifat ephemeral di Vercel (hilang saat restart) — solusi: Cloudflare R2, **belum diimplementasi** (user: "nanti aja")
- Domain `2341s.my.id` nama acak — kalau nemu nama brand yang pas, add domain kedua ke project yang sama (2 menit + set DNS)
- Propagasi PANDI .my.id lambat (2–48 jam) — kalau domain "gabisa dibuka" dari jaringan baru, tunggu dulu sebelum panik
- Situs kadang lambat cold-start (free tier) — normal

*Dibikin otomatis oleh Kaairn — update terakhir: Nov 2026.*
