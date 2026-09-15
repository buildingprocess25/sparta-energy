# Changelog - Kalkulator Estimasi AC

Semua perubahan dan riwayat perbaikan pada engine kalkulator estimasi kebutuhan pendingin ruangan (AC) dicatat di dokumen ini.

Format penomoran versi mengikuti aturan [Semantic Versioning (SemVer)](https://semver.org/):
- **MAJOR** (`v2.0.0`): Perombakan total rumus dasar / arsitektur perhitungan.
- **MINOR** (`v1.1.0` / `v2.2.0`): Penyesuaian formula beban termal, penambahan parameter bangunan/geometri, atau fitur baru.
- **PATCH** (`v1.1.1`): Perbaikan bug kecil, penyesuaian UI/UX, atau perbaikan glitch visual/export kartu unduhan.

---

## [v1.2.0] - 2026-09-15
### Added
- Penetapan standar operasional resmi tahun 2026 menggunakan **`v1.2.0`** berbasis **Flat Closest Deviation (Target 600 BTU/m²)**.
- Tingkat kesesuaian mencapai 98.6% (358 dari 363 toko peremajaan) identik dengan rasio riil tim operasional di lapangan.
- Eliminasi aturan pembulatan buatan asimetris untuk menjamin objektivitas audit dan efisiensi anggaran pengadaan (CAPEX).
- Dokumentasi varian komparasi **`v1.2-adj`** (eksperimen klaster suhu asimetris A/B/C) sebagai arsip riset.
- Dokumentasi konsep **`Interpolasi - Soon 2027`** sebagai roadmap R&D jangka panjang berbasis formula linier dinamis suhu mikro tanpa mengunci nomor versi software.

---

## [v1.1.0] - 2026-09-04
### Added
- Standardisasi versi engine kalkulator (`v1.1.0`) pada header web dan kartu unduhan hasil estimasi (PNG).
- Penempatan label versi di bawah branding SPARTA ENERGY pada kartu unduhan.
- Integrasi pencatatan log hasil estimasi ke database via server action (`saveAcEstimationLog`).
- Penyederhanaan teks modal konfirmasi perhitungan ("Titik Koordinat Toko") dan pembersihan sub-keterangan hasil agar ringkas & fokus.

### Baseline Capabilities
- Perhitungan Cooling Load (BTU/hr & PK) berbasis luas ruangan, volume, dan tinggi plafon.
- Estimasi beban termal radiasi matahari berdasarkan orientasi kaca/dinding terhadap arah mata angin.
- Estimasi beban internal (okupansi pelanggan, lampu, dan peralatan pendingin/chiller).
- Rekomendasi pembagian unit AC (kombinasi 1.5 PK / 2 PK) dan estimasi biaya operasional bulanan.

---

## [v1.0.0] - Historical Baseline
### Initial
- Fase rilis awal, kalibrasi awal formula BTU, dan uji coba lapangan.
