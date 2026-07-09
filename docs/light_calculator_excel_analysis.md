# Analisis Logika & Rumus Kalkulator Lampu (Excel)

Dokumen ini berisi analisis detail mengenai isi file `Kalkulator Lampu New_Non Password.xlsx`, yang mencakup dua sheet utama:
1. **`KALKULATOR LAMPU SIMETRIS`** (Untuk area penjualan berbentuk persegi panjang/simetris)
2. **`KALKULATOR LAMPU ASIMETRIS`** (Untuk area penjualan asimetris)

---

## 1. Konstanta Utama Proyek
Dari formula di kedua sheet, didapatkan konstanta default berikut:
* **Spesifikasi Lampu**: TL LED **`13.5 Watt`** per unit.
* **Panjang Fisik Lampu (untuk perhitungan jarak)**: **`1.2 meter`** per unit.
* **Batasan Densitas Daya (Target)**:
  * Batas Minimum: **`4.0 Watt/m²`**
  * Batas Maksimum: **`5.0 Watt/m²`**

---

## 2. Ringkasan Aturan Pasti (Golden Rules) Kalkulator Lampu
Berikut adalah rangkuman batasan dan parameter mutlak yang digunakan pada kalkulator excel:
* **Spesifikasi Lampu**: TL LED **`13.5 Watt`** per unit dengan panjang fisik **`1.2 meter`**.
* **Pemasangan Baris**: Lampu dalam satu baris dipasang **sambung-menyambung rapat (celah/spasi = 0 meter)**.
* **Jarak Samping (JS)**: Jarak dari dinding samping ke ujung lampu terdekat harus berada di rentang **`0.3 meter s/d 0.6 meter`**.
* **Jarak Baris (JB)**: Jarak antar baris lampu (dan jarak ke dinding depan/belakang) tidak boleh melebihi **`1.9 meter`**. Jika melebihi, jumlah baris otomatis ditambah 1.
* **Densitas Daya**: Rasio target daya total harus berada di rentang **`4.0 s/d 5.0 Watt/m²`**.

---

## 3. Sheet 1: Area Sales Simetris (Persegi Panjang)

### A. Input Parameter Toko
* **`Lebar Toko (L Max)`** (Cell `C4`): Input manual dalam meter (contoh: 12 m).
* **`Panjang Toko (P Max)`** (Cell `C5`): Input manual dalam meter (contoh: 10 m).
* **`Luas Area Sales`** (Cell `C6`): Input manual luas aktual (contoh: 130 m²).

### B. Parameter Batas Jumlah Lampu (Watt/m²)
Menghitung jumlah lampu minimum dan maksimum agar memenuhi batas rasio 4–5 W/m²:
* **Batas Maksimum Lampu (5 W/m²)** (Cell `C10`):
  $$Total\ Max = \lceil \frac{5 \times Luas}{13.5} \rceil$$
  *Formula Excel*: `=ROUNDUP(((5*C6)/13.5),0)`
* **Batas Minimum Lampu (4 W/m²)** (Cell `C11`):
  $$Total\ Min = \lceil \frac{4 \times Luas}{13.5} \rceil$$
  *Formula Excel*: `=ROUNDUP(((4*C6)/13.5),0)`

### C. Logika Penentuan Jumlah Lampu Per Baris (C14)
Sistem melakukan *trial sampling* dengan 3 opsi jumlah lampu per baris untuk menemukan jarak samping (`Jarak Samping`) yang ideal antara **0.3 meter s/d 0.6 meter**:
1. **Opsi Max (Cell `C28`)**:
   $$Lampu\ Max = \lceil \frac{Lebar\ Toko}{1.2} \rceil$$
   *Jarak Samping Max* (`D28`): `(Lebar - (Lampu Max * 1.2)) / 2`
2. **Opsi Min (Cell `C29`)**:
   $$Lampu\ Min = \lfloor \frac{Lebar\ Toko}{1.2} \rfloor$$
   *Jarak Samping Min* (`D29`): `(Lebar - (Lampu Min * 1.2)) / 2`
3. **Opsi Min-1 (Cell `C30`)**:
   $$Lampu\ Min-1 = Lampu\ Min - 1$$
   *Jarak Samping Min-1* (`D30`): `(Lebar - (Lampu Min-1 * 1.2)) / 2`

