> Dokumen utama konsep akses role (versi 5). Awalnya ditulis di repo
> smart-energy-monitoring pada 26 Oktober 2026, lalu dipindahkan ke sini karena
> sebagian besar pekerjaannya ada di sparta-energy. Bagian untuk sparta-energy:
> bagian 5 "sparta-energy" dan bagian 11. Bagian portal (bagian 5
> "smart-energy-monitoring") dikerjakan di repo portal mengikuti dokumen ini.

# Konsep Akses Role: Admin, Auditor, GS General Service, dan Area

Status: konsep versi 5, disetujui user. Semua keputusan tahap ini sudah masuk. Belum ada kode, migrasi,
atau data yang diubah. Tanggal: 26 Oktober 2026.

Berlaku untuk dua repo:

- **sparta-energy** (`energy.sparta-alfamart.web.id`): tempat login, halaman
  pilihan `/admin-entry`, dashboard admin, kalkulator, dan pengaturan assign alat.
- **smart-energy-monitoring** (`energy-monitoring.sparta-alfamart.web.id`, portal
  ini): monitoring IoT.

## 1. Siapa masuk ke mana

| Role | Setelah login | Portal monitoring IoT |
| :--- | :--- | :--- |
| `ADMIN` | Halaman pilihan `/admin-entry`: Mode Auditor, Dashboard Admin, atau Smart Energy Meter | Semua alat |
| `AUDITOR` (role baru) | Halaman pilihan yang sama dengan admin | Semua alat |
| `GS` (role baru) | Langsung ke portal monitoring IoT | Hanya alat yang di-assign ke akunnya |
| `AREA` (role baru) | Langsung ke Dashboard Admin (`/admin/dashboard`) | Ditolak |
| `USER` | Langsung ke kalkulator (`/dashboard`) seperti sekarang | Ditolak |

Akses `AREA` di sparta untuk sementara **sama dengan `ADMIN`**, karena kriterianya
belum ada. Aksesnya diatur di satu peta role → menu (lihat bagian 5), jadi nanti
cukup peta itu yang diubah. Selama masih sama dengan admin, user Area juga bisa
membuka User & Akses dan Master Data, termasuk memberi assign alat ke user GS.

Yang memberi assign alat ke user GS: semua `ADMIN` (dan `AREA` selama aksesnya
masih sama dengan admin).

## 2. Kondisi sekarang

- **Portal ini belum punya login.** Nama "Admin SPARTA" di sidebar ditulis
  langsung di `components/layout/app-sidebar.tsx:242`, dan semua query membaca
  semua device.
- **Role di sparta** baru `USER` dan `ADMIN` (`prisma/schema.prisma`, enum
  `Role`).
- **Login sparta** lewat SSO pusat (`app/api/auth/sso/callback/route.ts`). SSO
  menulis baris di tabel `session`, memasang cookie `sso_session` tanpa domain,
  lalu mengarahkan `ADMIN` ke `/admin-entry` dan role lain ke `/dashboard`.
- **`/admin-entry` sudah berupa halaman pilihan** berisi tiga kartu: Mode Auditor
  (`/dashboard`), Dashboard Admin (`/admin/dashboard`), dan Smart Energy Meter
  (portal ini). Saat ini halaman itu hanya untuk `ADMIN`.
- **sparta sudah memanggil `GET /api/stores` portal ini tanpa login**
  (`lib/iot-status.ts`) untuk penanda "IoT terpasang".
- Device dan sensor ada di DB 2. Satu device bisa berisi beberapa sensor,
  misalnya `EM-0002` berisi `COOLER_01` dan tiga `FREEZER`.
- Portal hanya membaca DB 1 dan DB 2. Migrasi DB 1 hanya dari sparta-energy dan
  butuh izin user.

## 3. Login: satu cookie untuk semua subdomain

Karena semua aplikasi ada di bawah `sparta-alfamart.web.id`, cara paling
sederhana adalah memakai satu sesi untuk semuanya:

1. SSO callback sparta memasang `sso_session` dengan
   `domain: ".sparta-alfamart.web.id"` di production. Di lokal tidak perlu
   domain, karena cookie `localhost` berlaku untuk semua port.
2. Portal membaca `sso_session`, mencari token itu di tabel `session` DB 1
   (cek `expires_at`), lalu membaca `role` dan `full_name` dari `users`. Semua
   SELECT saja; portal tidak menulis apa pun.
3. Logout di sparta menghapus cookie dengan domain yang sama, jadi portal ikut
   keluar.

Akibat yang perlu diketahui: cookie juga terkirim ke `energy-meter.` (Flask).
Cookie itu `httpOnly` dan Flask tidak memakainya, jadi tidak ada perubahan
perilaku. Yang berubah hanya cakupannya.

