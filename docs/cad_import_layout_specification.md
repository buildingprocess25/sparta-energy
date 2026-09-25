# Spesifikasi Integrasi AutoCAD (.DXF) - Sparta Energy Calculator

Dokumen ini berisi rangkuman lengkap arsitektur, hasil analisis file CAD standar, aturan penempatan peralatan (AC & Lampu), dan panduan teknis integrasi file AutoCAD ke dalam kalkulator **Sparta Energy** (`light-estimation` dan `ac-mapping`).

---

## 1. Latar Belakang & Tujuan

Fitur ini bertujuan menggantikan/melengkapi proses menggambar kanvas manual dengan opsi **"Import Denah CAD (.dxf)"**.
Dengan mengunggah denah CAD toko:
1. **Ukuran Riil Otomatis:** Denah toko langsung tergambar di kanvas dengan skala meter riil (1:1) tanpa perlu pengukuran atau penggambaran manual.
2. **Deteksi Zona Otomatis:** Sistem langsung mengenali mana Dinding Kaca, Dinding Solid, Pintu Masuk, Pintu Gudang, Meja Kasir, Barisan Chiller, dan Kolom/Pilar Struktur.
3. **Auto-Placement Sesuai Aturan SOP:** Sistem Sparta Energy menempatkan rekomendasi AC dan Lampu secara presisi sesuai aturan teknis toko.

---

## 2. Hasil Analisis Anatomi File CAD Standar (V1 & V2 Revisi Arsir)

Berdasarkan evolusi file acuan toko retail (`Layout Kalkulator Standar A.Sales.dxf` dan `Layout Kalkulator Standar A Sales V2 revisi arsir.dxf`), berikut adalah spesifikasi anatomi objek CAD:

| Objek di Toko | Entitas CAD | Identitas V1 | Identitas V2 (Revisi Arsir Terkini) | Dimensi & Posisi Riil | Peran & Validasi di Sistem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dinding Batas Toko** | `LINE` | Layer `0` | Layer `0` | $12,0\text{ m} \times 11,0\text{ m}$ (Trapesium/Persegi) | Menentukan batas kanvas & total luas kotor toko |
| **Dinding Depan Kaca** | `HATCH` / `LWPOLYLINE` | `LWPOLYLINE` (Garis Ganda) | **`HATCH` Pattern `GOST_GLASS`** | Panjang $\pm 11\text{ - }12\text{ m}$ di sisi depan ($Y \approx 0,53\text{ m}$) | **DILARANG pasang AC** (kaca/kusen tidak bisa dibor) |
| **Pintu Masuk Utama** | `INSERT` Block | Blok `pv180` | **Blok `double swing`** (atau `pv180`) | $X \approx 6,64\text{ m}, Y \approx 0,49\text{ m}$ (Depan) | **DILARANG pasang AC** (akses pintu bukaan & pengunjung) |
| **Pintu Akses Gudang** | `INSERT` Block | Blok `P1` | **Blok `P1`** | $X \approx 9,65\text{ m}, Y \approx 11,06\text{ m}$ (Belakang) | **DILARANG pasang AC** (akses internal gudang) |
| **Area Meja Kasir** | `HATCH` | Pattern `ANSI32` | **Pattern `ANSI32`** | $2,3\text{ m} \times 3,9\text{ m}$ (Pojok depan) | **DILARANG pasang AC langsung**; Prioritas lux lampu ($500\text{ lux}$) |
| **Barisan Chiller** | `HATCH` | Pattern `ANSI37` | **Pattern `ANSI37`** | $7,2\text{ m} \times 0,45\text{ m}$ (Menempel dinding belakang) | **DILARANG pasang AC di atasnya** (cegah kondensasi/embun) |
| **Lantai Belanja** | `HATCH` | Pattern `AR-SAND` | **Pattern `AR-SAND`** | Poligon seluruh area terbuka | Area distribusi merata untuk AC dan Lampu |
| **Kolom / Pilar Tengah** | `HATCH` / `LWPOLYLINE` / Block | *Belum ada* | **Pattern `AR-CONC`** (2 Pilar) / Blok `KOLOM` | **Pilar 1:** $(X \approx 7.08\text{ m}, Y \approx 3.85\text{ m})$<br>**Pilar 2:** $(X \approx 7.08\text{ m}, Y \approx 7.85\text{ m})$ | **Pilar / Obstacle:** Pengurang luas bersih ($0.18\text{ m}^2$) & rintangan penempatan fixture |

