# Integrasi "12 Toko Sangat Boros" ke Smart Energy Monitoring

Status: sisi sparta-energy selesai. View `v_toko_sangat_boros` sudah dibuat di DB 1 lewat migrasi `20261023010000_add_view_toko_sangat_boros`. Sisi smart-energy-monitoring menunggu lampu hijau. Tanggal: 23 Oktober 2026.

Dokumen ini berlaku untuk dua repo:

- **sparta-energy**: pemilik DB 1 (database `energy`) dan satu-satunya repo yang boleh menjalankan migrasi.
- **smart-energy-monitoring**: membaca DB 1 (lewat `SPARTA_DATABASE_URL`) dan DB 2 (`energy_meter`), tidak pernah menulis.

## 1. Tujuan

Dari kalkulasi energi di sparta-energy, 12 toko boros dengan selisih (gap) terbesar ditandai **Sangat Boros**. Toko-toko ini menjadi prioritas pemasangan alat IoT. Portal monitoring perlu:

1. Melihat daftar 12 toko itu, termasuk yang belum terpasang alat.
2. Menampilkan **standar konsumsi energi** dari kalkulasi sebagai garis pembanding (baseline) di grafik kWh.
3. Menghitung berapa persen pemakaian turun setelah alat dipasang dan ada perbaikan.

Bagian kiri diagram alur (pasang IoT, dashboard monitoring, konsumsi per equipment) dikerjakan di smart-energy-monitoring. Bagian kanan (form pemeriksaan 7 kategori) ada di sparta-energy.

## 2. Kontrak data: view `v_toko_sangat_boros`

Satu view read-only di DB 1. Aturan pemilihan 12 toko hanya ditulis di sini, sehingga kedua aplikasi pasti menampilkan toko yang sama.

| Kolom | Tipe | Isi |
|---|---|---|
| `peringkat` | int | 1 sampai 12, urut gap terbesar |
| `store_code` | text | Kode toko, sama dengan `stores.code` |
| `store_name` | text | Nama toko |
| `branch` | text | Cabang |
| `latitude`, `longitude` | float | Koordinat toko (boleh kosong) |
| `audit_id` | uuid | Kalkulasi terbaru toko |
| `tanggal_kalkulasi` | timestamp | Tanggal kalkulasi terbaru |
| `gap_percent` | numeric | (aktual PLN − standar) ÷ standar × 100 |
| `aktual_pln_kwh_per_bulan` | numeric | Rata-rata tagihan PLN 6 bulan, per bulan |
| `standar_konsumsi_kwh_per_bulan` | numeric | Standar konsumsi energi dari daftar alat, per bulan |
| `standar_konsumsi_kwh_per_hari` | numeric | Kolom sebelumnya ÷ 30 |
| `status_validasi` | text | `PENDING` atau `VALIDATED` |
| `is_demo` | boolean | `true` kalau cabang toko `DEMO` (data uji coba) |

Aturan:

- Setiap toko diwakili oleh kalkulasi `COMPLETED` terbarunya.
- Yang diambil hanya kalkulasi berstatus Boros dengan gap terisi, lalu diurutkan dari gap terbesar dan diambil 12 teratas.
- Status validasi tidak memengaruhi urutan, jadi toko tidak keluar dari daftar hanya karena sudah divalidasi.
- Cabang `Head Office` tidak ikut. Cabang `DEMO` ikut untuk uji coba dan ditandai `is_demo = true` (lihat bagian 6, keputusan nomor 1).
- Kalau gap sama persis, urutan ditentukan oleh `audit_id`, supaya peringkat tidak berubah-ubah.
- Nama kolom adalah kontrak antar-repo. Mengubah atau menghapus kolom harus dikoordinasikan dengan smart-energy-monitoring. Menambah kolom aman.

SQL final ada di `prisma/migrations/20261023010000_add_view_toko_sangat_boros/migration.sql`:

