# Dokumentasi Spesifikasi Kalkulator Plafon Gypsum Tile

Dokumen ini mencatat hasil analisis file konsep Excel `Perhitungan Gypsum Tile.xlsx`, kesepakatan diskusi teknis, aturan baku arsitektural/MEP, serta rencana implementasi fitur **Kalkulator Plafon Gypsum Tile** di dalam **Store MEP Simulator** (`sparta-energy`).

---

## 1. Parameter Baku & Dimensi Panel

* **Modul Gypsum Tile Baku:**
  * Panjang: **1.2 meter (120 cm)**
  * Lebar: **0.6 meter (60 cm)**
  * Sistem Rangka: **Exposed T-Bar Grid**
* **Orientasi Default Toko:**
  * Sumbu X (Horizontal): Lebar toko dari kiri ke kanan.
  * Sumbu Y (Vertikal): Panjang toko dari belakang (atas) ke depan (bawah).
  * **Pintu Toko:** Berada di sisi bawah kanvas (dinding depan).
  * **Arah Panel Default:** Memanjang horizontal mengikuti lebar pandang toko (sisi 1.2 m membentang sejajar sumbu X, sisi 0.6 m membentang sejajar sumbu Y).
  * **Fitur Tambahan:** Tersedia tombol *Toggle Orientasi* (Horizontal 1.2x0.6 m vs Vertikal 0.6x1.2 m) untuk fleksibilitas denah toko.

---

## 2. Aturan Baku Pemasangan (Golden Rules)

### A. Grid Simetris (Centering Grid)
* Grid plafon disusun simetris dari as tengah ruangan.
* Panel utuh diletakkan di bagian tengah.
* Sisa ruang dinding dibagi rata sama besar ke dua sisi tepi berseberangan:
  * Tepi Kiri = Tepi Kanan
  * Tepi Depan = Tepi Belakang

### B. Aturan Potongan Tepi Minimal 50% (Half-Tile Rule)
* **Aturan Mutlak:** Sisa potongan panel di bagian tepi dinding **tidak boleh kurang dari 50% (< 0.5 x ukuran modul)**.
  * Sisi modul 60 cm: Potongan tepi minimal **30 cm (0.3 m)**.
  * Sisi modul 120 cm: Potongan tepi minimal **60 cm (0.6 m)**.
* **Tujuan Teknis & Estetika:**
  1. *Estetika:* Menghindari potongan kecil (slivers 5–15 cm) di pinggir dinding yang terlihat tidak rapi dan asimetris.
  2. *Struktural:* Potongan sempit pada grid T-bar sangat rapuh, sulit ditumpu oleh *wall angle*, dan mudah melengkung/lepas jika terkena getaran atau hembusan udara AC.

### C. Logika Koreksi Jika Potongan Awal < 50%
Jika hitungan pembagian sisa menghasilkan potongan per tepi `< 50%`:
1. Kurangi jumlah panel utuh sebanyak 1 unit:
   `Panel Utuh Revisi = Panel Utuh Awal - 1`
2. Tambahkan lebar 1 modul panel ke sisa margin ruang:
   `Total Margin Tepi Revisi = Sisa Awal + Dimensi Modul Panel`
3. Bagi rata ke dua sisi tepi:
   `Potongan Tepi Per Sisi = Total Margin Tepi Revisi / 2`
4. Hasil potongan baru dijamin berada di rentang **50% s/d 100% modul** (pasti lolos aturan).

---

## 3. Analisis File Excel Konsep & Koreksi Bug

File sumber: `concept_gypsum_tile/Perhitungan Gypsum Tile.xlsx`

### A. Contoh Kasus Sisi 60 cm (Lebar Toko 5.0 m, Modul 0.6 m)
* Hitungan awal: 5.0 m / 0.6 m = 8.33 panel (8 panel utuh).
* Sisa ruang: 5.0 - (8 x 0.6) = 0.20 m (20 cm).
* Sisa jika dibagi 2 sisi: 20 cm / 2 = 10 cm (hanya 16.7% dari modul 60 cm -> **Melanggar aturan < 50%**).
* Revisi:
  * Panel utuh dikurangi 1 menjadi: **7 panel utuh**.
  * Ruang untuk tepi: 0.20 m + 0.60 m = 0.80 m (80 cm).
  * Potongan tepi per sisi: 80 cm / 2 = **40 cm** (66.7% dari modul -> **Lolos aturan**).
