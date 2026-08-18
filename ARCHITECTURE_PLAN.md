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