Cadangan kalau domain berubah nanti: serah-terima token bertanda tangan
berumur 60 detik dari sparta ke portal (versi 1 konsep ini).

## 4. Data izin (di DB 1, dibuat oleh sparta-energy)

1. Enum `Role` ditambah `AUDITOR`, `GS`, dan `AREA`.
2. Tabel baru `user_device_access`:

   | Kolom | Tipe | Isi |
   | :--- | :--- | :--- |
   | `user_id` | uuid | FK ke `users.id`, hapus berantai |
   | `device_id` | text | `devices.id` di DB 2, misalnya `EM-0002` |
   | `created_by` | uuid | Admin yang memberi akses |
   | `created_at` | timestamp | Waktu akses diberikan |

   Kunci unik `(user_id, device_id)`.

Izin diberikan **per alat**. Kalau nanti AC punya alat IoT sendiri, alat itu
cukup di-assign seperti alat lain.

## 5. Pembagian kerja

### sparta-energy

1. **Migrasi**: role `AUDITOR`, `GS`, dan `AREA`, plus tabel `user_device_access`.
2. **Arah setelah login** (SSO callback dan `proxy.ts`):
   - `ADMIN`, `AUDITOR`: ke `/admin-entry`.
   - `GS`: ke portal monitoring. Semua halaman sparta lain ditolak dan
     diarahkan ke portal.
   - `AREA`: langsung ke `/admin/dashboard`.
   - `USER`: ke `/dashboard` seperti sekarang.
3. **`/admin-entry`** dibuka untuk `AUDITOR` dengan ketiga kartu yang sama.
   AUDITOR juga boleh membuka Dashboard Admin (`/admin/...`).
4. **Peta akses role** `lib/role-access.ts`: satu daftar role → halaman atau
   menu yang boleh dibuka, dipakai oleh `proxy.ts`, pengecekan admin, dan menu
   sidebar. Halaman yang tidak terdaftar ditolak. Untuk tahap ini `AREA` memakai
   daftar yang sama dengan `ADMIN`, sehingga pengecekan `role === "ADMIN"` yang
   tersebar diganti dengan pemanggilan peta ini.
5. **Cookie `sso_session`** memakai domain induk di production (bagian 3).
6. **Halaman User & Akses**:
   - Pilihan role bertambah `AUDITOR`, `GS`, dan `AREA`.
   - Untuk user GS: daftar alat yang bisa dicentang, dikelompokkan per toko.
     Daftarnya diambil dari portal (`GET /api/internal/devices`), karena sparta
     tidak terhubung ke DB 2.
7. **`lib/iot-status.ts`** mengirim header token internal saat memanggil
   `/api/stores` (lihat langkah portal nomor 5).

### smart-energy-monitoring

1. **Sesi**: `lib/auth/session.ts` membaca `sso_session`, mencari tokennya di
   tabel `session`, lalu membaca `users` di DB 1. Hasilnya `{ userId, name,
   email, role }`, atau `null` kalau sesi kosong atau kedaluwarsa. Role dibaca
   ulang di setiap request, jadi perubahan role oleh admin langsung berlaku.
2. **`proxy.ts`** (konvensi Next 16, pengganti middleware):
   - Tanpa sesi: arahkan ke login sparta.
   - `USER`: arahkan ke kalkulator sparta.
   - `AREA`: arahkan ke Dashboard Admin sparta.
   - Role lain yang tidak dikenal: halaman "Akun Anda tidak punya akses ke
     portal ini."
3. **Lingkup akses** `getAccessScope(viewer)`:
   - `ADMIN`, `AUDITOR`: semua device.
   - `GS`: daftar `device_id` dari `user_device_access`.
4. **Penyaringan di service, bukan di tampilan**, supaya API ikut terlindungi:
   - `getIotDeviceDataList()` menyaring `devices.id = ANY($1)`. `getStores()` dan
     `getStoreById()` otomatis hanya berisi toko dari alat itu.
   - Toko dengan banyak device (TI90 punya enam) hanya memakai device yang
     diizinkan, termasuk saat memilih device utama untuk grafik.
   - `getStoreAnalyticsData()`, `getTelemetryHistory()`, `getLiveTelemetry()`,
     `getAuditSessions()`, `getMonthlyCostSummary()`, dan
     `getDailyConsumptionTrend()` menolak device di luar lingkup.
5. **Route API** `app/api/stores/...` menerima salah satu dari dua: sesi yang
   valid, atau header `x-internal-token` yang cocok dengan
   `MONITORING_INTERNAL_TOKEN` (untuk sparta). Token internal mendapat lingkup
   penuh. Selain itu: 401, atau 403 kalau device di luar lingkup.