* Susunan di lapangan:
  `[Potongan 40 cm] + [7 Panel Utuh @ 60 cm = 420 cm] + [Potongan 40 cm] = 500 cm (5.0 m pas)`.

### B. Contoh Kasus Sisi 120 cm (Panjang Toko 15.0 m, Modul 1.2 m)
* Hitungan awal: 15.0 m / 1.2 m = 12.5 panel (12 panel utuh).
* Sisa ruang aktual: 15.0 - (12 x 1.2) = 0.60 m (60 cm).
* Sisa jika dibagi 2 sisi: 60 cm / 2 = 30 cm (hanya 25% dari modul 120 cm -> **Melanggar aturan < 50%**).
* Revisi:
  * Panel utuh dikurangi 1 menjadi: **11 panel utuh**.
  * Ruang untuk tepi: 0.60 m + 1.20 m = 1.80 m (180 cm).
  * Potongan tepi per sisi: 180 cm / 2 = **90 cm** (75% dari modul -> **Lolos aturan**).
* Susunan di lapangan:
  `[Potongan 90 cm] + [11 Panel Utuh @ 120 cm = 1320 cm] + [Potongan 90 cm] = 1500 cm (15.0 m pas)`.

### C. Catatan Temuan Bug pada File Excel Asli
* Di sel `C16` file Excel, tertulis formula: `=(C15-INT(C15))*0.6`
* Pengalinya hardcode `0.6` (akibat copy-paste dari baris 9), padahal dimensi modul panjang di sel `C2` adalah `1.2`.
* Akibatnya potongan tepi terhitung salah menjadi `0.75 m` (total panjang menjadi 14.7 m, hilang 30 cm).
* Pada implementasi TypeScript di sistem ini, formula diperbaiki menggunakan modulo dinamis `roomDim % panelDim` sehingga hasil perhitungan akurat 100%.

---

## 4. Desain Output & Pembedahan Panel

Kalkulator akan menyajikan ringkasan output yang terbedah jelas:

1. **Rincian Potongan Tepi (Border Cuts):**
   * Ukuran tepi kiri & kanan (cm/meter) + persentase terhadap modul.
   * Ukuran tepi depan & belakang (cm/meter) + persentase terhadap modul.
   * Status verifikasi aturan (Indikator Hijau: "Sesuai Standar >= 50%").

2. **Pembedahan Kebutuhan Lembar Gypsum Tile:**
   * **Panel Utuh:** Jumlah modul penuh di area tengah toko.
   * **Panel Potongan Tepi:** Jumlah modul tepi (atas, bawah, kiri, kanan, serta 4 sudut).
   * **Logika Efisiensi Bahan:** Karena potongan tepi berukuran >= 50% modul, maka 1 lembar panel hanya bisa menghasilkan 1 potongan tepi (sisa potongannya tidak dapat dipakai kembali).
   * **Total Lembar Yang Dipesan:** `Total Panel Utuh + Total Panel Potongan + Safety Margin Waste (5%)`.

3. **Bill of Quantity (BoQ) Estimasi Rangka T-Bar (Fitur Pelengkap):**
   * **Main Tee 3.6 m:** Dipasang setiap interval bentang 1.2 m.
   * **Cross Tee 1.2 m:** Dipasang melintang setiap interval 0.6 m.
   * **Wall Angle 3.0 m:** Dipasang keliling dinding mengikuti perimeter toko.
   * **Rod Hanger / Penggantung:** Dipasang setiap jarak 1.2 m pada Main Tee.

---

## 5. Rencana Integrasi ke Store MEP Simulator

1. **Tab Switcher di UI:**
   * Lokasi: Header panel simulator di `store-mep-simulator-client.tsx`.
   * Pilihan Tab: `[Sistem AC]` | `[Sistem Lampu]` | `[Plafon Gypsum Tile]`.
2. **Visualisasi Garis Grid di Kanvas:**
   * Menggambar garis T-bar plafon pada denah toko (grid modul 60x120 cm).
   * Menampilkan arsiran warna berbeda untuk panel utuh vs panel potongan tepi.
   * Menampilkan dimensi teks potongan tepi di sisi-sisi dinding kanvas.
