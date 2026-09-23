# Spesifikasi Integrasi AutoCAD (.DXF) - Sparta Energy Calculator

Dokumen ini berisi rangkuman lengkap arsitektur, hasil analisis file CAD standar, aturan penempatan peralatan (AC & Lampu), dan panduan teknis integrasi file AutoCAD ke dalam kalkulator **Sparta Energy** (`light-estimation` dan `ac-mapping`).

---

## 1. Latar Belakang & Tujuan

Fitur ini bertujuan menggantikan/melengkapi proses menggambar kanvas manual dengan opsi **"Import Denah CAD (.dxf)"**.
Dengan mengunggah denah CAD toko:
1. **Ukuran Riil Otomatis:** Denah toko langsung tergambar di kanvas dengan skala meter riil (1:1) tanpa perlu pengukuran atau penggambaran manual.
2. **Deteksi Zona Otomatis:** Sistem langsung mengenali mana Dinding Kaca, Dinding Solid, Pintu Masuk, Pintu Gudang, Meja Kasir, dan Barisan Chiller.
3. **Auto-Placement Sesuai Aturan SOP:** Sistem Sparta Energy menempatkan rekomendasi AC dan Lampu secara presisi sesuai aturan teknis toko.

---

## 2. Hasil Analisis Anatomi File CAD Standar

Berdasarkan contoh file acuan standar toko retail (`Layout Kalkulator Standar A.Sales.dxf`), berikut adalah identitas setiap objek CAD:

| Objek di Toko | Entitas CAD | Identitas / Pola di CAD | Dimensi & Posisi Riil | Peran & Validasi di Sistem |
| :--- | :--- | :--- | :--- | :--- |
| **Dinding Batas Toko** | `LINE` | Layer 0 | Panjang: 12,0 m, Lebar: 10,0 m (Luas: 120 m²) | Menentukan batas kanvas & total luas kotor toko |
| **Dinding Depan Kaca** | `LWPOLYLINE` | Garis Ganda / Kusen | Panjang 12,0 m di sisi depan bawah | **DILARANG pasang AC** (kaca tidak bisa dibor / estetika) |
| **Dinding Samping & Belakang** | `LINE` | Garis Tunggal Solid | Dinding bata/partisi solid | **BOLEH pasang AC** (area penempatan unit indoor yang sah) |
| **Pintu Masuk Utama** | `INSERT` Block | Blok `pv180` (Pintu 2 Daun) | X: 8,36 m, Y: 2,48 m (Depan) | **DILARANG pasang AC** (akses pengunjung & bukaan pintu) |
| **Pintu Akses Gudang** | `INSERT` Block | Blok `P1` (Pintu 1 Daun) | X: 11,91 m, Y: 12,52 m (Belakang) | **DILARANG pasang AC** (akses internal ke gudang) |
| **Area Meja Kasir** | `HATCH` | Pattern `ANSI32` | 2,3 m x 3,9 m (Pojok kanan depan) | **DILARANG pasang AC langsung**; Prioritas lux lampu (500 lux) |
| **Barisan Chiller / Showcase** | `HATCH` | Pattern `ANSI37` | 7,2 m x 0,45 m (Menempel dinding belakang) | **DILARANG pasang AC di atasnya** (hindari embun/kondensasi) |
| **Lantai Belanja Pelanggan** | `HATCH` | Pattern `AR-SAND` | Poligon seluruh area di luar kasir & chiller | Area distribusi merata untuk AC dan Lampu |

---

## 3. Penerapan pada Kalkulator Sparta Energy

### A. Kalkulator Layout AC (`ac-mapping`)
**Aturan Penempatan Unit Indoor (SOP Lapangan):**
- Unit AC indoor **HANYA BOLEH** dipasang pada **Dinding Solid Biasa**.
- **Zona Terlarang (Excluded Walls):**
  1. *Dinding Kaca Depan:* Dilarang karena material kaca tembus pandang dan tidak memiliki struktur dudukan bracket.
  2. *Area Pintu Masuk (`pv180`) & Pintu Gudang (`P1`):* Dilarang karena mengganggu bukaan pintu dan instalasi kanopi/kusen.
  3. *Area Barisan Chiller (`ANSI37`):* Dilarang pasang AC tepat di atas chiller karena hembusan dingin/panas dan tetesan air kondensasi dapat merusak sirkulasi chiller.
  4. *Area Tepat di Atas Kasir (`ANSI32`):* Hindari hembusan langsung ke kasir yang diam bekerja berjam-jam.
- **Hasil:** Sistem otomatis memilih segmen dinding yang valid (dinding samping kiri/kanan atau sisa dinding belakang) untuk menaruh unit AC secara optimal.