```sql
CREATE OR REPLACE VIEW v_toko_sangat_boros AS
WITH latest AS (
  SELECT DISTINCT ON (a.store_id) a.*
  FROM audits a
  WHERE a.status = 'COMPLETED'
  ORDER BY a.store_id, a.audit_date DESC
),
ranked AS (
  SELECT l.*, ROW_NUMBER() OVER (ORDER BY l.gap_percent DESC, l.id) AS peringkat
  FROM latest l
  JOIN stores s ON s.id = l.store_id
  WHERE l.is_boros = true
    AND l.gap_percent IS NOT NULL
    AND (s.branch IS NULL OR lower(s.branch) <> 'head office')
)
SELECT
  r.peringkat::int AS peringkat,
  s.code AS store_code,
  s.name AS store_name,
  s.branch,
  s.latitude,
  s.longitude,
  r.id AS audit_id,
  r.audit_date AS tanggal_kalkulasi,
  round(r.gap_percent, 2) AS gap_percent,
  round(r.avg_actual_pln_kwh_per_month, 2) AS aktual_pln_kwh_per_bulan,
  round(r.total_estimated_kwh_per_month, 2) AS standar_konsumsi_kwh_per_bulan,
  round(r.total_estimated_kwh_per_month / 30, 2) AS standar_konsumsi_kwh_per_hari,
  r.validation_status::text AS status_validasi,
  (lower(coalesce(s.branch, '')) = 'demo') AS is_demo
FROM ranked r
JOIN stores s ON s.id = r.store_id
WHERE r.peringkat <= 12;
```

## 3. Pekerjaan di sparta-energy

1. Migrasi Prisma berisi `CREATE OR REPLACE VIEW` di atas. Kalau user database portal monitoring berbeda dari user sparta, tambahkan `GRANT SELECT ON v_toko_sangat_boros TO <user_monitoring>`.
2. Label "Sangat Boros" di halaman admin sparta membaca view yang sama, supaya kedua aplikasi pasti sama. Sudah diubah: `sangatBorosIdsSql` dan `isSangatBorosAudit()` di `lib/audit-validation-queries.ts` sekarang membaca `v_toko_sangat_boros`. Migrasi view sudah dijalankan.
3. Perbarui `ARCHITECTURE_PLAN.md`:
   - Nama database DB 1 adalah `energy`, bukan `sparta_energy`.
   - Migrasi DB 1 hanya dijalankan dari sparta-energy.
   - Daftar view yang menjadi kontrak antar-repo.

## 4. Pekerjaan di smart-energy-monitoring

Referensi dari repo itu (dicek 23 Oktober 2026): akses DB 1 lewat `getSpartaPool()` di `lib/db/pools.ts`, daftar toko dari `getStores()` di `lib/services/store-service.ts`.

1. **Service baru** `getSangatBorosStores()` di `lib/services/`, beserta tipenya di `lib/types.ts`:
   ```sql
   SELECT * FROM v_toko_sangat_boros ORDER BY peringkat
   ```
   Query lewat `getSpartaPool()`, tanpa Prisma dan tanpa migrasi.

2. **Bagian "Prioritas Pasang IoT"** di halaman Monitoring, terpisah dari "Daftar Toko". `getStores()` hanya berisi toko yang sudah punya device, jadi toko Sangat Boros yang belum dipasangi alat tidak akan muncul di sana.
   - Tampilkan peringkat, nama dan kode toko, cabang, gap, dan standar konsumsi energi.
   - Status alat **Terpasang** atau **Belum terpasang** ditentukan dengan mencocokkan `UPPER(store_code)` dengan kode hasil `extractStoreCode()` dari nama device (hasilnya selalu huruf besar). Ini cara pencocokan yang sudah dipakai `getStores()`.
   - Klik toko membuka `getStoreById()`, yang sudah bisa membuka toko tanpa device (status `unassigned`).

3. **Baseline di grafik kWh** (`components/monitoring/store-detail-analytics.tsx`):
   - Kalau toko ada di view, tambahkan `ReferenceLine` di grafik kWh.
   - Grafik bulanan memakai `standar_konsumsi_kwh_per_bulan`, grafik harian memakai `standar_konsumsi_kwh_per_hari`.
   - Label garis: "Standar konsumsi energi".