---

## 3. Penerapan pada Kalkulator Sparta Energy

### A. Kalkulator Layout AC (`ac-mapping`)
**Aturan Penempatan Unit Indoor (SOP Lapangan):**
- Unit AC indoor **HANYA BOLEH** dipasang pada **Dinding Solid Biasa**.
- **Zona Terlarang (Excluded Walls):**
  1. *Dinding Kaca Depan (`GOST_GLASS`):* Dilarang karena material kaca tembus pandang dan tidak memiliki struktur dudukan bracket.
  2. *Area Pintu Masuk (`double swing` / `pv180`) & Pintu Gudang (`P1`):* Dilarang karena mengganggu bukaan pintu dan instalasi kanopi/kusen.
  3. *Area Barisan Chiller (`ANSI37`):* Dilarang pasang AC tepat di atas chiller karena hembusan dingin/panas dan tetesan air kondensasi dapat merusak sirkulasi chiller.
  4. *Area Tepat di Atas Kasir (`ANSI32`):* Hindari hembusan langsung ke kasir yang diam bekerja berjam-jam.
  5. *Area Kolom/Pilar Tengah (`AR-CONC`):* Diperlakukan sebagai rintangan/obstacle internal.
- **Hasil:** Sistem otomatis memilih segmen dinding yang valid (dinding samping kiri/kanan atau sisa dinding belakang) untuk menaruh unit AC secara optimal.

---

### B. Kalkulator Lampu (`light-estimation`) & Beban AC (`ac-estimation`)

**1. Aturan Perhitungan Luas Efektif Sales (Net Sales Area):**
Sesuai standar operasional dan arsitektur toko retail, luasan bersih area belanja aktif dihitung dengan mengurangi perabotan mati dan pilar (*fixed equipment & obstacles*):

$$\mathbf{\text{Luas Sales Bersih (Net)}} = \mathbf{\text{Luas Total Toko (Gross)}} - \mathbf{\text{Luas Chiller}} - \mathbf{\text{Luas Kasir}} - \mathbf{\text{Luas Kolom/Pilar}}$$

**2. Catatan & Agenda Diskusi Teknis (AC vs Lampu):**
- **Kalkulator AC (`ac-mapping` & `ac-estimation`):**
  - *Status Saat Ini*: Menggunakan **Luas Bersih (`effectiveArea`)** untuk total BTU agar tidak terjadi *oversizing* akibat beban dingin mandiri dari chiller display.
  - *Agenda Kajian Lanjutan*: Membandingkan apakah beban udara termal AC lebih ideal menggunakan **Luas Kotor (Gross)** untuk mencakup total volume kubikasi udara toko atau tetap menggunakan Luas Bersih.
- **Kalkulator Lampu (`light-estimation`):**
  - *Status*: Menggunakan **Luas Bersih & Zonasi Terpisah**, karena:
    1. **Di atas Chiller**: Tidak dipasang lampu plafon reguler (kanopi chiller memiliki sistem lampu display mandiri).
    2. **Di atas Meja Kasir**: Memerlukan jenis & intensitas lampu berbeda (fokus $500\text{ lux}$ untuk akurasi transaksi POS).
    3. **Kolom / Pilar Struktur (`AR-CONC`)**: Objek padat mati yang tidak memerlukan penerangan dan menjadi batas bebas armatur lampu (*obstacle clearance*).
  - *Formula Kebutuhan Lumen*:
    $$\text{Total Lumen} = \frac{(\text{Luas Sales Bersih} \times 300\text{ lux}) + (\text{Luas Kasir} \times 500\text{ lux})}{\text{UF} \times \text{MF}}$$

