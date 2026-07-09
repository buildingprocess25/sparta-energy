# Analisis Logika & Rumus Kalkulator AC

Dokumen ini menjelaskan logika dan rumus perhitungan yang digunakan dalam **Kalkulator AC** pada file [ac-estimation-client.tsx](file:///d:/Coding/sparta-energy/app/ac-estimation/ac-estimation-client.tsx#L202-L238).

---

## 1. Alur Kerja Perhitungan
Kalkulator AC menghitung kebutuhan unit pendingin ruangan (AC) berdasarkan lokasi koordinat toko dan luas area sales dengan langkah-langkah berikut:
1. **Fetch Suhu Lokal**: Sistem mengambil suhu udara luar maksimal (`maxTemp`) menggunakan koordinat GPS (Latitude/Longitude) via **Open-Meteo API**.
2. **Kategori Beban Panas (BTU/m²)**: Mengelompokkan beban panas ruangan berdasarkan suhu udara luar lokal.
3. **Kalkulasi Total BTU**: Mengalikan luas area sales dengan nilai beban panas per m².
4. **Estimasi Jumlah AC**: Menghitung kebutuhan unit AC 2 PK (kapasitas 18.000 BTU/h per unit).

---

## 2. Parameter & Rumus Detail

### A. Kategori Beban Panas Ruangan (`clusterBtu`)
Nilai BTU per meter persegi ditentukan berdasarkan suhu luar ruangan maksimal (`maxTemp` dalam °C):
* **Suhu Ekstrem Panas (> 35°C)**:
  $$clusterBtu = 751\ BTU/m^2$$
* **Suhu Standar (27°C s/d 35°C)**:
  $$clusterBtu = 600\ BTU/m^2$$
* **Suhu Sejuk (< 27°C)**:
  $$clusterBtu = 450\ BTU/m^2$$

### B. Rumus Total Kebutuhan BTU (`totalBtu`)
$$totalBtu = Luas\ Area\ Sales\ (m^2) \times clusterBtu$$

### C. Pembulatan Unit AC (`acUnits`)
Kalkulator berasumsi menggunakan unit AC standar berkapasitas **2 PK** (setara dengan **18.000 BTU/h**).
$$rawQty = \frac{totalBtu}{18.000}$$

Aturan pembulatan desimal:
* Jika nilai desimal sisa pembagian **lebih dari 0.5**, dibulatkan ke atas (`Math.ceil`).
* Jika nilai desimal sisa pembagian **kurang dari atau sama dengan 0.5**, dibulatkan ke bawah (`Math.floor`).
* **Batas Minimum**: Jumlah AC minimal adalah **1 unit** jika luas area sales > 0.

*Formula Kode*:
```typescript
const rawQty = totalBtu / 18000
const remainder = rawQty % 1
let finalUnit = remainder > 0.5 ? Math.ceil(rawQty) : Math.floor(rawQty)
if (finalUnit < 1) finalUnit = 1
```

---

## 3. Contoh Simulasi Perhitungan
Misalkan sebuah toko dengan Luas Area Sales = **130 m²** berada di daerah panas dengan suhu luar maksimal **36°C**:
1. Karena suhu $36^\circ C > 35^\circ C$, maka **`clusterBtu = 751 BTU/m²`**.
2. **`totalBtu`** = $130 \times 751 = 97.630\ BTU$.
3. **`rawQty`** = $97.630 / 18.000 = 5.4239$.
4. **Sisa desimal** = $0.4239$ (karena $\le 0.5$, maka dibulatkan ke bawah).
5. **`acUnits`** = **5 Unit AC (2 PK)**.
