# Changelog: Kalkulator Konsumsi Energi Toko

Rumus kalkulator yang dipakai anak toko di Mode Auditor (Step 2 dan Step 3), draf, submit, dan halaman validasi.

## v2.0.0, 4 November 2026

Spesifikasi dan pembanding: `docs/energy_calculator_formula_v2.md`.

### Ditambahkan
- Karakteristik operasi STATIS / DINAMIS per tipe alat. Alat DINAMIS memakai daya base H = running × waktu running + standby × waktu standby.
- Daya nameplate per merek, bisa diisi dalam W atau kW. Daya running dan standby bisa diisi sebagai % nameplate atau W/kW.
- Snapshot profil di setiap baris audit (`formula_version` = 2), dipakai saat menghitung ulang di halaman validasi.
- Laporan "Pembanding Rumus Baru" (Excel) di menu Laporan. Hanya membaca, tidak mengubah audit.
- Alat kustom dari toko memilih karakteristik, metode, dan waktu per transaksi atau batch.
- Kategori alat diganti menjadi 7 kategori dari sheet revisi (Refrigeration, Lighting, VAC, POS, Signage & Display, Kitchen & Food Processing (Beanspot), Other Equipment). Tipe alat lama dipetakan lewat migrasi.

### Diubah
- Jumlah transaksi dan batch diisi sebagai **total toko**. Jam standby memakai total jam nyala semua alat (O × P).
- Form toko dan submit menolak isian kalau waktu kerja melebihi jam nyala.
- Form admin master equipment, "Merek dari Lapangan", dan review alat kustom memakai satu komponen profil (`components/admin/energy-profile-fields.tsx`). Daya base tidak lagi diketik, tetapi dihitung.

### Diperbaiki
- Alat transaksi/batch dengan daya running 0 di master tidak lagi dihitung 0 kWh (bug 1).
- Rumus kWh tidak lagi disalin di form, draf, submit, step 3, dan validasi. Semua memakai `lib/energy-formula.ts` (bug 4).
- Ringkasan demo di Step 3 memakai baris hitungan yang sama dengan submit.

### Tidak berubah
- Alat STATIS dihitung sama persis dengan v1.
- Audit yang sudah tersimpan tidak dihitung ulang. Baris sebelum v2 tetap memakai rumus v1 kalau dikoreksi di halaman validasi.
- Batas Boros (aktual PLN > standar × 1,05) dan standar bulanan (× 30 hari).

## v1, sampai 3 November 2026

- Standar: kW × jam × jumlah.
- Transaksi / batch: running × jam kerja + standby × sisa jam, jam kerja dibatasi jam nyala, dikali jumlah alat. Jumlah transaksi diisi per alat.
