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

### C. Pembulatan Unit AC (`acUnits`) — Mengikuti *Kalkulator AC new 2023 ver 2.xlsx*
Kalkulator berasumsi menggunakan unit AC standar berkapasitas **2 PK** (setara dengan **18.000 BTU/h**).

Bukan sekadar pembulatan matematika desimal biasa, kalkulator mengevaluasi nilai **BTU/m² Aktual** terhadap rentang ideal cluster `[Min, Max]`:

1. **Hitung Opsi Pembulatan**:
   - `downQty` = $\lfloor \text{totalBtu} / 18.000 \rfloor$
   - `upQty` = $\lceil \text{totalBtu} / 18.000 \rceil$
2. **Hitung BTU/m² Aktual**:
   - `actualDownBtuPerM2` = $(\text{downQty} \times 18.000) / \text{Luas Sales}$
   - `actualUpBtuPerM2` = $(\text{upQty} \times 18.000) / \text{Luas Sales}$
3. **Kriteria Keputusan**:
   - Jika `actualDownBtuPerM2` berada dalam rentang `[minBtu, maxBtu]`, pilih `downQty`.
   - Jika `actualUpBtuPerM2` berada dalam rentang `[minBtu, maxBtu]`, pilih `upQty`.
   - Jika keduanya di luar rentang, pilih opsi dengan deviasi terbawah/teratas terkecil ke batas rentang.
4. **Batas Minimum**: Jumlah AC minimal adalah **1 unit** jika luas area sales > 0.

*Formula Kode*:
```typescript
const downQty = Math.floor(totalBtu / 18000)
const upQty = Math.ceil(totalBtu / 18000)

const actualDownBtuPerM2 = (downQty * 18000) / area
const actualUpBtuPerM2 = (upQty * 18000) / area

let finalUnit = 0
if (actualDownBtuPerM2 >= minBtu && actualDownBtuPerM2 <= maxBtu) {
  finalUnit = downQty
} else if (actualUpBtuPerM2 >= minBtu && actualUpBtuPerM2 <= maxBtu) {
  finalUnit = upQty
} else {
  const distDown = actualDownBtuPerM2 < minBtu ? minBtu - actualDownBtuPerM2 : actualDownBtuPerM2 - maxBtu
  const distUp = actualUpBtuPerM2 < minBtu ? minBtu - actualUpBtuPerM2 : actualUpBtuPerM2 - maxBtu
  finalUnit = distDown <= distUp ? downQty : upQty
}
if (finalUnit < 1) finalUnit = 1
```

---

## 3. Contoh Simulasi Perhitungan
Misalkan sebuah toko dengan Luas Area Sales = **139 m²** berada di daerah sejuk dengan suhu luar maksimal **26°C**:
1. Karena suhu $26^\circ C < 27^\circ C$, maka **`clusterBtu = 450 BTU/m²`** dengan rentang ideal **`[450 - 599 BTU/m²]`**.
2. **`totalBtu`** = $139 \times 450 = 62.550\ BTU$.
3. **`downQty`** = $\lfloor 62.550 / 18.000 \rfloor = 3$ unit $\rightarrow$ `actualDownBtuPerM2` = $(3 \times 18.000)/139 = \mathbf{388.49\ BTU/m^2}$ (di luar rentang).
4. **`upQty`** = $\lceil 62.550 / 18.000 \rceil = 4$ unit $\rightarrow$ `actualUpBtuPerM2` = $(4 \times 18.000)/139 = \mathbf{517.98\ BTU/m^2}$ (masuk rentang 450-599).
5. **`acUnits`** = **4 Unit AC (2 PK)** (karena opsi UP memenuhi rentang ideal).
