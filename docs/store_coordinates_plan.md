# Catatan Rencana: Penambahan & Sinkronisasi Koordinat Toko

Dokumen ini mencatat rencana teknis penambahan fitur sinkronisasi koordinat lokasi toko dari Google Sheets ke database PostgreSQL SPARTA Energy.

---

## 📌 Detail Format & Spesifikasi Google Sheets

- **Nama Sheet & Range:** `'Sheet 1'!A:E`
- **Struktur Kolom:**
  - Kolom A: `Branch`
  - Kolom B: `Kode Toko`
  - Kolom C: `Nama Toko`
  - Kolom D: `F/R` *(Diabaikan/Skip — Franchise & Regular)*
  - Kolom E: `Titik Koordinat` *(Contoh data: `"0.50954 101.4494"`)*

---

## 🛡️ Jaminan Keamanan & Integritas Data Eksisting

1. **Struktur Tabel Terpisah:**
   - Data Toko ada di tabel `stores`, sedangkan Data Audit ada di tabel `audits` dan `audit_items`.
   - Pengisian koordinat hanya menyentuh tabel `stores` dan **tidak menyentuh/mengubah tabel `audits` sedikit pun**. Semua riwayat audit toko lama 100% aman dan utuh.
2. **Strategi Update Toko Lama (Pilihan A - Dipilih):**
   - **Toko Baru:** Di-insert baru beserta nilai `latitude` & `longitude`.
   - **Toko Lama:** Hanya mengisikan sel `latitude` & `longitude` yang tadinya `null` (kosong). Nama toko, cabang, luas sales, daya PLN, dan seluruh riwayat audit **TIDAK DI-RESET ATAU DIUBAH**.

---

## 🏗️ Desain & Arsitektur Teknis

### 1. Database Schema (`prisma/schema.prisma`)
Menambahkan dua kolom opsional (`Float?`) pada model `Store`:
```prisma
model Store {
  // ... field toko eksisting ...
  latitude        Float?    @map("latitude")
  longitude       Float?    @map("longitude")
}
```
> **Catatan Keamanan Data:** Karena kolom bertipe `Float?` (nullable), migrasi PostgreSQL (`npx prisma migrate dev`) hanya akan menambahkan kolom baru bertipe `null` pada baris toko lama.

---

### 2. Logic Parser Google Sheets (`lib/jobs/sync-stores.ts`)
Fungsi penanganan 1 kolom koordinat (`"0.50954 101.4494"`):
```ts
// Parser string koordinat 1 kolom (dipisah spasi atau koma)
function parseCoordinates(raw: string): { latitude: number; longitude: number } | null {
  if (!raw) return null
  const parts = raw.trim().split(/[\s,]+/).map((s) => parseFloat(s))
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { latitude: parts[0], longitude: parts[1] }
  }
  return null
}
```

Alur Sinkronisasi:
1. **Toko Baru:** Di-insert ke DB beserta nilai `latitude` & `longitude`.
2. **Toko Lama yang Sudah Ada:** Jika nilai `latitude`/`longitude` di DB masih `null`, lakukan `update` otomatis mengisikan koordinat dari sheet tanpa mengubah kolom data toko lainnya.

---

### 3. Integrasi UI & Server Actions (`store-actions.ts` & `ac-estimation-client.tsx`)
- Memperbarui `searchStoresAction` & `getStoreByCodeAction` untuk menyertakan `latitude` & `longitude`.
- Pada Kalkulator AC (`/ac-estimation`), saat toko terdaftar dipilih dari dropdown, marker posisi peta (Leaflet Map) akan **otomatis melompat ke posisi koordinat toko tersebut**.

---

## 📝 Status Terkini
Rencana dan penjelasan jaminan keamanan data tersimpan dengan lengkap di dokumen ini. Siap dieksekusi kapan pun Anda siap!