6. **`GET /api/internal/devices`**: daftar device (id, nama, kode toko, nama
   toko, sensor) untuk halaman User & Akses. Hanya dengan token internal.
7. **Tampilan**:
   - Sidebar menampilkan nama dan email user yang login, bukan teks tetap.
   - Untuk GS: bagian Prioritas Pasang IoT disembunyikan, dan KPI serta biaya
     PLN dihitung dari alat miliknya saja. Halaman detail toko tampil lengkap
     (gauge, telemetri, analitik), tetapi datanya hanya dari alat yang
     di-assign.
   - Untuk ADMIN dan AUDITOR: ada link kembali ke halaman pilihan
     `/admin-entry`.
   - GS tanpa alat: "Belum ada alat yang di-assign ke akun Anda. Hubungi admin
     SPARTA."

## 6. Alur

```
Login SSO pusat ──▶ sparta /api/auth/sso/callback
                      │ simpan session, set sso_session (.sparta-alfamart.web.id)
                      ├─ ADMIN / AUDITOR ──▶ /admin-entry ──▶ pilih: Auditor | Admin | Smart Energy Meter
                      ├─ GS ───────────────▶ energy-monitoring.sparta-alfamart.web.id
                      ├─ AREA ─────────────▶ /admin/dashboard (akses sama dengan admin, sementara)
                      └─ USER ─────────────▶ /dashboard (kalkulator)

Portal menerima request ──▶ baca sso_session ──▶ SELECT session + users (DB 1)
        │ GS: SELECT user_device_access
        ▼
service menyaring device ──▶ halaman dan API hanya berisi alat yang diizinkan
```

## 7. Kalau terjadi masalah

- **Sesi kedaluwarsa atau tidak ada**: arahkan ke login sparta. Portal tidak
  pernah menampilkan data tanpa sesi.
- **DB 1 tidak bisa dibaca**: tolak akses (503) dengan pesan "Akses tidak bisa
  diperiksa. Coba lagi beberapa saat lagi." Tidak pernah jatuh ke "lihat semua".
- **Tabel `user_device_access` belum ada**: user GS melihat pesan belum ada
  alat; admin dan auditor tetap normal.
- **Device yang di-assign hilang dari DB 2**: diabaikan di portal, dan ditandai
  "alat tidak ditemukan" di halaman User & Akses.
- **Token internal salah atau belum dipasang di sparta**: penanda "IoT
  terpasang" di sparta menampilkan "status IoT tidak tersedia", bukan "belum
  terpasang".

## 8. Pengujian

- Unit test (TDD) untuk pembacaan sesi, penentuan lingkup, dan penyaringan
  device, termasuk toko dengan banyak device dan sesi kedaluwarsa.
- Uji manual dengan lima akun yang dibuat lewat User & Akses (ADMIN, AUDITOR,
  GS dengan dua alat, AREA, USER): cek tujuan setelah login, halaman portal, dan
  setiap route API.
- Akun GS memanggil API dengan `storeId` di luar lingkup: harus 403.
- Penanda "IoT terpasang" di sparta tetap jalan setelah login portal aktif.

## 9. Urutan rilis

Urutan ini menjaga penanda IoT di sparta tetap jalan di setiap langkah.

1. **Portal**: route API menerima token internal. Untuk sementara akses tanpa
   token tetap diizinkan.
2. **sparta**: `lib/iot-status.ts` mengirim token internal.
3. **sparta**: migrasi role dan tabel. Perilaku belum berubah.
4. **Portal**: sesi, `proxy.ts`, lingkup, dan tampilan. Akses tanpa sesi atau
   token mulai ditolak.
5. **sparta**: cookie domain induk, arah login per role, `/admin-entry` untuk
   AUDITOR, dan halaman User & Akses.

## 10. Keputusan (26 Oktober 2026)

1. AUDITOR boleh membuka Dashboard Admin dari halaman pilihan, sama seperti
   ADMIN.
2. GS boleh membuka halaman detail toko secara lengkap, dengan data hanya dari
   alat yang di-assign.
3. Role AREA dibuat sekarang: langsung ke Dashboard Admin, akses sementara sama
   dengan ADMIN, ditolak di portal monitoring IoT.

Nanti setelah kriteria Area ada: tentukan menu yang ditutup (misalnya User &
Akses, Master Data) dan apakah datanya dibatasi per cabang (`users.branch`),
lalu ubah peta akses role.

## 11. Simulasi role untuk testing lokal

