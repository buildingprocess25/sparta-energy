w# AI Context - SPARTA Energy

## Project Overview

SPARTA Energy adalah aplikasi internal untuk tim audit energi perusahaan retail.

Tujuan utama:

- Mengukur konsumsi listrik setiap toko.
- Menganalisis efisiensi energi.
- Mengklasifikasikan toko menjadi:
  - Hemat (efisien)
  - Boros (tidak efisien)

Aplikasi ini berfungsi sebagai decision support system, bukan sekadar input data.

## Target Users and Access Model

Ada 2 role user utama:

1. user (Auditor)

- Login menggunakan akun personal (email & password).
- Setiap user terikat pada 1 **cabang** (`branch`).
- Saat memulai audit, user **memilih toko** dari daftar toko yang tersedia di cabangnya.
- History dan reports menampilkan semua audit yang pernah dilakukan oleh user tersebut, bisa lintas toko dalam 1 cabang.
- Fokus pada eksekusi audit operasional dan tindak lanjut lokal per toko.

2. admin

- Login menggunakan akun personal (email & password).
- Bisa melakukan audit dan melihat data untuk semua toko di semua cabang.
- History dan reports menampilkan data lintas toko dan lintas cabang.
- Fokus pada monitoring jaringan toko, benchmarking, dan prioritas intervensi.

## End-to-End User Flow

1. Login

- Menggunakan email dan password akun personal yang terdaftar.
- Akses dibatasi untuk karyawan internal.
- Setelah login, user masuk ke Dashboard sebagai **dirinya sendiri** (bukan sebagai toko).
- Identitas cabang (`branch`) ditentukan dari data akun user di database.

2. Dashboard

- Menampilkan ringkasan kinerja audit terbaru yang pernah dilakukan user.
- Setiap kartu riwayat menampilkan **Nama Toko** yang diaudit beserta bulan pelaksanaannya.
- Akses cepat untuk memulai audit baru.

3. Step 1: Input Toko & Area

- User **memilih toko** yang akan diaudit dari daftar toko yang tersedia di cabangnya (bukan input kode manual).
- Identitas & Teknis: Daya PLN (VA), tipe toko (Regular, Basic, dll), jam operasional toko.
- Input Luas Area: Parkir, Teras, Sales, Gudang, Toilet, Selasar (dipisah sejak Oktober 2026; data lama masih menyimpan gabungan di Gudang dengan Toilet & Selasar = 0). Equipment tetap satu grup "Gudang, Toilet & Selasar" (enum `WAREHOUSE`).

4. Step 2: Input Equipment per Area

- User mendata equipment di 4 area tersebut.
- Item equipment ter-generate otomatis berdasarkan _tipe toko_, namun user bisa menambahkannya secara manual.
- User memasukkan Jumlah (Qty) dan Jam Operasional pemakaian per alat.
- _Khusus Air Conditioner_: input per item AC dapat dibedakan jam operasionalnya (misal AC 1 nyala 24 jam, AC 2 nyala 12 jam).
- Sistem menghitung Estimasi Konsumsi (kWh) = Jumlah × Jam Operasional × Daya kW (dari master database).

5. Step 3: Input History PLN & STD

- User memasukkan history konsumsi PLN (kWh) dan STD (Sales Transaction per Day) mundur selama 6 bulan terakhir.
- STD sementara hanya disimpan, belum difungsikan untuk analitik.

6. Step 4: Kalkulasi & Hasil (Result)

- Sistem menjumlahkan semua estimasi kWh equipment selama 1 bulan penuh, lalu dibandingkan dengan rata-rata aktual PLN per bulan.
- Jika Hasil Estimasi (Teori) < Konsumsi Aktual PLN, maka toko dinilai "Boros" (pemborosan energi dari kebocoran/misusage yang tidak terpantau).
- Muncul _Rekomendasi Audit_ berupa "Perbaikan Equipment" atau "Pelatihan Tim Toko (SOP)".

## Core Functions

### 1) Analisis Konsumsi Energi

- Membandingkan estimasi teknis berbasis equipment bulanan dengan data rata-rata bulanan aktual usage dari PLN 6 bulan ke belakang.

### 2) Kalkulasi Otomatis

