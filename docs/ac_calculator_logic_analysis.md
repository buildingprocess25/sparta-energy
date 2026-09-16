# Analisis & Dokumentasi Logika Kalkulator AC (v1.1.0, v1.2.0, v1.2-adj, dan Interpolasi - Soon 2027)

Dokumen ini mencatat evolusi metode, logika perhitungan, dan roadmap kebutuhan unit AC (2 PK / 18.000 BTU) untuk toko retail pada SPARTA Energy.

---

## 1. Ringkasan Roadmap & 4 Model Logika Perhitungan

| Parameter | v1.1.0 (Baku Excel 2023) | v1.2.0 (Standar Resmi 2026) | v1.2-adj (Varian Komparasi) | Interpolasi - Soon 2027 |
| :--- | :--- | :--- | :--- | :--- |
| **Status Roadmap** | Versi Historis / Produksi Awal | **Standar Utama Operasional 2026** | Varian Arsip Riset | **Roadmap R&D Jangka Panjang** |
| **Konsep Acuan** | 3 Klaster Suhu (450 / 600 / 751) | **3 Klaster Suhu (450 / 600 / 751)** | 3 Klaster Suhu (450 / 600 / 751) | **Target Linier Universal (+18.625 / °C)** |
| **Aturan Pembulatan** | Strict Minimum (Wajib naik jika di bawah batas) | **Deviasi Terdekat Murni (Closest Distance ke Target Klaster)** | Klaster A: Round Up<br>Klaster B: Deviasi Terdekat<br>Klaster C: Round Down | Deviasi Terdekat ke Titik Interpolasi Suhu |
| **Batas Pengaman** | Kaku per rentang bucket | Batas klaster sesuai zona suhu toko | Batas bawah & atas terjaga per klaster | Batas Bawah Mutlak 450 & Batas Atas Mutlak 900 |
| **Kelebihan Utama** | Jaminan dingin 100% | **98.6% sesuai rasio lapangan, objektif & adaptif 3 zona suhu** | Transisi mulus di suhu sejuk & hemat di suhu panas | Sangat proporsional terhadap variasi cuaca harian |
| **Kekurangan / Catatan** | Boros CAPEX & listrik pada luas kritis | Menjaga stabilitas tanpa manipulasi buatan | Ada penambahan unit pada toko ekstrem klaster C | Memerlukan kesiapan data telemetri cuaca mikro |

---

## 2. Rincian Logika Masing-Masing Model

### A. Versi 1.1.0 (v1.1.0): Standar Baku Excel 2023 (Strict Minimum Range)
Mengikuti aturan historis `Kalkulator AC new 2023 ver 2.xlsx`:
* **Klaster Beban**:
  * Suhu di bawah 27°C: Target 450 BTU/m² (Rentang 450 - 599)
  * Suhu 27°C s/d 35°C: Target 600 BTU/m² (Rentang 600 - 749)
  * Suhu di atas 35°C: Target 751 BTU/m² (Rentang 751 - 900)
* **Logika Pemilihan Unit**:
  Jika opsi pembulatan ke bawah menghasilkan densitas di bawah batas minimal (misal di bawah 600 BTU/m² pada Klaster B), sistem **wajib memilih pembulatan ke atas**.

---

### B. Versi 1.2.0 (v1.2.0): Standar Operasional 2026 (Deviasi Terdekat per Klaster Suhu)
Standar resmi yang ditetapkan untuk operasional tahun 2026:
* **3 Zona Klaster Suhu Toko**:
  * **Suhu Sejuk (< 27°C)**: Target **450 BTU/m²**
  * **Suhu Normal (27°C – 35°C)**: Target **600 BTU/m²** (standar acuan mayoritas ritel)
  * **Suhu Panas Ekstrem (> 35°C)**: Target **751 BTU/m²**
* **Logika Pemilihan Unit**:
  Sistem menghitung $\text{Total Beban} = \text{Luas} \times \text{Target Klaster Suhu}$, membandingkan opsi pembulatan ke bawah (`Math.floor`) dan ke atas (`Math.ceil`), lalu memilih opsi yang selisih densitas aktualnya paling dekat (*closest deviation*) dengan target klaster suhu tersebut.
* **Hasil Validasi Lapangan**:
  Dari 363 toko peremajaan, **358 toko (98.6%) menghasilkan angka yang sama persis** dengan rasio manual lama yang terbukti stabil di lapangan, dan 5 toko menghemat 1 unit AC tanpa ada pembengkakan anggaran.

---

### C. Versi 1.2-adj (v1.2-adj): Varian Klaster Suhu Asimetris
Varian eksperimen yang menggabungkan 3 klaster klasik dengan aturan pembulatan asimetris per zona cuaca:
1. **Klaster A (< 27°C)**: Target 450 BTU/m², pembulatan ke atas (`Math.ceil`) untuk cadangan dingin daerah sejuk.
2. **Klaster B (27°C - 35°C)**: Target 600 BTU/m², pembulatan deviasi terdekat ke 600.
3. **Klaster C (> 35°C)**: Target 751 BTU/m², pembulatan ke bawah (`Math.floor`) untuk menahan lonjakan CAPEX.
* *Status*: Disimpan sebagai arsip perbandingan teknis.

---

