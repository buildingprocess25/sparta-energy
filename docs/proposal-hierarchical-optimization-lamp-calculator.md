# Dokumentasi & Proposal: Optimasi Hirarki Kalkulator Lampu (v1.2.0 Proposal)

Dokumen ini mencatat hasil diskusi, analisis statistik 40.401 kombinasi dimensi ruangan, dan rancangan implementasi jika di masa depan akan diterapkan **Batas Bawah Jarak Antar Baris (1.6 m)** dengan **Sistem Hirarki Prioritas Deviasi**.

---

## 1. Latar Belakang & Masalah
Pada engine kalkulator lampu saat ini (`v1.1.0` / acuan Excel awal):
- **Jarak Samping (JS)**: Memiliki rentang batas bawah dan atas: `0.30 m s/d 0.60 m`.
- **Jarak Antar Baris (JB)**: Hanya memiliki batas atas: `Panjang / (Baris + 1) <= 1.90 m`.

### Wacana Pengembangan:
Menambahkan batas bawah untuk Jarak Antar Baris menjadi **`1.60 m s/d 1.90 m`** (mencegah lampu terlalu rapat ke arah memanjang), dengan tetap menjaga ruangan tidak menjadi gelap melalui **Sistem Hirarki Prioritas Deviasi**.

---

## 2. Hasil Analisis Statistik (40.401 Kombinasi Ruangan)
Pengujian dilakukan pada rentang dimensi toko:
- Lebar: `5.0 m s/d 25.0 m` (step 0.1 m)
- Panjang: `5.0 m s/d 25.0 m` (step 0.1 m)
- Luas Area: `25.00 m² s/d 625.00 m²`

### Temuan Distribusi Jarak Antar Baris (JB):
| Kategori Jarak Baris | Jumlah Sampel | Persentase | Karakteristik Ruangan |
| :--- | :---: | :---: | :--- |
| **Ideal Alami (1.60 m - 1.90 m)** | **33.949** | **84.03%** | Toko sedang hingga besar. Angka dan visual **sama sekali tidak berubah**. |
| **Jarak Rapat (< 1.60 m)** | **6.032** | **14.93%** | Toko kecil / panjang pendek (< 7m). Perlu penanganan proteksi W/m². |
| **Jarak Lebar (> 1.90 m)** | **420** | **1.04%** | Ukuran tanggung sebelum auto-koreksi baris. |

---

## 3. Aturan Hirarki Prioritas Deviasi (Lexicographic Optimization)

Untuk mencegah toko menjadi gelap atau boros energi, evaluasi penataan lampu harus mengikuti urutan prioritas berikut:

```text
┌─────────────────────────────────────────────────────────────┐
│ PRIORITAS 1: Rasio Daya Listrik (4.00 - 5.00 W/m²)          │
│ Memastikan penerangan toko cukup terang (standar ritel)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PRIORITAS 2: Jarak Samping Dinding/Rak (0.30 - 0.60 m)      │
│ Menghindari bayangan gelap pada display rak tepi dinding    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PRIORITAS 3: Jarak Antar Baris (1.60 - 1.90 m)              │
│ Mengatur kerapatan distribusi cahaya antar lorong           │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Blueprint Logika & Rumus Implementasi Kode di Masa Depan

Jika fitur ini akan diaktifkan di [`lib/lamp-calculator.ts`](file:///d:/Coding/sparta-energy/lib/lamp-calculator.ts):

### A. Fungsi Penghitung Deviasi (Penalti)
```typescript
function calculatePenalties(rasio: number, js: number, jb: number) {
  // 1. Penalti W/m2 (Bobot Tertinggi: 100x)
  let penaltyWatt = 0
  if (rasio < 4.0) penaltyWatt = (4.0 - rasio) * 100
  else if (rasio > 5.0) penaltyWatt = (rasio - 5.0) * 80

  // 2. Penalti Jarak Samping (Bobot Sedang: 10x)
  let penaltyJS = 0
  if (js < 0.3) penaltyJS = (0.3 - js) * 10
  else if (js > 0.6) penaltyJS = (js - 0.6) * 10

  // 3. Penalti Jarak Baris (Bobot Halus: 1x)
  let penaltyJB = 0
  if (jb < 1.6) penaltyJB = (1.6 - jb) * 1
  else if (jb > 1.9) penaltyJB = (jb - 1.9) * 1

  return penaltyWatt + penaltyJS + penaltyJB
}
```

### B. Aturan Evaluasi Status Diagnosa
Pada file UI [`app/light-estimation/light-estimation-client.tsx`](file:///d:/Coding/sparta-energy/app/light-estimation/light-estimation-client.tsx):
```typescript
// Evaluasi Jarak Baris jika batas bawah 1.6m aktif:
if (jarakBaris < 1.6) {
  barisStatus = "near"
  issues.push(`Jarak antar baris agak rapat (${jarakBaris.toFixed(2)}m < 1.6m), namun dipertahankan agar tingkat terang toko tetap ideal.`)
} else if (jarakBaris > 1.9) {
  barisStatus = "wide"
  issues.push(`Jarak antar baris agak lebar (${jarakBaris.toFixed(2)}m > 1.9m).`)
} else {
  barisStatus = "ok" // 1.6m s/d 1.9m
}
```

---

## 5. File Referensi & Riwayat Terkait
1. **File Simulasi Multi-Sheet**:
   - [`Simulasi_Kalkulator_Lampu_v1.1.0.xlsx`](file:///d:/Coding/sparta-energy/Simulasi_Kalkulator_Lampu_v1.1.0.xlsx)
   - [`Simulasi_Kalkulator_Lampu_v1.1.0.csv`](file:///d:/Coding/sparta-energy/Simulasi_Kalkulator_Lampu_v1.1.0.csv)
   - [`Ringkasan_Analisis_Kalkulator_Lampu.csv`](file:///d:/Coding/sparta-energy/Ringkasan_Analisis_Kalkulator_Lampu.csv)
2. **Dokumen Formula Asli Excel**:
   - [`docs/light_calculator_excel_analysis.md`](file:///d:/Coding/sparta-energy/docs/light_calculator_excel_analysis.md)
3. **Changelog**:
   - [`docs/changelog-lamp-calculator.md`](file:///d:/Coding/sparta-energy/docs/changelog-lamp-calculator.md)