---

### B. Kalkulator Lampu (`light-estimation`) & Beban AC (`ac-estimation`)
**Aturan Fiksasi Perhitungan Luas Efektif Sales (Net Sales Area):**
Sesuai standar operasional dan arsitektur toko retail, perhitungan kebutuhan titik lampu dan kapasitas pendinginan AC **secara baku menggunakan Luas Efektif Area Sales**, yaitu total luasan kotor lantai dikurangi area perabotan mati (*fixed equipment/fixtures*):

$$\mathbf{\text{Luas Sales Efektif}} = \mathbf{\text{Luas Total Toko}} - \mathbf{\text{Luas Barisan Chiller}} - \mathbf{\text{Luas Meja Kasir}}$$

**Simulasi Perhitungan Berdasarkan File Acuan Standar (`Layout Kalkulator Standar A.Sales.dxf`):**
1. **Luas Total Kotor (Gross Floor Area):**
   - Dimensi luar: $12{,}0\text{ m} \times 10{,}0\text{ m} = \mathbf{120{,}00\text{ m}^2}$
2. **Pengurang 1 — Barisan Chiller / Showcase (`HATCH ANSI37`):**
   - Dimensi blok: $7{,}20\text{ m} \times 0{,}45\text{ m} = \mathbf{3{,}24\text{ m}^2}$
3. **Pengurang 2 — Area Meja Kasir (`HATCH ANSI32`):**
   - Dimensi blok: $2{,}30\text{ m} \times 3{,}90\text{ m} = \mathbf{8{,}97\text{ m}^2}$
4. **Hasil Akhir Luas Efektif Sales:**
   - $\text{Luas Efektif} = 120{,}00\text{ m}^2 - 3{,}24\text{ m}^2 - 8{,}97\text{ m}^2 = \mathbf{107{,}79\text{ m}^2}$ ($\approx 107{,}8\text{ m}^2$)

**Dampak Teknis & Keunggulan pada Kalkulator:**
- **Kalkulator Lampu (`light-estimation`):**
  - Kebutuhan total lumen dan jumlah titik lampu dihitung presisi pada area belanja aktif ($107{,}8\text{ m}^2$).
  - Mencegah kelebihan daya (*over-lighting*) dan pemborosan konsumsi watt lampu di atas kanopi/bodi chiller.
  - Penataan grid lampu otomatis menyeimbangkan jarak antar-baris (JS) dan jarak antar-lampu (JB) pada ruang belanja efektif.
- **Kalkulator AC (`ac-estimation` & `ac-mapping`):**
  - Beban volume pendinginan dihitung berdasarkan area aktivitas pembeli riil.
  - Unit AC tidak dipasang membentur bodi chiller maupun kaca depan, melainkan fokus mendistribusikan aliran udara dingin ke lorong belanja.

---

## 4. Alur Kerja Pengguna (User Flow)

```
[ User Klik "Import CAD (.dxf)" ]
                │
                ▼
[ Parser Client-side Membaca DXF (<0.1 detik) ]
  ├── Ekstraksi Garis Dinding Luar ──> Dimensi 12m x 10m (120 m²)
  ├── Ekstraksi Garis Kaca & Pintu ──> Tandai dinding terlarang AC (Kaca, Pintu pv180, P1)
  ├── Ekstraksi HATCH ANSI37       ──> Blok Chiller: 7.2m x 0.45m (3.24 m²)
  └── Ekstraksi HATCH ANSI32       ──> Blok Kasir: 2.3m x 3.9m (8.97 m²)
                │
                ▼
[ Kalkulasi Luas Efektif Otomatis ]
  Luas Efektif = 120.00 - 3.24 - 8.97 = 107.79 m²
                │
                ▼
[ Output JSON Terintegrasi ke Kanvas ]
  ├── Kanvas ter-render dengan bentuk denah, chiller, kasir, & dimensi riil
  ├── Kalkulator Lampu: Auto-generate grid lampu pada Luas Efektif (107.79 m²)
  └── Kalkulator AC: Auto-place unit AC hanya di dinding valid (bebas chiller/kaca)
                │
                ▼
[ Review & Fine-Tuning ]
  User melihat layout presisi dan dapat mengatur titik manual jika diperlukan
```

---

## 5. Keamanan Berkas & Git

Berkas contoh gambar CAD telah dimasukkan ke dalam `.gitignore` di root proyek `sparta-energy` agar tidak ter-commit ke repositori Git publik/production:
```gitignore
# cad drawing examples
example_dwg_dxf/
*.dwg
*.dxf
```

---

*Catatan dibuat: 23 September 2026 - Sparta Energy Architecture Docs*