- Estimasi Harian = kW (master) × jumlah (qty) × jam operasional
- Estimasi Bulanan = Estimasi Harian × Jumlah hari operasional dlm sebulan
- Status = "Boros" jika Estimasi Bulanan < Penggunaan PLN Aktual (rata-rata)

### 3) Identifikasi Sumber Boros & Rekomendasi

- Merangking area dan equipment dengan proporsi energi tertinggi (misal AC mendominasi > 60%).
- Memberikan sinyal:
  - Pelatihan Tim: Jika jam operasional alat yang diinput melebihi kebutuhan.
  - Perbaikan Equipment: Jika perhitungan estimasi wajar, namun tagihan PLN jebol (indikasi kebocoran arus / kompresor rusak).

### 4) Monitoring dan Reporting

- Riwayat audit, tren tagging efisiensi, dan history STD.

## Business Value

- Mengurangi biaya listrik dengan identifikasi pemborosan lebih cepat.
- Menstandarkan metode audit antar toko.
- Mendukung keputusan berbasis data (bukan asumsi).
- Skalabel untuk jaringan retail multi-cabang.

## Product UX Direction

- Profesional dan corporate.
- Data-heavy tapi tetap clean.
- Prioritas UX:
  - Kejelasan angka.
  - Kemudahan input.
  - Feedback real-time.

## One-line Summary

SPARTA Energy adalah sistem audit energi + analitik + decision support untuk membantu perusahaan memahami, mengontrol, dan mengoptimalkan konsumsi energi toko secara terukur.

## Codebase Map (Routes and Files)

Routes (App Router):

- / -> app/page.tsx
- /login -> app/login/page.tsx
- /dashboard -> app/dashboard/page.tsx (loading.tsx)
- /audit/start -> app/audit/start/page.tsx (loading.tsx)
- /audit/[id] -> app/audit/[id]/page.tsx (loading.tsx)
- /history -> app/history/page.tsx (loading.tsx)
- /reports -> app/reports/page.tsx (loading.tsx)
- /settings -> app/settings/page.tsx (loading.tsx)
- /settings/about -> app/settings/about/page.tsx
- /ac-estimation -> app/ac-estimation/page.tsx (loading.tsx)
- /demo -> app/demo/page.tsx
- /demo/result -> app/demo/result/page.tsx

Feature components:

- Audit steps UI -> components/audit/step1.tsx, step2.tsx, step2-detail.tsx, step3.tsx, step-indicator.tsx, time-range-cards.tsx, store-combobox.tsx, brand-combobox.tsx, result-db.tsx
- Dashboard UI -> components/dashboard/hero-card.tsx, summary-cards.tsx, recent-audit-section.tsx, audit-list-section.tsx, audit-card.tsx, ac-estimation-card.tsx
- AC estimation -> components/ac-estimation/map-picker.tsx, estimation-result-card.tsx
- Shared UI -> components/header.tsx, bottom-navigation.tsx, login-form.tsx, demo-login-button.tsx, landing-illustration.tsx, logo.tsx, simple-time-picker.tsx, theme-provider.tsx
- UI primitives (shadcn) -> components/ui/\*

Server actions and API routes:

- Server actions -> app/actions/get-history.ts, get-temperature.ts, submit-audit.ts, get-demo-ai-recommendation.ts
- API routes -> app/api/auth/[...all]/route.ts, app/api/demo-session/route.ts

Core domain and infra:

- Audit calculations -> lib/audit-kalkulator.ts, lib/get-equipment-for-area.ts
- AI recommendation -> lib/ai-recommendation.ts
- Auth and session -> lib/auth.ts, lib/auth-client.ts
- DB and pools -> lib/prisma.ts, lib/db-pool.ts
- Demo config -> lib/demo-config.ts
- Shared utils -> lib/utils.ts
- Store -> store/use-audit-store.ts
- Hook -> hooks/use-debounce.ts

## Notes for AI Handoff

- Gunakan istilah domain: toko, area, equipment, kWh, PLN, hemat, boros.
- Saat membangun fitur baru, pertahankan alur audit berurutan dari input data sampai klasifikasi hasil.
- Prioritaskan akurasi kalkulasi, keterbacaan data, dan actionable insight.

## AI Coding Rules

Aturan wajib yang harus diikuti oleh semua AI agent saat mengerjakan project ini:

### 1. Prioritaskan Komponen shadcn/ui

