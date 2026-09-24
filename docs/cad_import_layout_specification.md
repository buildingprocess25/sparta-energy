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

## 6. Rencana Masa Depan: Kanvas Terpadu (*Unified Energy Layout Studio*)

Rencana strategis jangka panjang sistem Sparta Energy adalah menggabungkan kanvas manual dan import CAD ke dalam satu halaman kerja terpadu (*Unified Store Workspace*). Pengguna dapat menginput denah sekali saja, lalu menghitung kebutuhan AC, Lampu, atau keduanya sekaligus secara komprehensif.

### A. Arsitektur *Single Source of Truth* (`StoreLayoutModel`)
Untuk memastikan input gambar manual dan import CAD dapat saling dipertukarkan tanpa merombak logika perhitungan, keduanya menghasilkan skema data standar yang seragam:

```typescript
export interface StoreLayoutModel {
  source: 'cad_dxf' | 'manual_canvas';
  dimensions: {
    length: number;      // meter
    width: number;       // meter
    height: number;      // meter (plafon)
  };
  metrics: {
    grossArea: number;   // m² (total luas kotor)
    chillerArea: number; // m² (pengurang 1: chiller)
    cashierArea: number; // m² (pengurang 2: kasir)
    netSalesArea: number;// m² (luas efektif sales = gross - chiller - cashier)
  };
  walls: Array<{
    id: string;
    start: { x: number; y: number };
    end: { x: number; y: number };
    type: 'solid' | 'glass' | 'opening';
    isAcAllowed: boolean;
  }>;
  fixtures: Array<{
    id: string;
    name: string;
    type: 'chiller' | 'cashier' | 'door_main' | 'door_warehouse';
    bounds: { x: number; y: number; width: number; height: number };
    polygon?: Array<{ x: number; y: number }>;
  }>;
}
```

### B. Konsep Tampilan Kanvas Multi-Layer (*Layer-Based Studio*)
Kanvas utama di masa depan dirancang dengan sistem layer yang dapat di-toggle atau dilihat bersamaan:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED ENERGY STUDIO                           │
├────────────────────────────────────────────────────────────────────────┤
│ [Denah Toko: Standard A (CAD)]  |  [Toggle Layer: ☑ Denah ☑ AC ☑ Lampu] │
├──────────────────────────────────────┬─────────────────────────────────┤
│                                      │ TAB METRIK & HASIL:             │
│   ┌──────────────────────────────┐   │ ┌─────────────────────────────┐ │
│   │ [AC 1]            [Chiller]  │   │ │ 📊 Ringkasan Denah:         │ │
│   │   │                     │    │   │ │ - Luas Kotor: 120 m²        │ │
│   │   ▼ Hembusan            ▼    │   │ │ - Luas Efektif: 107.8 m²    │ │
│   │                              │   │ ├─────────────────────────────┤ │
│   │  💡 ── 💡 ── 💡  (Grid Lampu)│   │ │ ❄️ Rekomendasi AC:          │ │
│   │                              │   │ │ - Total: 6.5 PK (3 Unit)    │ │
│   │  💡 ── 💡 ── 💡              │   │ │ - Konsumsi: ~4.8 kW         │ │
│   │                              │   │ ├─────────────────────────────┤ │
│   │ [Pintu]           [Kasir 💡] │   │ │ 💡 Rekomendasi Lampu:       │ │
│   │ [Kaca Depan / No AC Allowed] │   │ │ - Total: 18 Titik (500 Lux) │ │
│   └──────────────────────────────┘   │ │ - Konsumsi: ~0.72 kW        │ │
│                                      │ ├─────────────────────────────┤ │
│                                      │ │ ⚡ TOTAL BEBAN LISTRIK TOKO: │ │
│                                      │ │   5.52 kW (~6.9 kVA)        │ │
│                                      │ └─────────────────────────────┘ │
└──────────────────────────────────────┴─────────────────────────────────┘
```

1. **Layer 1 - Denah Dasar (*Base Architectural Layer*):**
   - Menampilkan dinding toko, kaca depan, pintu keluar/masuk, meja kasir, dan chiller.
   - Pilihan input: Import file `.dxf` atau Gambar manual dengan tool rectangle/wall di kanvas.
2. **Layer 2 - Tata Letak AC (*AC Mapping Layer*):**
   - Menampilkan unit indoor AC pada dinding yang valid.
   - Simulasi vektor hembusan udara dingin (*airflow coverage*).
   - Estimasi kapasitas PK & beban pendinginan.
3. **Layer 3 - Tata Letak Pencahayaan (*Lighting Grid Layer*):**
   - Menampilkan grid baris $\times$ kolom titik lampu pada area efektif belanja ($107{,}8\text{ m}^2$).
   - Heatmap distribusi lux (target: 500 lux kasir, 300 lux lorong).
4. **Laporan Terpadu Beban Energi Toko (*Total Store Energy Load*):**
   - Menggabungkan perhitungan daya listrik (Watt) AC + Lampu dalam satu ringkasan audit/rekomendasi.

---

### C. Rencana Tahapan Eksekusi (Roadmap)

| Fase | Fokus Pekerjaan | Target Hasil |
| :--- | :--- | :--- |
| **Fase 1 (Sekarang)** | Implementasi DXF Parser & Integrasi ke `ac-mapping` | Parsing entitas CAD berjalan mulus, validasi zona dinding terlarang AC teruji di kanvas AC. |
| **Fase 2** | Penerapan Parser ke `light-estimation` | Menghitung otomatis grid titik lampu & watt berdasarkan *Net Sales Area* dari CAD. |
| **Fase 3 (Final)** | Penggabungan ke *Unified Energy Studio* (`/layout-studio` atau halaman terpadu) | Satu kanvas terintegrasi dengan opsi layer AC, layer Lampu, serta total ringkasan beban listrik toko. |

---

## 7. Keamanan Berkas & Git

Berkas contoh gambar CAD telah dimasukkan ke dalam `.gitignore` di root proyek `sparta-energy` agar tidak ter-commit ke repositori Git publik/production:
```gitignore
# cad drawing examples
example_dwg_dxf/
*.dwg
*.dxf
```

---

*Catatan diperbarui: 24 September 2026 - Sparta Energy Architecture Docs*
