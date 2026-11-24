# SIDESTAGE — DRAFT LANDING PAGE v1
*Status: DRAFT untuk review REN. Belum diimplementasi. Mengikuti metodologi tasteskill 2.5 (kind: software) + selera brand (glass, merah #A11A17 di Kokushoku #171213, motion kalem).*

---

## 0. The Deal (kesepakatan visual, baris 2 rencana)

- **Kind:** `software` — SIDESTAGE adalah platform. Aturan emasnya: **UI SIDESTAGE sendiri jadi bintang**, ditampilkan sebagai live app-frame (bukan screenshot statis, bukan dashboard generik).
- **Palette (brand terkunci, jalur `brand` bukan dealt):** bg `#171213` · surface `#242323` · line `#3D3837` · accent `#A11A17` · ink `#D2CEC7`. Merah muncul sebagai satu aksen kuat + wash gradient merah→gelap di hero — konsisten sama app.
- **Radius:** soft (consumer app). **Motion:** kalem — hero enter sekali, hover lift 2px, tidak ada scroll-jack.
- **Effect (tech: boleh satu):** stage-beams yang sudah ada dipertahanan sebagai *the one effect*, tapi di-remake: beam merah turun pelan di belakang app-frame hero. Satu aja.
- **Moments (1–2):** (1) ticker lineup artis yang udah ada, diupgrade jadi marquee tipografis raksasa; (2) "demand signal" — angka minat per artis yang men-tick naik saat masuk viewport (count-up sekali, bukan loop).
- **60–80 kata per layar** di luar UI mock. Headline noun-based, tombol verb+object.

---

## 1. Struktur halaman (7 section, 1–2 layar masing-masing)

### S1 — HERO (1 layar, hero sendirian di first viewport)
- Masthead strip mini ala gig-flyer: `● NOW SHOWING — ALL CITIES — EST. 2026` (sudah ada, dipertahanan)
- **H1:** `Live music di kotamu,` (baris 1, Ravine) + `ketemu bareng komunitas.` (baris 2, "komunitas" shine merah)
  - *Kenapa:* menyebut kategori (live music) + pembeli (kotamu/community) — bukan tagline kosong.
- **Satu hard fact di first screen:** `15 event terverifikasi · 6 kota · sumber tercatat` (counter dinamis dari DB — angka beneran, bukan klaim)
- **App-frame:** hero menampilkan SIDESTAGE sendiri dalam frame browser miring ringan — feed nyata (iframe produk atau replika markup yang di-fetch dari API yang sama; bukan mockup bohong). Poster Simple Plan/BIGBANG kelihatan hidup di dalam frame.
- **CTA utama:** `Jelajah event →` (primary, merah). Sekunder: `Submit event` (ghost).
- Beams sebagai effect di belakang frame.

### S2 — AGENDA LIVE (1 layar)
- 4–5 event terdekat sebagai kartu poster (komponen EventCard yang sudah ada) + link `Lihat semua di Jelajah →`.
- Data: query `starts_at >= now` ASC, limit 5. Kalau kosong: empty state jujur (bukan spinner abadi).

### S3 — CARA KERJA (1 layar, diagram still)
- Tiga langkah, diagram hub→lanes (bukan 3 kartu ikon generik):
  1. **Scout submit** — komunitas kirim event + link sumber
  2. **Moderasi & verifikasi** — admin cek sumber, status `source_checked`/`official`
  3. **Demand naik** — orang tekan "aku ikut" → angka minat jadi sinyal buat promoter
- Copy verbatim dari mekanisme DB yang beneran ada (bukan janji kosong). Satu diagram saja, still.

### S4 — MOMENT: DEMAND SIGNAL (1 layar, type-led)
- Giant type: `15 org mau nonton CARIBOU di Joyland.` — angka dari tabel interests beneran.
- Count-up sekali saat masuk viewport. Kalau minat 0: pilih event dengan minat tertinggi; kalau semua 0, section ini fallback jadi CTA `Jadi yang pertama bilang "aku ikut" →`.
- **Ini differentiator produk** — layar paling penting setelah hero.

### S5 — PROMOTER & FESTIVAL (1 layar)
- Directory yang sudah ada, dipertahankan + dirapikan grid-nya (logo © attribution tetap).

### S6 — TRUST / KENAPA BEDA (1 layar)
- 3 kolom tipografis (bukan kartu ikon):
  - `Sumber tercatat.` — setiap listing punya link sumber + tanggal cek
  - `Dimoderasi.` — bukan scrape otomatis; manusia yang verifikasi
  - `Bukan platform tiket.` — pembelian tetap di situs resmi promotor
- Footer credit line satu baris: poster © promotor masing-masing.

### S7 — CLOSE (tipe)
- Type moment: `[SIDESTAGE]` giant outline + `Panggung sampingnya penting juga.` — satu kalimat brand, lalu footer.
- Footer: nav + credit + "est. 2026 · Indonesia".

---

## 2. Copy voice (kartu suara)
- **Suara:** lugas, community-first, sedikit gig-flyer energy. Bahasa lu/gw di UI mikro, kamu-netral di copy bacaan? → **Putusan: netral-informal** (biar promoter/EO gak risih), lu/gw cuma di microcopy interaktif.
- **Larangan:** no "Platform #1", no "Revolusi musik", no emoji berlebihan, no klaim angka yang gak ada di DB.
- **Factsheet (semua dari DB, dynamic):** jumlah event verified, jumlah kota, jumlah artis di lineup, total interest.

## 3. Yang di-benerin sekalian (bukan bagian landing, tapi satu pass)
1. **OG image dinamis** per event (poster + tanggal + venue, via `opengraph-image.tsx`) — share WA/IG sekarang polos.
2. **Loading skeletons** untuk feed (sekarang force-dynamic polos).
3. **404 page custom** (sekarang default Next).
4. **`robots.txt` + sitemap** — biar event terindex Google.
5. **Empty state / error state** semua halaman (draft di atas sudah rancang 2).
6. **Aksesibilitas pass** pakai web-design-guidelines (focus ring, label form, tap-size mobile).
7. **Perf pass** pakai vercel-react-best-practices (poster `<img>` tanpa width/height → CLS; lazy-load sudah).
8. **R2 upload** (masih backlog lu, nggak dipriority sekarang).

## 4. Yang butuh keputusan REN
- [ ] H1 pilihan A: `Live music di kotamu, ketemu bareng komunitas.` (draft atas) vs B: `Semua gig, satu agenda.` (lebih pendek, kurang hangat)
- [ ] App-frame hero: replika markup live (disarankan) vs iframe situs sendiri (lemur & berat)
- [ ] Landing jadi homepage `/` yang baru, atau halaman terpisah `/about` dengan home tetap langsung feed? *(Draft ini mengasumsikan: home tetap feed-first — landing konten disisip sebagai section di home, karena produk IS feed.)*