- **Selalu gunakan komponen shadcn/ui terlebih dahulu** sebelum menulis markup custom.
- Jika ada referensi UI dari user untuk ditiru, **analisa dulu** strukturnya, lalu **cari apakah komponen ekuivalennya tersedia di shadcn** (gunakan `npx shadcn@latest search` atau `npx shadcn@latest docs`).
- Jika komponen tersedia di shadcn → **import dan gunakan dari shadcn**, jangan buat ulang dari scratch.
- Jika komponen **tidak tersedia** di shadcn → baru diizinkan membuat komponen kustom.

### 2. Komponen Kustom Harus Reusable

- Jika terpaksa membuat komponen kustom, **selalu buat sebagai komponen yang reusable** (terima props, tidak hardcode value spesifik).
- Simpan di path yang sesuai (`@/components/`) dengan nama yang deskriptif.
- Hindari membuat komponen one-off yang hanya bisa dipakai satu tempat.

### 3. Jangan Tambah Spacing Manual ke Komponen shadcn

- **Jangan menambahkan padding, gap, margin, atau style jarak lainnya secara manual** ke dalam atau di antara komponen shadcn/ui.
- Komponen shadcn sudah memiliki spacing bawaan yang telah dikalibrasi — menambah spacing manual akan merusak konsistensi visual.
- Ini berlaku untuk: `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Button`, `Input`, `Dialog`, `Sheet`, dll.
- Jika butuh jarak antar elemen, gunakan layout wrapper (misal `flex flex-col gap-4`) hanya pada elemen container, bukan pada komponen shadcn itu sendiri.

## Pembaruan Implementasi (sinkron dengan kode per 2026-10-22)

Bagian ini melengkapi isi di atas sesuai perilaku kode saat ini. Jika ada perbedaan, bagian ini yang mengikuti kode.

### Kalkulasi Aktual (`lib/audit-kalkulator.ts` → `calculateAudit()`)

- Estimasi Bulanan = Estimasi Harian × **30** (angka tetap, bukan jumlah hari operasional).
- Metode hitung per equipment (`calcMethod`):
  - `STANDARD`: kW × jam operasional.
  - `TRANSACTION` / `BATCH`: jam running = (usage × durasi) / 3600, dibatasi jam operasional; sisa jam dihitung sebagai standby (default 5% dari kW running).
- Rata-rata PLN hanya dihitung dari bulan yang kWh-nya > 0.
- Status **Boros** jika rata-rata aktual PLN > Estimasi Bulanan × **1.05** (toleransi 5%). Selain itu **Hemat**.
- Tipe rekomendasi:
  - Hemat → `MAINTENANCE`.
  - Boros + ada AC menyala ≥ jam buka toko + 2 jam (toko non-24 jam) → `TRAINING`.
  - Boros tanpa indikasi di atas → `REPAIR`.

### Filter Gap ±20% (`lib/audit-gap-filter.ts`)

- Gap = (aktual PLN − estimasi) / estimasi.
- Saat filter aktif, audit dengan gap di luar ±20% **disembunyikan** dari tampilan admin (dashboard, branches, stores, audits, reports) sebagai penyaring outlier.
- Admin menyalakan atau mematikan filter lewat switch "Gap ±20%" di header admin. Pilihan disimpan di cookie `admin-gap-filter` per browser (`lib/admin-gap-filter.ts`). Tanpa cookie, nilai default `AUDIT_GAP_FILTER.enabled` yang dipakai.
- Query admin membaca status filter lewat `getAdminGapFilterSql()` / `getAdminGapFilterEnabled()`, bukan konstanta langsung. Mode Auditor dan halaman validasi tidak memakai filter ini.
- "Sangat Boros" di admin ikut filter ini (`lib/admin-sangat-boros.ts`). Filter mati: dibaca dari view `v_toko_sangat_boros`, sama dengan web energy dan halaman validasi auditor. Filter nyala: 12 teratas dihitung ulang hanya dari kalkulasi di dalam ±20%, tanpa toko DEMO, sehingga bisa berbeda dari web energy.
- Filter ini **tidak mengubah** status Hemat/Boros yang tersimpan.

### Istilah di Admin

