# Rumus Kalkulator Konsumsi Energi v2: Pembanding Rumus Lama dan Baru

Dokumen ini membandingkan rumus kalkulator konsumsi energi toko yang berlaku sampai 4 November 2026 (v1) dengan rumus revisi (v2). Sumber konsep: sheet "Revisi Kalkulator Konsumsi Energy" (kolom A sampai R) dan keputusan tim pada 4 November 2026.

Kode rumus: `lib/energy-formula.ts`. Semua layar memakai fungsi yang sama: form anak toko, draf, submit, halaman validasi, dan laporan pembanding.

## 1. Rumus berdampingan

| Karakteristik | Metode | Rumus v1 (lama) | Rumus v2 (baru) |
|---|---|---|---|
| (tidak ada) | STANDAR | kW × jam × jumlah | dipecah jadi STATIS dan DINAMIS |
| STATIS | STANDAR | kW × jam × jumlah | G = H × O × P, dengan H = daya nameplate. **Sama dengan v1** |
| DINAMIS | STANDAR | kW × jam × jumlah | G = H × O × P, dengan **H = I × K + J × L** |
| DINAMIS | TRANSAKSI | [running × jam kerja + standby × sisa jam] × jumlah, jam kerja dibatasi jam nyala, transaksi diisi **per alat** | G = I × M × Q + J × (O × P − M × Q), transaksi diisi **total toko** |
| DINAMIS | BATCH | sama seperti transaksi | G = I × N × R + J × (O × P − N × R), batch diisi **total toko** |

G = kWh per hari. Standar bulanan = jumlah G semua alat × 30, sama seperti v1.

## 2. Kolom data

| Kolom | Arti | Diisi oleh | Disimpan di | Satuan |
|---|---|---|---|---|
| A | Nama equipment | Admin (nameplate dicek GS) | Tipe alat | |
| B | Merek | Admin | Merek | |
| Nameplate | Daya di nameplate | Admin, atau anak toko untuk alat kustom | Merek (`nameplate_kw`) | W atau kW, disimpan kW |
| C | Lokasi / area | Admin | Merek (`area_target`) | |
| D | Kategori | Admin | Tipe alat | 7 kategori dari sheet revisi |
| E | Karakteristik (STATIS/DINAMIS) | Admin, atau anak toko untuk alat kustom | Tipe alat (`operation_type`) | |
| F | Metode (STANDAR/TRANSAKSI/BATCH) | Admin, atau anak toko untuk alat kustom | Tipe alat (`calc_method`) | STATIS selalu STANDAR |
| H | Daya base | **Dihitung**, tidak diketik | Merek (`base_kw`) | kW |
| I | Daya running | Admin, sebagai % nameplate atau W/kW | Merek (`running_kw`, `running_pct_of_nameplate`) | kW |
| J | Daya standby | Admin, sebagai % nameplate atau W/kW | Merek (`standby_kw`, `standby_pct_of_nameplate`) | kW |
| K | Waktu running | Admin (cadangan), atau dihitung dari jam di form toko | Merek (`running_time_pct`) | % |
| L | Waktu standby | Otomatis 100% − K | Merek (`standby_time_pct`) | % |
| M | Waktu per transaksi | Admin | Tipe alat (`calc_duration`) | detik, dihitung dalam jam |
| N | Waktu per batch | Admin | Tipe alat (`calc_duration`) | menit, disimpan detik |
| O | Waktu nyala | Anak toko | Baris audit (`operational_hours`) | jam/hari |
| P | Jumlah alat | Anak toko | Baris audit (`qty`) | unit |
| Q | Jumlah transaksi | Anak toko, total toko | Baris audit (`usage_count`) | per hari |
| R | Jumlah batch | Anak toko, total toko | Baris audit (`usage_count`) | per hari |

Kolom wajib per kombinasi mengikuti tabel V/X di sheet revisi. Form admin hanya menampilkan kolom yang wajib untuk kombinasi yang dipilih.

## 3. Contoh hitungan

**Sheet revisi, baris 1.** I = 8, J = 1, K = 20%, L = 80%:
H = 8 × 0,2 + 1 × 0,8 = **2,4**

**Sheet revisi, nameplate 900 W, DINAMIS STANDAR.** Running 95%, standby 10%, waktu running 20%:
- I = 95% × 900 = 855 W
- J = 10% × 900 = 90 W
- H = 855 × 20% + 90 × 80% = **243 W**
- Nyala 10 jam: **2.430 Wh/hari**. Rumus v1 (nameplate × jam): 9.000 Wh/hari.

**Chiller 900 W dari sheet revisi, DINAMIS STANDAR, nyala 24 jam.** K dan L dari master (20% / 80%):
- H = 855 × 20% + 90 × 80% = 243 W
- G = 243 W × 24 jam = **5,83 kWh/hari**. Rumus v1 (nameplate × jam): 21,6 kWh/hari.

**Alat dinamis tanpa K di master (alat kustom), toko 24 jam, mesin bekerja 12 jam.** I = 1,07 kW, J = 0,05 kW. K dihitung dari jam: 12 ÷ 24 = 50%.
- H = 1,07 × 50% + 0,05 × 50% = 0,56 kW
- G = 0,56 × 24 = **13,4 kWh/hari** (12 jam running + 12 jam standby)

