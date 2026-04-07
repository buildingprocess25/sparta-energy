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

## End-to-End User Flow

1. Login

- Akses dibatasi untuk karyawan internal.

2. Dashboard

- Ringkasan jumlah toko.
- Jumlah toko hemat vs boros.
- Akses cepat untuk mulai audit baru.

3. Input Data Toko

- Identitas toko: kode, lokasi, luas, daya listrik.
- Tipe toko: Regular, Advance, dll.

4. Input Equipment per Area

- Area toko: Sales, Teras, Parkiran, Gudang, dll.
- User memilih equipment per area.
- Input per equipment: jumlah unit, jam operasional.
- Sistem menghitung konsumsi listrik estimasi (kWh).

5. Input History kWh (PLN)

- Data tagihan listrik 12 bulan(user 2) dan 1 bulan(user 1).
- Dipakai untuk validasi dengan real usage.

6. Kalkulasi Otomatis

- Total konsumsi.
- Konsumsi per meter persegi.
- Perbandingan dengan standar.

7. Hasil Audit

- Klasifikasi akhir: Hemat vs Boros.
- Output pendukung: grafik, breakdown per area, perbandingan data.

## Core Functions

### 1) Analisis Konsumsi Energi

- Menggabungkan:
  - Estimasi teknis berbasis equipment.
  - Data real usage dari PLN.
- Lalu dibandingkan terhadap benchmark/standar.

### 2) Kalkulasi Otomatis

Rumus utama:

- kWh = Watt x jumlah x jam / 1000
- Konsumsi efektif = kWh / luas toko

### 3) Identifikasi Sumber Boros

- Ada breakdown konsumsi per area.
- Memudahkan identifikasi akar masalah, misalnya:
  - AC menyala terlalu lama.
  - Jumlah freezer berlebih.
  - Lampu tidak efisien.

### 4) Monitoring dan Reporting

- Riwayat audit semua toko.
- Statistik performa.
- Top toko hemat dan boros.
- Export laporan.

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