Diputuskan 26 Oktober 2026: tombol Masuk Cepat per role **tidak** membuat akun
atau migrasi di database. `.env` lokal sparta mengarah ke database live, jadi
role disimulasikan lewat cookie dan hanya berlaku saat
`NODE_ENV=development`.

Kesepakatan antar repo:

| Hal | Nilai |
| :--- | :--- |
| Cookie role simulasi | `dev_role`, isi salah satu `ADMIN`, `AUDITOR`, `GS`, `AREA`, `USER`. `httpOnly`, `sameSite=lax`, `path=/`, tanpa domain (cookie `localhost` berlaku untuk semua port). |
| Siapa yang memasang | `POST /api/dev-login` di sparta, dengan body `{ "role": "<ROLE>" }`. Tetap login memakai akun admin dev seperti sekarang. Role `ADMIN` atau tanpa body menghapus `dev_role`. |
| Siapa yang membaca | sparta dan portal, **hanya** kalau `NODE_ENV=development`. Di production cookie ini diabaikan. |
| Tujuan setelah tombol diklik | `ADMIN`, `AUDITOR`: `/admin-entry`. `GS`: `ENERGY_MONITORING_URL` (lokal `http://localhost:3001`). `AREA`: `/admin/dashboard`. `USER`: `/dashboard`. |
| Alat untuk GS simulasi | env portal `DEV_GS_DEVICE_IDS`, daftar `devices.id` dipisah koma, misalnya `EM-0010,EM-0002`. |
| Logout | `POST /api/auth/sign-out` di sparta juga menghapus `dev_role`. |
| Token internal | header `x-internal-token` berisi `MONITORING_INTERNAL_TOKEN` (env yang sama di kedua repo). Dipakai sparta saat memanggil `GET /api/stores` portal. Selama env ini belum diisi di portal, `GET /api/stores` tetap terbuka seperti sekarang. |

Di portal, user yang membuka halaman tanpa cookie `sso_session` diarahkan ke
`NEXT_PUBLIC_SPARTA_AUDIT_URL` + `/login`.

Setelah migrasi role sungguhan disetujui nanti, simulasi ini tetap boleh ada
untuk testing lokal, karena hanya aktif di development.

Catatan dari review sesi sparta-energy (26 Oktober 2026):

- `POST /api/dev-login` yang sudah ada **menulis satu baris ke tabel `session`**
  di DB live setiap kali tombol Masuk Cepat diklik (`app/api/dev-login/route.ts`).
  Simulasi `dev_role` tidak menambah tulisan baru, tapi testing lokal tetap
  menambah baris sesi di DB live.
- Domain cookie `sso_session` diatur lewat env baru sparta `SSO_COOKIE_DOMAIN`.
  Kalau kosong, cookie tetap tanpa domain seperti sekarang. Sign-out menghapus
  cookie dengan domain yang sama.
- Selama migrasi belum disetujui, role baru hanya ada lewat `dev_role`. Pilihan
  role baru di halaman User & Akses, checklist alat GS, dan pemanggilan
  `GET /api/internal/devices` ditunda sampai migrasi disetujui. Portal tetap
  menangani tabel `user_device_access` yang belum ada (GS tanpa alat).
- `ENERGY_MONITORING_URL` di sparta dipakai untuk kartu Smart Energy Meter dan
  penanda IoT. Di lokal diisi `http://localhost:3001`, jadi penanda IoT memanggil
  portal lokal; kalau portal lokal mati, admin sparta menampilkan "Status IoT
  tidak tersedia". Disepakati tetap satu env.

## 12. Status sisi sparta-energy (26 Oktober 2026)

Sudah dikerjakan, belum di-commit:

- Peta akses role ada di `lib/role-access.ts` (`ROLE_ACCESS`, `can`, `getHomeUrl`,
  `resolveRole`). Role efektif di server dibaca lewat `lib/current-role.ts`.
- Keputusan user untuk AUDITOR: boleh memvalidasi kalkulasi dan melihat semua
  cabang, tetapi tidak membuka User & Akses dan Master Data, dan tidak menghapus
  kalkulasi. AREA sama dengan ADMIN.
- Masuk Cepat per role, `dev_role`, redirect per role, `SSO_COOKIE_DOMAIN`, dan
  header `x-internal-token` sesuai bagian 11.
- Atas permintaan user, file migrasi role dan tabel `user_device_access` sudah
  ditulis di `prisma/migrations/20261027010000_add_roles_and_device_access/`,
  tetapi **belum dijalankan**. Pilihan role baru di User & Akses baru bisa
  disimpan setelah migrasi itu dijalankan.
- Belum dikerjakan: checklist alat untuk GS di User & Akses, karena menunggu
  `GET /api/internal/devices` dari portal.