---

## 4. Alur Kerja Pengguna (User Flow)

```
[ User Klik "Import CAD (.dxf)" ]
                │
                ▼
[ Parser Client-side Membaca DXF (<0.1 detik) ]
  ├── Ekstraksi Garis Dinding Luar ──> Dimensi kotor & poligon kanvas
  ├── Ekstraksi HATCH GOST_GLASS   ──> Dinding Kaca Depan (No AC Allowed)
  ├── Ekstraksi Blok Pintu         ──> Pintu Utama (double swing) & P1
  ├── Ekstraksi HATCH ANSI37       ──> Blok Chiller (No AC Allowed di atasnya)
  ├── Ekstraksi HATCH ANSI32       ──> Blok Kasir (Prioritas 500 lux)
  └── Ekstraksi HATCH AR-CONC      ──> Kolom / Pilar Tengah (Obstacle grid lampu)
                │
                ▼
[ Kalkulasi Luas Efektif Otomatis ]
  Luas Efektif = Luas Total - Chiller - Kasir - Kolom
                │
                ▼
[ Output JSON Terintegrasi ke Kanvas ]
  ├── Kanvas ter-render dengan bentuk denah, chiller, kasir, kolom, & dimensi riil
  ├── Kalkulator Lampu: Auto-generate grid lampu pada Luas Efektif tanpa menabrak kolom
  └── Kalkulator AC: Auto-place unit AC hanya di dinding solid yang valid
```

---

## 5. Arsitektur Data Standar (`StoreLayoutModel`)

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
    columnArea?: number; // m² (pengurang 3: kolom/pilar)
    netSalesArea: number;// m² (luas efektif sales = gross - chiller - cashier - column)
  };
  walls: Array<{
    id: string;
    start: { x: number; y: number };
    end: { x: number; y: number };
    type: 'solid' | 'glass' | 'opening';
    isAcAllowed: boolean;
  }>;
  zones: {
    cashier?: CadZoneArea;
    chiller?: CadZoneArea;
    glass?: CadZoneArea;
    columns?: CadZoneArea[];
  };
}
```

---

## 6. Rencana Masa Depan: Kanvas Terpadu (*Unified Energy Layout Studio*)

Rencana strategis jangka panjang sistem Sparta Energy adalah menggabungkan kanvas manual dan import CAD ke dalam satu halaman kerja terpadu (*Unified Store Workspace*). Pengguna dapat menginput denah sekali saja, lalu menghitung kebutuhan AC, Lampu, atau keduanya sekaligus secara komprehensif.

### Konsep Tampilan Kanvas Multi-Layer (*Layer-Based Studio*)

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
│   │     [Pilar/AR-CONC]          │   │ │ - Total: 6.5 PK (3 Unit)    │ │
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
   - Menampilkan dinding toko, kaca depan (`GOST_GLASS`), pintu keluar/masuk (`double swing`/`P1`), meja kasir (`ANSI32`), chiller (`ANSI37`), dan kolom (`AR-CONC`).
2. **Layer 2 - Tata Letak AC (*AC Mapping Layer*):**
   - Menampilkan unit indoor AC pada dinding yang valid.
   - Simulasi vektor hembusan udara dingin (*airflow coverage*).
3. **Layer 3 - Tata Letak Pencahayaan (*Lighting Grid Layer*):**
   - Menampilkan grid baris $\times$ kolom titik lampu pada area efektif belanja ($A_{\text{net}}$) dengan *clearance* kolom pilar.
   - Target lux: 500 lux kasir, 300 lux lorong belanja.
4. **Laporan Terpadu Beban Energi Toko (*Total Store Energy Load*):**
   - Menggabungkan perhitungan daya listrik (Watt) AC + Lampu dalam satu ringkasan audit/rekomendasi.

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

*Catatan diperbarui: 25 September 2026 - Sparta Energy Architecture Docs (V2 HATCH Revision Standard)*