3. **Komponen Result Card & Export:**
   * Komponen `GypsumTileResultCard` dan `GypsumTileExportCard` menampilkan ringkasan metrik, pembedahan panel, estimasi rangka T-Bar, dan rekomendasi order Jayaboard.
4. **Fitur Unduh Denah Plafon (.png):**
   * Mengambil snapshot kanvas resolusi tinggi 2x Retina dengan tag ukuran potongan dinding, grid T-bar, dan BoQ resmi.
5. **Ceiling Focus / Ghost Mode:**
   * Saat tab Plafon Gypsum aktif, fixture lantai (kasir, chiller, pintu) otomatis dipudarkan (opacity 25%) dan label teks lantai disembunyikan agar tidak bertumpuk dengan grid dan ukuran tepi plafon.

---

## 6. Standar Acuan Baru: Koefisien Fix Jayaboard (Sheet "Koefisien 1.75")

Berdasarkan dokumen acuan terbaru: `concept_gypsum_tile/Koefisien Fix Gypsum Tile Jayaboard.xlsx` (Sheet **Koefisien 1.75**), sistem mengadopsi standar resmi pabrikan Jayaboard untuk prioritas produk:
**Gyptile Natura 9mm x 600mm x 1200mm (Item Code: 821848)**.

### A. Koefisien Kuantitas Material Baku per m2

| Material Jayaboard | Kode Item | Koefisien per m2 | Satuan | Keterangan Standar Pemasangan |
|:---|:---:|:---:|:---:|:---|
| **Gyptile Natura 9mm x 600mm x 1200mm** | **821848** | **1.7500** | **Sheet (Lembar)** | Kebutuhan lembar aman pengadaan retail (buffer potongan dinding & retak) |
| **Main Tee - 400 (3.6m)** | **755606** | **0.2625** | **Pcs (Batang)** | Rangka utama bentang 1.2m |
| **Long Cross Tee - 402 (1.2m)** | **755604** | **1.4000** | **Pcs (Batang)** | Rangka melintang interval 0.6m |
| **Wall Angle - 408 (3.0m)** | **823754** | **0.4375** | **Pcs (Batang)** | Profil siku penyangga tepi keliling dinding |
| **Suspension Spring Adjuster - 410** | **821969** | **0.7875** | **Pcs** | Pengatur kawat gantungan per titik gantung |
| **3mm Soft Galvanised Susp. Rod - 409** | **821973** | **0.3938** | **Pcs** | Kawat penggantung galvanis 3mm |
| **Angle Bracket - 220** | **825460** | **0.7875** | **Pcs** | Klem sudut pengikat dak beton |

### B. Hubungan Antara Layout Fisik Geometris vs Koefisien Jayaboard (1.75)
1. **Layout Fisik Geometris (Shop Drawing Kanvas):**
   - Menghasilkan jumlah fisik lembar terpasang di langit-langit (misal: 225 lembar fisik + 5% waste = 237 lembar).
   - Menentukan ukuran presisi potongan tepi dinding (misal: tepi kiri/kanan 104 cm, tepi depan/belakang 33 cm).
   - Digunakan oleh tukang dan auditor pengawas di lapangan saat pelaksanaan pemasangan.
2. **Koefisien Pembelian Jayaboard (Standar 1.75):**
   - Dihitung dari formula: `Luas Toko (m2) x 1.75` (misal toko 150 m2 = 263 lembar).
   - Menjadi acuan pemesanan pembelian bahan (Purchasing Order) agar aman dari kekurangan lembar akibat sisa potongan pinggir yang afkir di proyek.

---

## 7. Catatan Mengenai Harga Satuan Material (Regional Pricing)

* **Fokus Utama Sistem:** Menghitung **kuantitas fisik material secara akurat** (jumlah lembar gyptile, batang main tee, batang cross tee, batang wall angle, dan kelengkapan aksesoris gantungan).
* **Catatan Harga:** Harga satuan material yang tercantum di katalog Jayaboard (misal: Gyptile Rp 21.770/lembar, Main Tee Rp 35.350/btg, dll) bersifat **referensi dasar / indikatif pabrikan**. 
* Pada praktiknya, harga satuan material di lapangan **belum fix dan bervariasi di tiap daerah** karena faktor logistik, distribusi regional, dan kontrak supplier setempat. Oleh karena itu, estimasi biaya disajikan sebagai catatan/referensi estimasi pembanding, sementara kuantitas volume barang adalah acuan mutlak.