**Transaksi dengan profil Chiller, 1 alat.** 50 transaksi × 60 detik, nyala 16 jam:
- Running: 855 W × 0,83 jam = 0,71 kWh
- Standby: 90 W × (16 − 0,83) jam = 1,37 kWh
- Total **2,08 kWh/hari**. K dan L tidak dipakai di rumus transaksi.

**Coffee Maker Delonghi, 1 mesin.** I = 1,25 kW, J = 0,05 kW, 60 detik per cup, 50 cup, nyala 16 jam:
- Running: 1,25 × (50 × 60 ÷ 3600) = 1,04 kWh
- Standby: 0,05 × (16 − 0,83) = 0,76 kWh
- Total **1,80 kWh/hari**, sama dengan v1.

**Dua mesin kopi, 50 cup total toko.** Nyala 16 jam per mesin:
- Running: 1,25 × 0,83 = 1,04 kWh
- Standby: 0,05 × (16 × 2 − 0,83) = 1,56 kWh
- Total **2,60 kWh/hari**. Cup tidak terhitung dua kali.

## 4. Aturan yang dikunci

1. K dan L untuk alat DINAMIS diambil dari **master per merek** (contoh sheet: Chiller 900 W, 20% / 80%, H = 243 W). Waktu nyala di form toko tetap berarti jam alat menyala. Hanya alat yang belum punya K di master, misalnya alat kustom yang belum direview, menghitung K dari jam: K = jam mesin bekerja ÷ jam buka toko, L = 100% − K.
2. Kalau waktu kerja (M × Q atau N × R) melebihi total jam nyala (O × P), form dan submit menolak isian.
3. Daya running 0 di master tidak pernah membuat alat dihitung 0 kWh. Daya base dipakai sebagai cadangan, dan laporan pembanding menandainya "profil belum lengkap".
4. Alat kustom dari toko memilih karakteristik dan metode sendiri. Untuk alat DINAMIS, running = 95% dan standby = 10% dari nameplate sampai admin membetulkannya saat review.
5. Setiap baris audit menyimpan snapshot profilnya (`formula_version` = 2, I, J, K, L, M/N, jam buka toko). Halaman validasi menghitung ulang dengan snapshot itu, jadi angkanya sama dengan saat submit.
6. Baris audit yang tersimpan sebelum v2 (`formula_version` kosong) tetap dihitung dengan rumus v1 kalau dikoreksi di halaman validasi.

## 5. Audit lama: laporan pembanding

Audit lama **tidak ditimpa**. Dampak rumus v2 dilihat lewat **Laporan > Pembanding Rumus Baru** (`app/admin/reports/formula-comparison/route.ts`):

- Satu baris per toko, dari audit selesai terakhir, tanpa DEMO dan Head Office.
- Standar lama = jumlah kWh baris alat yang tersimpan × 30.
- Standar baru = rumus v2 dengan profil master saat laporan diunduh.
- Kolom "Status Berubah" menandai toko yang berpindah Hemat ke Boros atau sebaliknya.
- Sheet "Rincian Alat" menjelaskan alat yang tidak dihitung ulang: alat tanpa tipe master, merek tidak terdaftar, atau profil dinamis yang belum lengkap.
- Jumlah transaksi di audit lama dulu diisi per alat, jadi laporan mengalikannya dengan jumlah alat sebelum memakai rumus v2.

### Ringkasan hasil

**Belum diisi.** Bagian ini diisi dari export sungguhan setelah:
1. migrasi `20261104010000_energy_formula_v2_profiles` dijalankan, dan
2. admin mengisi profil DINAMIS (running, standby, waktu running) untuk alat yang memang dinamis.

Tepat setelah migrasi, semua tipe STANDAR menjadi STATIS dengan nameplate = daya base lama, jadi laporan **harus** menunjukkan selisih 0 untuk alat STATIS. Kalau tidak 0, ada yang salah dan perlu dicek sebelum rumus dipakai.

| Isian | Nilai |
|---|---|
| Tanggal export | |
| Jumlah toko | |
| Status berubah | |
| Hemat ke Boros | |
| Boros ke Hemat | |
| Rata-rata selisih standar | |

## 6. Kategori

Kategori alat mengikuti kolom D sheet revisi, 7 kategori: Refrigeration, Lighting, VAC, POS, Signage & Display, Kitchen & Food Processing (Beanspot), Other Equipment. Kategori lama dipindah lewat migrasi `20261104010000_energy_formula_v2_profiles`:

| Kategori lama | Kategori baru |
|---|---|
| Sistem Tata Cahaya | Lighting; Polesign, Shop Sign, dan Listplank ke Signage & Display |
| Sistem Tata Udara dan Ventilasi | VAC |
| Sistem Refrigerasi | Refrigeration |
| Sistem Beanspot (semua tipe Beanspot) | Kitchen & Food Processing (Beanspot) |
| Lainnya | Paket Kasir dan Mesin ATM ke POS; sisanya ke Other Equipment |

Modul audit energi Tata Cahaya membaca Lighting dan Signage & Display; Tata Udara membaca VAC.

## 7. Yang belum diputuskan

- Angka profil DINAMIS per merek (running, standby, waktu running). Contoh 95% / 10% / 20% di sheet baru satu set dan dipakai sebagai bawaan alat kustom.
- Kapan rumus v2 dinyatakan resmi untuk pelaporan, setelah hasil laporan pembanding dibahas.