### D. Interpolasi - Soon 2027: Roadmap R&D Jangka Panjang
Konsep berbasis rumus kurva linier bertahap yang dinamis terhadap temperatur riil lingkungan tanpa terikat batas versi angka:
* **Rumus Interpolasi Beban Suhu**:
  * `Target BTU = 600 + (Suhu - 27) * 18.625`
* **Batas Pengaman Mutlak (Clamping)**:
  * **Batas Bawah (Floor)**: Minimal 450 BTU/m² (untuk suhu 19°C ke bawah)
  * **Batas Atas (Ceiling)**: Maksimal 900 BTU/m² (untuk suhu 43°C ke atas)
* **Logika Pemilihan Unit**:
  Memilih pembulatan yang deviasinya paling dekat ke angka hasil interpolasi suhu toko tersebut.

#### Tabel Target BTU Hasil Interpolasi Berdasarkan Suhu:
* **Suhu 15°C - 18°C**: 450.00 BTU/m² (Terkunci di Batas Bawah / Floor)
* **Suhu 19°C**: 450.94 BTU/m²
* **Suhu 22°C**: 506.88 BTU/m²
* **Suhu 25°C**: 562.81 BTU/m²
* **Suhu 27°C**: 600.00 BTU/m² (Titik Acuan Dasar Ritel)
* **Suhu 30°C**: 655.88 BTU/m²
* **Suhu 33°C**: 711.75 BTU/m²
* **Suhu 35°C**: 749.00 BTU/m²
* **Suhu 38°C**: 804.88 BTU/m²
* **Suhu 41°C**: 860.81 BTU/m²
* **Suhu 43°C - 45°C**: 900.00 BTU/m² (Terkunci di Batas Atas / Ceiling)

---

## 3. Contoh Komparasi 4 Model (Toko Luas 130 m², AC 2 PK = 18.000 BTU)

| Kondisi Cuaca | Suhu Luar | v1.1.0 (Baku 2023) | **v1.2.0 (Resmi 2026)** | v1.2-adj (Asimetris) | Interpolasi - Soon 2027 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Daerah Sejuk** | 25°C | 4 Unit (554 BTU) | **4 Unit (554 BTU)** | 4 Unit (554 BTU) | 4 Unit (554 BTU) |
| **Batas Sejuk** | 26.5°C | 4 Unit (554 BTU) | **4 Unit (554 BTU)** | 4 Unit (554 BTU) | 4 Unit (554 BTU) |
| **Standar Normal** | 30°C | 5 Unit (692 BTU) | **4 Unit (554 BTU)** | 4 Unit (554 BTU) | 5 Unit (692 BTU) |
| **Sangat Panas** | 36°C | 6 Unit (831 BTU) | **5 Unit (692 BTU)** | 5 Unit (692 BTU) | 6 Unit (831 BTU) |

---

## 4. Kesimpulan Implementasi

1. **Standar Operasional 2026**: Menggunakan **`v1.2.0`** (Flat Closest Deviation 600 BTU/m²) sebagai acuan resmi pengadaan dan relokasi AC.
2. **Roadmap R&D 2027**: Mengembangkan dan mengkaji model **`Interpolasi - Soon 2027`** seiring integrasi data telemetri suhu mikro pada toko-toko SPARTA Energy.

---

## 5. File Simulasi Data

Data komparasi lengkap untuk seluruh kombinasi luas (50 m² – 200 m²) dan suhu luar (15°C – 45°C) dengan total **4.681 baris data** tersedia di file:
- **[Perbandingan_Kalkulator_AC_v1_vs_v2_vs_v2.2_vs_v3.xlsx](file:///d:/Coding/sparta-energy/Perbandingan_Kalkulator_AC_v1_vs_v2_vs_v2.2_vs_v3.xlsx)**
- **[Perbandingan_Kalkulator_AC_v1_vs_v2_vs_v2.2_vs_v3.csv](file:///d:/Coding/sparta-energy/Perbandingan_Kalkulator_AC_v1_vs_v2_vs_v2.2_vs_v3.csv)**

**Struktur Urutan Kolom:**
1. `Suhu (C)`: Suhu maksimal luar ruangan (15 s/d 45)
2. `Luas (m2)`: Luas area sales toko (50 s/d 200)
3. `Target BTU (V1/V2/V2.2)`: Target beban klaster acuan (450 / 600 / 751)
4. `Qty V1 (Baku)`: Jumlah unit AC metode baku Excel 2023
5. `BTU/m2 V1`: Densitas pendinginan aktual V1
6. `Qty V2.0 (Flat)`: Jumlah unit AC metode V2.0 deviasi flat
7. `BTU/m2 V2.0`: Densitas pendinginan aktual V2.0
8. `Qty V2.2 (Aktual 2026)`: Jumlah unit AC metode V2.2 operasional 2026
9. `BTU/m2 V2.2`: Densitas pendinginan aktual V2.2
10. `Selisih V2.2 ke Target`: Deviasi densitas aktual V2.2 terhadap target klaster
11. `Target BTU (V3)`: Target beban linier dinamis V3 dengan pengaman floor/ceiling
12. `Qty V3 (Rencana 2027)`: Jumlah unit AC metode V3 roadmap 2027
13. `BTU/m2 V3`: Densitas pendinginan aktual V3
14. `Selisih V3 ke Target`: Deviasi densitas aktual V3 terhadap target dinamis suhu