**Penentuan Opsi Terpilih (`C14`)**:
Dipilih dengan prioritas kondisi jarak samping di rentang `[0.3, 0.6]`:
```excel
=IFS(
  AND(JarakSampingMin >= 0.3, JarakSampingMin <= 0.6), LampuMin,
  AND(JarakSampingMax >= 0.3, JarakSampingMax <= 0.6), LampuMax,
  AND(JarakSampingMin-1 >= 0.3, JarakSampingMin-1 <= 0.6), LampuMin-1,
  TRUE, LampuMin-1
)
```

* **`Jarak Samping Terpilih (JS)`** (Cell `C18`): Melakukan `XLOOKUP` dari jumlah lampu terpilih ke baris opsi di atas untuk mengembalikan jarak samping yang sesuai.

### D. Perhitungan Baris & Jumlah Akhir Lampu
1. **Jumlah Lampu Sampling** (Cell `C32`): Menyeimbangkan batas rasio dengan kelipatan lampu per baris.
   *Formula Excel*: `=IF(FLOOR(TotalMax, LampuPerBaris) < TotalMin, CEILING(TotalMin, LampuPerBaris), FLOOR(TotalMax, LampuPerBaris))`
2. **Jumlah Baris Sampling** (Cell `C33`): `Jumlah Lampu Sampling / Lampu Per Baris`
3. **Jarak Per Baris (Sampling)** (Cell `C34`): `Panjang Toko / (Jumlah Baris Sampling + 1)`
4. **Koreksi Jumlah Baris Aktual** (Cell `C15`):
   Jika Jarak Per Baris Sampling lebih besar dari **1.9 meter**, maka baris ditambah 1 untuk meratakan pencahayaan.
   *Formula Excel*: `=IF(JarakPerBarisSampling > 1.9, JumlahBarisSampling + 1, JumlahBarisSampling)`
5. **Total Lampu Final** (Cell `C16`): `Jumlah Baris Aktual * Jumlah Lampu Per Baris`
6. **Jarak Per Baris Final (JB)** (Cell `C17`): `ROUND(Panjang Toko / (Jumlah Baris Aktual + 1), 2)`
7. **Rasio Akhir Watt/m²** (Cell `C19`): `ROUND(((Total Lampu Final * 13.5) / Luas), 2)`

---

## 4. Sheet 2: Area Sales Asimetris

Pada dasarnya, sheet asimetris menggunakan prinsip perhitungan yang sama dengan sheet simetris, namun dengan beberapa penyesuaian khusus area referensi:

* **Dimensi**: Memiliki **`L Max`** (lebar maksimal, `C4`) dan **`L Min`** (lebar minimal, `C5`).
* **Luas Area Sales Referensi** (Cell `C28`): Dihitung dengan rumus persegi panjang virtual menggunakan lebar maksimal:
  $$Luas\ Referensi = P\ Max \times L\ Max$$
* **Trial Parameter Lampu**: Penentuan jumlah lampu per baris (`C16`) menggunakan **`L Max`** sebagai dasar pembagian dengan panjang lampu (1.2m).
* **Crosscheck Manual** (Cell `D21`): 
  Admin memasukkan jumlah lampu riil di lapangan (`C21`) untuk dicek apakah berada dalam batas minimum (`C13`) dan maksimum (`C12`) yang diizinkan untuk luas asimetris aktual (`C7`).
  *Formula Excel*:
  ```excel
  =IFS(
    ActualLamps < MinLamps, "Lampu Terlalu Sedikit",
    ActualLamps > MaxLamps, "Lampu Terlalu Banyak",
    TRUE, "Jumlah Lampu Sesuai"
  )
  ```

---

## 5. Perbandingan dengan Implementasi Kode (`lamp-calculator.ts`)

Saat ini, file [lamp-calculator.ts](file:///d:/Coding/sparta-energy/lib/lamp-calculator.ts) di dalam codebase menggunakan pendekatan **polygon-fitting** (geometris 2D dengan koordinat koordinat titik sudut area). 

### Perbedaan Logika:
1. **Model Geometris**: Kode saat ini menempatkan lampu menggunakan pengecekan polygon (`pointInPolygon`) untuk mendeteksi batas fisik secara dinamis, sedangkan Excel berasumsi bentuk persegi panjang sederhana (Simetris atau Asimetris L Max/L Min).
2. **Jarak Batas**: Kode saat ini menggunakan `margin` konstan, sedangkan Excel memiliki aturan pemilihan jarak samping ideal (`0.3m` - `0.6m`).
3. **Koreksi Jarak Baris (> 1.9m)**: Di Excel, jika jarak antar baris melebihi 1.9 meter, jumlah baris otomatis ditambah 1 untuk menghindari area gelap. Logika ini belum sepenuhnya diterapkan secara eksplisit pada algoritma polygon saat ini.
