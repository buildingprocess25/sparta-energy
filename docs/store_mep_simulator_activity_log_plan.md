# Rencana Implementasi: Activity Log & Save/Load Layout Store MEP Simulator

**Tanggal Rencana**: 21 Oktober 2026  
**Status**: Siap Eksekusi (Dijadwalkan sore ini jam 16:00 WIB)  
**Tujuan**: Menambahkan pencatatan riwayat simulasi (Activity Log) dan kemampuan menyimpan serta membuka kembali rancangan denah MEP (AC & Lampu) secara 100% presisi.

---

## 1. Arsitektur & Model Database (Prisma)

Tambahkan model baru pada `prisma/schema.prisma` yang bersifat *additive* (tidak mengganggu tabel lama):

```prisma
model MepSimulationLog {
  id               String    @id @default(uuid()) @db.Uuid
  userId           String?   @map("user_id") @db.Uuid
  userEmail        String?   @map("user_email")
  storeMode        StoreMode @default(EXISTING) @map("store_mode")
  storeCode        String?   @map("store_code")
  storeName        String?   @map("store_name")
  branch           String?
  salesArea        Decimal   @map("sales_area")
  
  // Metrik AC
  maxTemp          Decimal   @map("max_temp")
  clusterBtu       Int       @map("cluster_btu")
  totalBtu         Int       @map("total_btu")
  recommendedUnits Int       @map("recommended_units")
  installedUnits   Int       @map("installed_units")
  outdoorNotes     String?   @map("outdoor_notes")
  
  // Metrik Lampu
  lampWatt         Decimal   @map("lamp_watt")
  targetLux        Int       @map("target_lux")
  lampCount        Int       @map("lamp_count")
  estimatedLux     Int?      @map("estimated_lux")
  
  // Full Snapshot Denah 2D (Meter Asli Toko - Dijamin 100% Presisi)
  layoutData       Json      @map("layout_data")
  notes            String?
  
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  user             User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([storeCode])
  @@index([branch])
  @@index([createdAt])
  @@map("mep_simulation_logs")
}
```

Juga tambahkan relasi di `model User`:
```prisma
mepSimulationLogs MepSimulationLog[]
```

---

## 2. Struktur `layoutData` (JSON Snapshot)
Data yang direkam dalam kolom `layoutData` diambil dari state kanvas aktif:
1. `customPts`: Array titik koordinat poligon dinding dalam satuan meter asli.
2. `customClosed`: Status poligon tertutup (`true/false`).
3. `segmentOverrides`: Penanda dinding kaca / pintu masuk / pintu P1.
4. `cashierDepths`: Kedalaman zona kasir per segmen.
5. `placedUnits`: Array unit AC (ID, posisi $x, y$ meter, rotasi, kapasitas BTU).
6. `pillars`: Array tiang/kolom toko yang diletakkan.
7. `lighting`: Parameter pencahayaan (orientasi $H/V$, spasi, lampu non-aktif, dimensi).

---

## 3. Server Actions yang Akan Dibuat
Lokasi: `app/actions/mep-simulation-actions.ts`

1. **`saveMepSimulation(payload)`**:
   - Memvalidasi session pengguna.
   - Menyimpan metrik dan snapshot JSON ke database.
   - Mengembalikan `id` log yang baru dibuat.
2. **`getMepSimulationList({ storeCode, branch, page })`**:
   - Mengambil daftar riwayat simulasi (hanya kolom ringkasan tanpa me-load `layoutData` agar query super cepat).
3. **`getMepSimulationDetail(id)`**:
   - Mengambil data lengkap termasuk `layoutData` saat user memilih untuk memuat/membuka denah.

---

## 4. Rencana Perubahan Tampilan (UI / UX)

### A. Di Halaman Simulator (`app/store-mep-simulator/`)
1. **Tombol "💾 Simpan Rancangan"**:
   - Ditaruh di toolbar atas / sebelah tombol Export Laporan.
   - Menampilkan dialog konfirmasi ringkasan (Nama Toko, Qty AC, Qty Lampu, Catatan).
   - Memberikan toast notifikasi sukses: *"Rancangan toko berhasil disimpan!"*.
2. **Tombol "📂 Buka Rancangan" & Dialog Modal**:
   - Membuka daftar rancangan yang pernah disimpan sebelumnya.
   - User bisa memfilter berdasarkan nama toko atau tanggal.
   - Klik *"Muat Denah"* $\rightarrow$ Mengisi semua state kanvas (`setCustomPts`, `setPlacedUnits`, dll.) sehingga denah langsung aktif kembali.
3. **Smart Prompt saat "Pilih Toko"**:
   - Jika toko yang dipilih memiliki rancangan tersimpan di database, muncul tombol opsi: *"Muat Denah Tersimpan Terakhir"*.

### B. Di Halaman Admin (`app/admin/calculator-logs/`)
1. Menambahkan Tab ke-3: **"MEP Simulator"** (di samping Tab *AC* dan *Lampu*).
2. Menampilkan tabel riwayat simulasi seluruh cabang dengan filter cabang, tanggal, dan pencarian toko.
3. Tombol aksi di setiap baris:
   - **Buka di Simulator**: Membuka halaman `/store-mep-simulator` dengan denah langsung termuat.
   - **Lihat Ringkasan**: Modal quick-view metrik AC & Lampu.

---

## 5. Checklist Eksekusi (Nanti Sore Jam 16:00)
- [ ] 1. Update `prisma/schema.prisma` (Tambah model `MepSimulationLog`).
- [ ] 2. Jalankan `npx prisma db push` & `npx prisma generate`.
- [ ] 3. Buat file `app/actions/mep-simulation-actions.ts`.
- [ ] 4. Tambahkan tombol Simpan & Buka Denah di `store-mep-simulator-client.tsx`.
- [ ] 5. Tambahkan Tab MEP Simulator di `app/admin/calculator-logs/`.
- [ ] 6. Uji coba:
  - Buat denah toko dan pasang AC + lampu.
  - Klik Simpan.
  - Refresh browser / buka tab baru.
  - Klik Buka Rancangan $\rightarrow$ Pastikan denah termuat 100% identik persis.