- Hasil kalkulator konsumsi (model `Audit`) disebut **Kalkulasi** di UI admin. Form 7 kategori (model `EnergyAudit`) disebut **Pemeriksaan**. Peran pengguna tetap **Auditor**.
- URL, nama tabel, dan nama variabel tetap memakai `audit`.

### Status IoT di Admin (`lib/iot-status.ts`)

- Admin membaca `GET {ENERGY_MONITORING_URL}/api/stores` milik smart-energy-monitoring (read-only, cache 5 menit, timeout 5 detik). sparta-energy tidak terhubung ke DB 2.
- Toko dianggap punya IoT kalau `code` di respons sama dengan `stores.code` (huruf besar). Status: live, pernah dipasang, atau belum dipasang.
- Kalau portal gagal dihubungi, tampilkan "Status IoT tidak tersedia", jangan "belum dipasang". Filter IoT dilewati dalam kondisi ini.
- `ENERGY_MONITORING_URL` opsional. Default: `https://energy-monitoring.sparta-alfamart.web.id/`.

### Validasi Kalkulasi (`/audit/validation/[id]`)

- Satu halaman, tanpa step. Kiri: ringkasan status dan perbandingan kWh, plus riwayat koreksi. Kanan: Teknis Toko (tipe, alamat, daya PLN, luas area, jam operasional, riwayat PLN 6 bulan dengan STD), lalu Daftar Peralatan (tambah, ubah, hapus).
- Koreksi alat langsung tersimpan lewat dialog. Teknis toko, alamat, dan riwayat PLN tersimpan lewat "Simpan Draf" atau saat "Validasi Kalkulasi" (`saveValidationDraft`, `validateAudit` di `app/actions/audit-validation.ts`).
- Setiap koreksi menghitung ulang standar, aktual (rata-rata PLN, bulan 0 kWh tidak dihitung), gap, **dan status Hemat/Boros** (`BOROS_TOLERANCE` 1,05 di `lib/audit-recalculate.ts`).
- Sebelum koreksi pertama, hasil anak toko disalin ke `audits.original_*`. Setiap koreksi dicatat di tabel `audit_corrections`. Admin melihat keduanya di Detail Kalkulasi.
- Alamat disimpan langsung ke `stores.address`. Tipe, daya, luas, dan jam hanya disalin ke data toko kalau kalkulasi ini yang terbaru.
- Saat "Validasi Kalkulasi", rekomendasi dibuat ulang hanya kalau tipenya tidak cocok lagi dengan status (Hemat butuh `MAINTENANCE`, Boros butuh `TRAINING`/`REPAIR`). AI menerima status awal, status akhir, dan daftar koreksi; batas tunggu 10 detik, lalu teks cadangan. Rekomendasi lama dicatat di `audit_corrections` (`RECOMMENDATION_UPDATED`). "Simpan Draf" tidak memanggil AI.
- Halaman hasil (`/audit/[id]`) menulis "Status berubah dari … ke …" beserta perubahan kWh-nya, dan memberi label "Diperbarui setelah validasi" pada rekomendasi yang dibuat ulang. Halaman validasi dan admin juga memberi keterangan kalau status berubah setelah koreksi.

### Tambahan Routes (belum tercantum di Codebase Map)

- `/admin` beserta `/admin/dashboard`, `/admin/audits`, `/admin/audits/[id]`, `/admin/stores`, `/admin/stores/[id]`, `/admin/branches`, `/admin/equipment`, `/admin/master-data`, `/admin/users`, `/admin/reports`, `/admin/calculator-logs`
- `/admin-entry`
- `/ac-mapping`: mapping posisi AC di denah toko
- `/light-estimation`: kalkulator lampu
- `/store-mep-simulator`: simulator MEP toko (BETA)
- Catatan: `/reports` (route user) tidak ditemukan lagi di kode; laporan kini ada di `/admin/reports`.

### Tambahan Server Actions & API Routes

- Server actions: `create-user`, `update-user`, `delete-user`, `import-users`, `get-rab-data`, `save-draft`, `save-ac-estimation-log`, `save-light-estimation-log`, `store-actions`
- API routes: `api/cron/sync-stores` (sync toko dari Google Sheet), `api/auth/sso/callback`, `api/auth/redirect-path`, `api/webhook/sso/email`, `api/uploadthing`, `api/map-tiles/[...slug]`, `api/dev-login`, `api/admin/users`
