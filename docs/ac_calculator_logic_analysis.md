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

---

## 4. Studi Kasus Lapangan: Pertanyaan Cabang Luwu (Kasus 120 m² vs 121 m² & 129,89 m²)

### A. Latar Belakang Permasalahan
Tim lapangan / auditor di cabang Luwu mempertanyakan hasil kalkulator untuk toko dengan luas **129,89 m² (Suhu 30,7 °C)** yang menghasilkan **5 Unit AC**, serta perbandingan antara **120 m² (4 Unit)** vs **121 m² (5 Unit)** pada suhu 33 °C.

Pertanyaan dari lapangan:
> *"Kenapa tambah 1 m² (dari 120 ke 121 m²) langsung naik 1 unit AC (padahal cuma tambah 600 BTU)?"*
> *"Pada luas 129,89 m² (77.934 BTU), angkanya lebih dekat ke 4 unit (72.000 BTU) daripada ke 5 unit (90.000 BTU) dengan batas tengah 81.000 BTU (4,5 unit). Kenapa tetap keluar 5 unit?"*

---

### B. Penjelasan Teknis & Alasan Rumus Menghasilkan 5 Unit

Sistem mengeluarkan 5 Unit karena **100% konsisten mengikuti Aturan Baku Resmi dari Excel `Kalkulator AC new 2023 ver 2.xlsx`**:

1. **Kasus 120 m² vs 121 m² (Suhu 33 °C — Cluster 600 BTU/m², Rentang 600 – 749 BTU/m²):**
   * **Luas 120 m²:**
     * 4 Unit: $72.000 \div 120 = \mathbf{600,0\text{ BTU/m}^2}$ $\rightarrow$ **Memenuhi batas minimal 600** $\rightarrow$ Hasil: **4 Unit**.
   * **Luas 121 m²:**
     * Opsi 4 Unit: $72.000 \div 121 = \mathbf{595,0\text{ BTU/m}^2}$ $\rightarrow$ **Kurang dari 600 BTU/m²** (Gagal syarat minimal).
     * Opsi 5 Unit: $90.000 \div 121 = \mathbf{743,8\text{ BTU/m}^2}$ $\rightarrow$ **Masuk rentang 600 – 749** $\rightarrow$ Hasil: **5 Unit**.
   * **Penyebab:** Angka 600 BTU/m² pada rumus Excel diperlakukan sebagai **batas bawah kaku (*strict minimum*)**. Begitu hasil pembagian menghasilkan < 600 (meskipun cuma kurang 5 BTU), opsi 4 unit langsung gugur.

2. **Kasus 129,89 m² (Suhu 30,7 °C — Cluster 600 BTU/m²):**
   * Kebutuhan Standar: $129,89 \times 600 = \mathbf{77.934\text{ BTU}}$
   * **Opsi 4 Unit (72.000 BTU):** Densitas $= 72.000 \div 129,89 = \mathbf{554,3\text{ BTU/m}^2}$ *(Defisit -45,7 BTU/m² dari standar 600, toko rawan gerah saat beban puncak siang hari)*.
   * **Opsi 5 Unit (90.000 BTU):** Densitas $= 90.000 \div 129,89 = \mathbf{692,9\text{ BTU/m}^2}$ *(Masuk pas di dalam rentang standar 600 – 749 BTU/m²)*.
   * **Keputusan Baku:** Sistem memilih **5 Unit** demi menjamin standar kenyamanan termal toko.

---

### C. Perbandingan Sudut Pandang (Standar Baku vs Logika Lapangan)

| Parameter | Sudut Pandang Standar Baku (Perancang Rumus) | Sudut Pandang Lapangan (Auditor / Cabang) |
| :--- | :--- | :--- |
| **Prioritas Utama** | **Kenyamanan Suhu Ruangan (*Cooling Compliance*)** | **Efisiensi Investasi & Beban Daya (*Cost/Power Efficiency*)** |
| **Filosofi** | Tidak boleh ada toko yang densitasnya di bawah 600 BTU/m² agar AC tidak bekerja *overload* terus-menerus. | Jangan tambah 1 unit AC penuh (18.000 BTU / ~1.500 W) jika kebutuhan belum melewati titik tengah 0,5 unit (81.000 BTU). |
| **Batas Ambang** | Batas bawah kaku: $600\text{ BTU/m}^2$. | Titik tengah matematis: $4,5\text{ unit (81.000 BTU)}$. |
| **Hasil pada 129,89 m²** | **5 Unit AC (90.000 BTU / 693 BTU/m²)** | **4 Unit AC (72.000 BTU / 554 BTU/m²)** |

---

## 5. Opsi Solusi & Bahan Pertimbangan Masa Depan

Jika di masa depan manajemen / tim audit memutuskan untuk merevisi rumus agar lebih selaras dengan efisiensi CAPEX/OPEX cabang, berikut 3 alternatif yang dapat dipilih:

* **Opsi 1 — Pertahankan Rumus Baku Saat Ini (Status Quo):**
  * *Kelebihan:* Toko selalu sejuk dan tidak ada komplain gerah dari konsumen/operasional toko.
  * *Kekurangan:* Biaya pengadaan AC dan daya terpasang PLN lebih tinggi untuk toko luas 121–134 m².
* **Opsi 2 — Logika Titik Tengah / Rounding Standar (`Math.round`):**
  * Membulatkan unit berdasarkan titik tengah 0,5 PK (9.000 BTU).
  * Kebutuhan $\le 4,5$ unit (81.000 BTU) $\rightarrow$ 4 Unit; Kebutuhan $> 4,5$ unit $\rightarrow$ 5 Unit.
  * *Hasil:* Luas 120–134 m² akan menjadi 4 Unit; Luas $\ge 135\text{ m}^2$ menjadi 5 Unit.
* **Opsi 3 — Toleransi Margin Defisit (5% s/d 10%):**
  * Mengizinkan densitas turun sampai 550 BTU/m² sebelum mewajibkan penambahan unit AC baru.

