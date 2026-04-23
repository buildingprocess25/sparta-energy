# AI Context - SPARTA Energy

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
- Input Luas 4 Area Utama: Area Parkir, Area Teras, Area Sales, Area Gudang+Selasar+KM.

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
