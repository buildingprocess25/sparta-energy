# Proposal & Dokumen Riset: Sistem Monitoring Toko Terdampak Bencana

Dokumen ini berisi rangkuman konsep, daftar API resmi publik yang dapat digunakan, formula perhitungan radius geolokasi, serta rancangan alur sistem deteksi toko terdampak bencana untuk jaringan toko retail SPARTA Energy.

---

## 1. Latar Belakang & Tujuan
* **Kebutuhan:** Memanfaatkan koordinat lokasi toko (`latitude`, `longitude`) yang sudah ada di database untuk mendeteksi secara otomatis toko-toko yang berada di dalam radius bahaya bencana alam (gempa bumi, cuaca ekstrem, banjir, dsb.).
* **Tujuan Utama:**
  1. *Early Warning Alert:* Memberikan notifikasi instan kepada tim manajemen & auditor saat terjadi bencana di dekat lokasi toko.
  2. *Status Verification Flow:* Sistem menyediakan formulir/tiket konfirmasi cepat kepada penanggung jawab toko/cabang untuk memverifikasi apakah toko benar-benar terdampak (listrik padam, kerusakan fisik, atau operasional aman).

---

## 2. Referensi API Bencana yang Siap Digunakan

### A. BMKG Open Data (Resmi Indonesia - Paling Rekomendasi 🇮🇩)
* **Kelebihan:** Data resmi pemerintah RI, *real-time*, gratis tanpa perlu registrasi atau API key.
* **Endpoint Gempa Bumi:**
  * **Gempa Terkini Real-time (M 5.0+):**
    `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`
  * **15 Gempa Bumi Terkini (M 5.0+):**
    `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
  * **Daftar Gempa Dirasakan (Skala MMI):**
    `https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json`
* **Data JSON yang Dihasilkan:**
  * `Coordinates` / `Lintang` & `Bujur`
  * `Magnitude` (Skala Richter)
  * `Kedalaman` (km)
  * `Wilayah`
  * `Potensi` (Tsunami / Tidak)
  * `Dirasakan` (Skala MMI)

### B. USGS Earthquake API (Global Data)
* **Endpoint:** `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson`
* **Kelebihan:** Format standar GeoJSON, memiliki parameter bawaan `latitude`, `longitude`, dan `maxradiuskm` untuk filter radius langsung dari URL query.
* **Biaya:** Gratis publik.

### C. GDACS (Global Disaster Alert and Coordinating System - PBB)
* **Website:** `https://www.gdacs.org/`
* **Cakupan Bencana:** Banjir (*Floods*), Siklon Tropis (*Tropical Cyclones*), Erupsi Gunung Api (*Volcanoes*), Tsunami.
* **Feed API:** Menyediakan feed REST API / GeoJSON bencana aktif di kawasan Asia Tenggara/Indonesia secara gratis.

### D. OpenWeather / Tomorrow.io (Peringatan Cuaca Ekstrem)
* **Fungsi:** Mengambil *Severe Weather & Extreme Rainfall Alerts* berdasarkan koordinat Latitude/Longitude toko.

---

## 3. Logika Perhitungan Radius Geolokasi (Haversine Formula)

Untuk menghitung jarak antara titik pusat gempa/bencana $(lat_1, lon_1)$ dengan koordinat toko $(lat_2, lon_2)$:

$$\Delta lat = lat_2 - lat_1$$
$$\Delta lon = lon_2 - lon_1$$
$$a = \sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_1) \cdot \cos(lat_2) \cdot \sin^2\left(\frac{\Delta lon}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c \quad (\text{dengan } R = 6371\text{ km})$$

### Ambang Batas Radius Waspada (Contoh Standar):
* **Gempa M 5.0 - 5.9:** Radius waspada $50 - 100\text{ km}$
* **Gempa M 6.0 - 6.9:** Radius waspada $150 - 250\text{ km}$
* **Gempa M 7.0+:** Radius waspada $> 300\text{ km}$
* **Erupsi Gunung Berapi / Banjir:** Radius waspada $10 - 30\text{ km}$

---

## 4. Rencana Arsitektur & Alur Kerja Sistem

```
┌────────────────────────────────────────┐
│  BMKG / USGS API (Polling Background)  │
└───────────────────┬────────────────────┘
                    │ Setiap 5 - 10 Menit
                    ▼
┌────────────────────────────────────────┐
│  Disaster Engine (Haversine Matcher)   │
│  Hitung Jarak Pusat Gempa ke Semua     │
│  Koordinat Toko di Database            │
└───────────────────┬────────────────────┘
                    │ Jika Jarak <= Radius Waspada
                    ▼
┌────────────────────────────────────────┐
│  Alert & Incident System               │
│  - Muncul Banner Waspada di Dashboard  │
│  - Tandai Toko "Berpotensi Terdampak"  │
│  - Kirim Form Konfirmasi Dampak Toko   │
└───────────────────┬────────────────────┘
                    │ Verifikasi Lapangan
                    ▼
┌────────────────────────────────────────┐
│  Status Konfirmasi Toko:               │
│  [ Aman ] [ Listrik Padam ] [ Rusak ]  │
└────────────────────────────────────────┘
```

---

## 5. Status Saat Ini
* **Status:** Dalam tahap riset & pengecekan API oleh tim.
* **Tindak Lanjut:** Pembahasan arsitektur tabel database (`DisasterAlert`, `StoreDisasterImpact`) dan integrasi UI Dashboard saat siap dieksekusi.
