# Changelog - Kalkulator Estimasi Lampu

Semua perubahan dan riwayat perbaikan pada engine kalkulator estimasi pencahayaan lampu LED toko dicatat di dokumen ini.

Format penomoran versi mengikuti aturan [Semantic Versioning (SemVer)](https://semver.org/):
- **MAJOR** (`v2.0.0`): Perombakan total arsitektur engine / geometri denah poligon.
- **MINOR** (`v1.1.0`): Penyesuaian rasio W/m², standar Lux, penambahan parameter spasial/grid, atau fitur baru.
- **PATCH** (`v1.1.1`): Perbaikan bug kecil, penataan tepi poligon, perbaikan UI/UX canvas, atau export kartu unduhan.

---

## [v1.1.0] - 2026-09-04
### Added
- Standardisasi versi engine kalkulator (`v1.1.0`) pada header web dan kartu unduhan hasil estimasi (PNG).
- Penempatan label versi di bawah branding SPARTA ENERGY pada kartu unduhan.
- Integrasi pencatatan log hasil estimasi lampu ke database via server action (`saveLightEstimationLog`).
- Penyesuaian terminologi kartu hasil download (Luas Plafond Efektif, Referensi Layout Lampu, Label Jarak JB & JS, serta pembersihan teks ringkasan agar lebih ringkas & fokus).

### Baseline Capabilities
- Algoritma polygon ray-intersection untuk penempatan titik lampu otomatis pada denah toko simetris maupun custom poligon tidak beraturan.
- Fitur rotasi denah, zoom/pan canvas, manual toggle titik lampu, dan visualisasi dimensi jarak dinding (JS / JB).
- Standar rasio konsumsi daya 4.0 - 5.0 W/m² (Lampu LED 13.5W) dan verifikasi status ideal/toleransi Lux.
- Ekspor layout hasil estimasi ke format gambar PNG berkualitas tinggi dengan kartu spesifikasi teknis.

---

## [v1.0.0] - Historical Baseline
### Initial
- Fase rilis awal, kalibrasi algoritma penempatan lampu, dan uji coba layout kanvas poligon.