4. **Persentase penurunan**, dihitung **per hari** supaya bulan yang belum lengkap tidak selalu tampak turun:
   - Rata-rata harian IoT = total kWh IoT ÷ jumlah hari yang benar-benar punya data.
   - Terhadap tagihan PLN sebelum alat dipasang: (`aktual_pln_kwh_per_bulan` ÷ 30 − rata-rata harian IoT) ÷ (`aktual_pln_kwh_per_bulan` ÷ 30) × 100.
   - Terhadap standar: rata-rata harian IoT dibanding `standar_konsumsi_kwh_per_hari`.
   - Alternatif yang lebih sederhana: tampilkan persentase hanya untuk bulan yang datanya sudah lengkap.
   - kWh IoT di repo itu adalah delta counter per interval yang dikelompokkan per hari zona Asia/Jakarta.

5. **Hanya kWh total toko yang dibandingkan.** Sebagian device adalah sub-metering per equipment, bukan total toko. Baseline dan persentase penurunan hanya bermakna kalau kWh berasal dari fase R/S/T panel utama. Repo monitoring perlu aturan yang jelas tentang sensor atau fase mana yang dihitung sebagai "total toko" (lihat keputusan terbuka nomor 4).
   - **Diputuskan 23 Oktober 2026 (sisi smart-energy-monitoring):** "total toko" hanya menjumlah fase panel utama R/S/T, yaitu sensor L1/L12/R, L2/L13/S, dan L3/L14/T. Sensor sub-metering per equipment tidak ikut dihitung, supaya pemakaian tidak terhitung dua kali.

7. **Label uji coba.** Baris dengan `is_demo = true` diberi label "Uji coba" di portal monitoring, supaya tidak dikira toko sungguhan.

6. **Tetap patuhi aturan repo itu:** tidak ada `INSERT`, `UPDATE`, `DELETE`, DDL, `prisma migrate`, atau `prisma db push`.

## 5. Tahap berikutnya: Rekomendasi Audit

Kotak paling bawah diagram menggabungkan konsumsi listrik dari IoT dan hasil pemeriksaan 7 kategori. Karena portal monitoring sudah bisa membaca DB 1, rekomendasi ini bisa dibuat di sana dengan membaca tabel `energy_audits` milik sparta-energy (atau view ringkasan yang disediakan nanti). Tidak perlu API baru di sparta-energy.

## 6. Keputusan terbuka

1. **Toko DEMO di view:** dikecualikan (usulan) atau tetap dimasukkan untuk uji coba? Kalau dikecualikan, toko DEM1 tidak lagi bertanda Sangat Boros di mode dev sparta.
   - **Diputuskan 23 Oktober 2026:** tetap dimasukkan untuk uji coba, ditandai kolom `is_demo`.
   - **Sebelum production:** buat migrasi baru yang mengganti filter cabang di view menjadi `lower(s.branch) NOT IN ('demo', 'head office')`. Kolom `is_demo` tetap ada (selalu `false`) supaya kontrak tidak berubah. Di halaman validasi sparta, filter `activeStoreSql` sudah menyembunyikan DEMO saat production, jadi tampilan 12 teratas bisa berisi 11 toko sampai migrasi ini dijalankan.
2. **User database production:** di lingkungan lokal, kedua repo memakai user yang sama (`aku-sparta`, database `energy`, host yang sama), sehingga view dimiliki user itu dan `GRANT SELECT` tidak diperlukan. Env production di Dokploy belum dicek. Kalau di sana portal monitoring memakai user lain, jalankan `GRANT SELECT ON v_toko_sangat_boros TO "<user>";` (pakai tanda kutip kalau nama user mengandung tanda hubung).
3. **Jumlah toko:** tetap 12, atau bisa berubah? Kalau berubah, cukup ubah angka di view.
   - **Diputuskan 23 Oktober 2026:** untuk sementara 12. Kalau berubah, ubah angka di view lewat migrasi baru dan `TOP_BOROS_LIMIT` di `lib/audit-validation-queries.ts`.
4. **Definisi "total toko" di data IoT:** sensor atau fase mana yang dihitung sebagai pemakaian total toko (panel utama), dan mana yang sub-metering per equipment. Diputuskan di sisi smart-energy-monitoring.
   - **Diputuskan 23 Oktober 2026:** hanya fase panel utama R/S/T (L1/L12/R, L2/L13/S, L3/L14/T). Lihat bagian 4 nomor 5.
