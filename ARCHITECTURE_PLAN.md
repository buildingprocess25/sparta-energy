# 📐 Rencana Arsitektur Sistem Monitoring & Audit Energi (3-Pilar)

Dokumen ini mencatat hasil keputusan arsitektur dan integrasi untuk ekosistem **Smart Energy & Audit System**.

---

## 🏗️ 1. Struktur Ekosistem (3 Proyek Terpisah)

Sistem terdiri dari 3 repositori/proyek independen dengan peran dan domain fungsi yang saling melengkapi:

| Proyek | Domain & Peran Utama | Tech Stack | Database Target |
| :--- | :--- | :--- | :--- |
| **`sparta-energy`** | **Master Toko & Audit Manual**<br>Manajemen master toko/cabang, koordinat GPS, audit manual peralatan, standar PLN, laporan manajemen, dan AI Strategic Recommendations. | Next.js 16, Prisma ORM, Better-Auth, PostgreSQL | **DB 1: `sparta_energy`** *(Master Toko, User, Audits)* |
| **`smart-energy-meter-vps`** | **IoT Ingestion Engine & Tool Operasional**<br>Penerimaan data MQTT ESP32, penyimpanan log telemetri, manajemen penugasan toko per device, rekaman sesi (*Capture*). | Python Flask, PostgreSQL, Paho MQTT, Docker | **DB 2: `energy_meter`** *(Devices, Telemetry, History)*<br>+ Read-only ke **DB 1** |
| **`smart-energy-monitoring`** | **Portal Visualisasi & Dashboard Monitoring**<br>Visualisasi live gauge 3-fase, peta interaktif sebaran alat IoT (Live/Historical), grafik tren daya & kWh per toko. | Next.js 16, React 19, Tailwind CSS 4, Recharts, Leaflet/Map | Mengonsumsi **DB 1** (Toko & Peta) & **DB 2** (Telemetri IoT) |

---

## 🗄️ 2. Strategi Dual Database (Isolasi & Integrasi)

```
┌──────────────────────────────────────────────┐       ┌──────────────────────────────────────────────┐
│        🏢 DATABASE 1: `sparta_energy`        │       │        ⚡ DATABASE 2: `energy_meter`         │
│  - Tabel `stores`                            │       │  - Tabel `devices`                           │
│    (id, code, name, branch,                  │       │    (id, name, online, last_seen,             │
│     latitude, longitude, daya_va, area)      │       │     store_id, store_code, lat, lng)          │
│  - Tabel `users`, `accounts`, `sessions`     │       │  - Tabel `telemetry` (snapshot 15 menit)     │
│  - Tabel `audits`, `audit_items`             │       │  - Tabel `history` (rekaman sesi capture)    │
└──────────────────────┬───────────────────────┘       └──────────────────────┬───────────────────────┘
                       │                                                      │
         (1) Query Master Toko (Read-Only)                       (2) Simpan Data IoT + Metadata Toko
                       │                                                      │
                       ▼                                                      ▼
              ┌────────────────────────────────────────────────────────────────────────┐
              │                     ⚙️ `smart-energy-meter-vps`                        │
              │  - Tab Settings ➔ Manage Devices: Dropdown cari Toko dari DB 1         │
              │  - Modal Start Capture: Terikat ke ID Toko & Koordinat GPS             │
              └───────────────────────────────────┬────────────────────────────────────┘
                                                  │
                                                  ▼
              ┌────────────────────────────────────────────────────────────────────────┐
              │                     📊 `smart-energy-monitoring`                       │
              │  - Sinkronisasi Peta & Status Toko:                                    │
              │    🟢 LIVE : Perangkat IoT aktif merekam di toko tersebut              │
              │    🔵 HISTORICAL : Toko memiliki riwayat rekaman audit IoT             │
              │    ⚪ UNASSIGNED : Toko belum pernah dipasang IoT                      │
              │  - Klik Pin Toko di Peta ➔ Langsung buka grafik daya & riwayat audit   │
              └────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 3. Peran `sparta-energy` sebagai Single Source of Truth Master Toko

1. **Master Toko (`stores`):**
   - Menyimpan seluruh metadata toko (Kode, Nama, Cabang, Luas Area Sales/Gudang/Teras/Parkir, Daya VA PLN, dan Koordinat `latitude`/`longitude`).
   - Digunakan oleh `smart-energy-meter-vps` saat auditor/teknisi mengasosiasikan device IoT dengan toko yang sedang diaudit.
2. **Single Sign-On (SSO):**
   - Tabel `users`, `sessions`, dan `accounts` di `sparta_energy` menjadi basis autentikasi terpusat yang juga digunakan oleh `smart-energy-monitoring`.

---

## 🔗 4. Kontrak DB 1 antar-repo (dicek 23 Oktober 2026)

1. **Nama database:** nama sebenarnya DB 1 adalah `energy`. Sebutan `sparta_energy` di dokumen ini merujuk ke database yang sama.
2. **Migrasi:** skema DB 1 hanya diubah lewat migrasi Prisma di `sparta-energy` (`npx prisma migrate deploy`). `smart-energy-monitoring` hanya membaca DB 1 lewat `SPARTA_DATABASE_URL` dan tidak pernah menjalankan migrasi atau menulis data.
3. **View yang menjadi kontrak:** nama kolomnya dipakai repo lain. Menambah kolom aman, tetapi mengubah atau menghapus kolom harus dikoordinasikan dulu.

   | View | Dipakai oleh | Rincian |
   |---|---|---|
   | `v_toko_sangat_boros` | `smart-energy-monitoring` (Prioritas Pasang IoT, baseline grafik kWh) dan label "Sangat Boros" di admin `sparta-energy` | `docs/integrasi-sangat-boros-monitoring.md` |

## 📡 5. Status IoT di admin `sparta-energy` (diputuskan 26 Oktober 2026)

1. `sparta-energy` **tidak** terhubung ke DB 2 (`energy_meter`). Status IoT per toko dibaca dari `GET /api/stores` milik `smart-energy-monitoring` lewat HTTP, sehingga aturan pencocokan device dan status live tetap di satu tempat.
2. Endpoint itu read-only dan saat ini tanpa autentikasi (diputuskan user). Alamatnya diatur lewat env `ENERGY_MONITORING_URL` di `sparta-energy`.
3. Kontrak respons yang dipakai: `code` (huruf besar), `status` (`live` atau `historical`), `deviceCount`, `isRecording`. Toko yang tidak ada di respons berarti belum dipasang IoT. Perubahan nama field ini harus dikoordinasikan.
4. Pencocokan device ke toko bergantung pada kode toko di dalam kurung pada nama device di `smart-energy-meter-vps`, misalnya `[TI90] RUKO ELEVEE`. Device tanpa kode seperti itu tidak akan cocok ke toko mana pun.
