$ErrorActionPreference = "Stop"

$outDocx = Join-Path (Get-Location) "Dokumen_Logika_dan_Hirarki_Kalkulator_Lampu_Native.docx"
if (Test-Path $outDocx) {
    try { Remove-Item $outDocx -Force } catch {}
}

Write-Host "Membuka Microsoft Word COM Engine..."
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

$doc = $word.Documents.Add()

# Margins
$doc.PageSetup.TopMargin = 72    # 1 inch = 72 pt
$doc.PageSetup.BottomMargin = 72
$doc.PageSetup.LeftMargin = 72
$doc.PageSetup.RightMargin = 72

# Title
$p1 = $doc.Paragraphs.Add()
$p1.Range.Text = "DOKUMEN TEKNIS & ANALISIS LOGIKA`nALUR HIRARKI KEPUTUSAN KALKULATOR LAMPU"
$p1.Range.Font.Name = "Calibri"
$p1.Range.Font.Size = 16
$p1.Range.Font.Bold = 1
$p1.Range.Font.Color = 0x8A3A1E # BGR: #1E3A8A
$p1.Alignment = 1 # Center
$p1.Range.InsertParagraphAfter()

$pSub = $doc.Paragraphs.Add()
$pSub.Range.Text = "Sistem Sparta Energy (Versi Engine v1.1.0 & Evaluasi Multi-Parameter)`n____________________________________________________________________"
$pSub.Range.Font.Name = "Calibri"
$pSub.Range.Font.Size = 11
$pSub.Range.Font.Bold = 0
$pSub.Range.Font.Color = 0x63554B
$pSub.Alignment = 1
$pSub.Range.InsertParagraphAfter()

# Section A
$pA = $doc.Paragraphs.Add()
$pA.Range.Text = "A. Alur Hirarki Pengambilan Keputusan Saat Ini (Step-by-Step)"
$pA.Range.Font.Name = "Calibri"
$pA.Range.Font.Size = 14
$pA.Range.Font.Bold = 1
$pA.Range.Font.Color = 0x8A3A1E
$pA.Alignment = 0 # Left
$pA.Range.InsertParagraphAfter()

$pADesc = $doc.Paragraphs.Add()
$pADesc.Range.Text = "Sistem kalkulator lampu (lib/lamp-calculator.ts pada fungsi calcSimetris) mengambil keputusan secara berurutan (sequential hierarchy) dari target daya, penataan dimensi horizontal, hingga penataan dimensi vertikal:"
$pADesc.Range.Font.Name = "Calibri"
$pADesc.Range.Font.Size = 11
$pADesc.Range.Font.Bold = 0
$pADesc.Range.Font.Color = 0x374151
$pADesc.Alignment = 0
$pADesc.Range.InsertParagraphAfter()

# Flow Box
$pBox = $doc.Paragraphs.Add()
$flowText = @"
TAHAP 1: Hitung Target Daya Listrik (4.0 - 5.0 W/m²)
└── Menghasilkan Batas Min Lampu & Batas Max Lampu sesuai luasan toko

TAHAP 2: Penentuan Lampu Per Baris (LPB) & Jarak Samping (JS)
└── Memilih opsi LPB dengan prioritas Jarak Samping ideal (0.3m - 0.6m)
└── Jika tidak ada yang pas, prioritas: pilih yang lebih renggang (menghindari mepet)

TAHAP 3: Penentuan Baris Sampling (Proteksi W/m² Minimum)
└── Mencari kelipatan LPB yang masuk rentang Min-Max
└── Prioritas: Tidak boleh kurang dari Batas Min Lampu (mencegah toko redup)

TAHAP 4: Koreksi Jarak Baris (JB)
└── Mengecek Jarak Baris = Panjang / (Baris + 1)
└── Prioritas: Jika > 1.9 m, WAJIB tambah 1 baris (mencegah area gelap di tengah)

TAHAP 5: Evaluasi Status Standar Kumulatif
└── Menggabungkan status 3 aspek (Rasio Watt, Jarak Samping, Jarak Baris)
"@
$pBox.Range.Text = $flowText
$pBox.Range.Font.Name = "Consolas"
$pBox.Range.Font.Size = 9.5
$pBox.Range.Font.Color = 0x1E293B
$pBox.Range.Shading.BackgroundPatternColor = 0xF8FAFC
$pBox.Range.InsertParagraphAfter()

# Section B
$pB = $doc.Paragraphs.Add()
$pB.Range.Text = "B. Apa yang Diprioritaskan di Tiap Keputusan?"
$pB.Range.Font.Name = "Calibri"
$pB.Range.Font.Size = 14
$pB.Range.Font.Bold = 1
$pB.Range.Font.Color = 0x8A3A1E
$pB.Range.InsertParagraphAfter()

$b1 = $doc.Paragraphs.Add()
$b1.Range.Text = "1. Prioritas Horizontal (Lebar Toko / Anti-Mepet): Sistem lebih memprioritaskan jarak lampu ke dinding samping agak renggang (> 0.6 m) daripada mepet (< 0.3 m) agar tidak terhalang rak dinding."
$b1.Range.Font.Name = "Calibri"
$b1.Range.Font.Size = 11
$b1.Range.InsertParagraphAfter()

$b2 = $doc.Paragraphs.Add()
$b2.Range.Text = "2. Prioritas Total Daya Listrik (Anti-Redup): Sistem memprioritaskan toko selalu cukup terang (0% kasus redup). Jika ada dimensi nanggung, sistem selalu memilih membulatkan ke atas (lebih terang)."
$b2.Range.Font.Name = "Calibri"
$b2.Range.Font.Size = 11
$b2.Range.InsertParagraphAfter()

$b3 = $doc.Paragraphs.Add()
$b3.Range.Text = "3. Prioritas Vertikal (Panjang Toko / Anti-Belang): Jarak antar baris dibatasi maksimal 1.9 m. Jika jarak baris melebihi 1.9 m, sistem wajib menambah 1 baris terlepas dari rasio W/m² akan naik sedikit."
$b3.Range.Font.Name = "Calibri"
$b3.Range.Font.Size = 11
$b3.Range.InsertParagraphAfter()

# Section C
$pC = $doc.Paragraphs.Add()
$pC.Range.Text = "C. Tabel Logika Keputusan Biner (Truth / Decision Table)"
$pC.Range.Font.Name = "Calibri"
$pC.Range.Font.Size = 14
$pC.Range.Font.Bold = 1
$pC.Range.Font.Color = 0x8A3A1E
$pC.Range.InsertParagraphAfter()

$pCDesc = $doc.Paragraphs.Add()
$pCDesc.Range.Text = "Keterangan Notasi Biner: Nilai 1 = True (Kondisi Terpenuhi), Nilai 0 = False (Tidak Terpenuhi), Tanda (-) = Don't Care (kondisi sebelumnya sudah terpenuhi)."
$pCDesc.Range.Font.Name = "Calibri"
$pCDesc.Range.Font.Size = 10
$pCDesc.Range.Font.Italic = 1
$pCDesc.Range.InsertParagraphAfter()

# Table 1: LPB
$pT1 = $doc.Paragraphs.Add()
$pT1.Range.Text = "1. Tabel Keputusan Pemilihan Lampu Per Baris (LPB)"
$pT1.Range.Font.Name = "Calibri"
$pT1.Range.Font.Size = 12
$pT1.Range.Font.Bold = 1
$pT1.Range.Font.Color = 0xEB6325
$pT1.Range.InsertParagraphAfter()

$table1Data = @(
    @("jsMin in [0.3, 0.6]", "jsMax in [0.3, 0.6]", "jsMin-1 in [0.3, 0.6]", "Keputusan LPB", "Alasan & Dampak Prioritas"),
    @("1", "-", "-", "lpbMin", "Prioritas 1: Samping ideal dengan jumlah lampu standar"),
    @("0", "1", "-", "lpbMax", "Prioritas 2: Samping ideal dengan lampu maksimal"),
    @("0", "0", "1", "lpbMin-1", "Prioritas 3: Samping ideal dengan lampu dikurangi 1"),
    @("0", "0", "0", "lpbMin-1", "Fallback: Tidak ada yang ideal, pilih lpbMin-1 agar lebih renggang (anti-mepet)")
)

$tbl1 = $doc.Tables.Add($doc.Paragraphs.Add().Range, 5, 5)
$tbl1.Borders.Enable = 1
for ($r = 0; $r -lt 5; $r++) {
    for ($c = 0; $c -lt 5; $c++) {
        $cell = $tbl1.Cell($r + 1, $c + 1)
        $cell.Range.Text = $table1Data[$r][$c]
        $cell.Range.Font.Name = "Calibri"
        $cell.Range.Font.Size = 9.5
        if ($r -eq 0) {
            $cell.Range.Font.Bold = 1
            $cell.Range.Font.Color = 0xFFFFFF
            $cell.Shading.BackgroundPatternColor = 0x8A3A1E # Navy
        }
    }
}
$doc.Paragraphs.Add().Range.InsertParagraphAfter()

# Table 2: Sampling
$pT2 = $doc.Paragraphs.Add()
$pT2.Range.Text = "2. Tabel Keputusan Jumlah Lampu Sampling (Proteksi Daya Minimal)"
$pT2.Range.Font.Name = "Calibri"
$pT2.Range.Font.Size = 12
$pT2.Range.Font.Bold = 1
$pT2.Range.Font.Color = 0xEB6325
$pT2.Range.InsertParagraphAfter()

$table2Data = @(
    @("Kondisi floorMax < LimitMin", "Keputusan Jumlah Lampu Sampling", "Dampak Prioritas"),
    @("1 (Dibulatkan ke bawah menjadi < min)", "Ceiling(LimitMin / LPB) * LPB", "Prioritas Anti-Redup: Menjamin W/m2 tidak pernah drop di bawah 4.0 W/m2"),
    @("0 (Dibulatkan ke bawah masih >= min)", "floorMax", "Hemat daya, tetap dalam rentang ideal 4.0 - 5.0 W/m2")
)

$tbl2 = $doc.Tables.Add($doc.Paragraphs.Add().Range, 3, 3)
$tbl2.Borders.Enable = 1
for ($r = 0; $r -lt 3; $r++) {
    for ($c = 0; $c -lt 3; $c++) {
        $cell = $tbl2.Cell($r + 1, $c + 1)
        $cell.Range.Text = $table2Data[$r][$c]
        $cell.Range.Font.Name = "Calibri"
        $cell.Range.Font.Size = 9.5
        if ($r -eq 0) {
            $cell.Range.Font.Bold = 1
            $cell.Range.Font.Color = 0xFFFFFF
            $cell.Shading.BackgroundPatternColor = 0x8A3A1E
        }
    }
}
$doc.Paragraphs.Add().Range.InsertParagraphAfter()

# Table 3: Koreksi Baris
$pT3 = $doc.Paragraphs.Add()
$pT3.Range.Text = "3. Tabel Keputusan Koreksi Jumlah Baris (Jarak Antar Baris)"
$pT3.Range.Font.Name = "Calibri"
$pT3.Range.Font.Size = 12
$pT3.Range.Font.Bold = 1
$pT3.Range.Font.Color = 0xEB6325
$pT3.Range.InsertParagraphAfter()

$table3Data = @(
    @("Kondisi Jarak Baris Sampling > 1.9 m", "Keputusan Jumlah Baris Akhir", "Dampak Prioritas"),
    @("1 (Jarak baris terlalu renggang > 1.9 m)", "Baris Sampling + 1", "Prioritas Anti-Belang: Tambah 1 baris agar cahaya merata"),
    @("0 (Jarak baris aman <= 1.9 m)", "Baris Sampling", "Jumlah baris tetap, jarak baris sudah memadai")
)

$tbl3 = $doc.Tables.Add($doc.Paragraphs.Add().Range, 3, 3)
$tbl3.Borders.Enable = 1
for ($r = 0; $r -lt 3; $r++) {
    for ($c = 0; $c -lt 3; $c++) {
        $cell = $tbl3.Cell($r + 1, $c + 1)
        $cell.Range.Text = $table3Data[$r][$c]
        $cell.Range.Font.Name = "Calibri"
        $cell.Range.Font.Size = 9.5
        if ($r -eq 0) {
            $cell.Range.Font.Bold = 1
            $cell.Range.Font.Color = 0xFFFFFF
            $cell.Shading.BackgroundPatternColor = 0x8A3A1E
        }
    }
}
$doc.Paragraphs.Add().Range.InsertParagraphAfter()

# Table 4: Kumulatif
$pT4 = $doc.Paragraphs.Add()
$pT4.Range.Text = "4. Tabel Keputusan Status Standar Kumulatif"
$pT4.Range.Font.Name = "Calibri"
$pT4.Range.Font.Size = 12
$pT4.Range.Font.Bold = 1
$pT4.Range.Font.Color = 0xEB6325
$pT4.Range.InsertParagraphAfter()

$table4Data = @(
    @("Rasio Daya [4.0, 5.0]", "Jarak Samping [0.3, 0.6]", "Jarak Baris <= 1.9", "Status Standar Kumulatif", "Keterangan Diagnosa"),
    @("1", "1", "1", "Standar Ideal", "Semua aspek memenuhi kriteria 100%"),
    @("1", "1", "0", "Standar Toleransi", "Baris Renggang (> 1.9 m)"),
    @("1", "0", "1", "Standar Toleransi", "Samping Renggang (> 0.6 m) atau Mepet (< 0.3 m)"),
    @("1", "0", "0", "Standar Toleransi", "Samping & Baris di luar target"),
    @("0", "1", "1", "Standar Toleransi", "Daya di luar target (Toleransi High / Low)"),
    @("0", "1", "0", "Standar Toleransi", "Daya & Baris di luar target"),
    @("0", "0", "1", "Standar Toleransi", "Daya & Samping di luar target"),
    @("0", "0", "0", "Standar Toleransi", "Seluruh aspek berada di luar target ideal")
)

$tbl4 = $doc.Tables.Add($doc.Paragraphs.Add().Range, 9, 5)
$tbl4.Borders.Enable = 1
for ($r = 0; $r -lt 9; $r++) {
    for ($c = 0; $c -lt 5; $c++) {
        $cell = $tbl4.Cell($r + 1, $c + 1)
        $cell.Range.Text = $table4Data[$r][$c]
        $cell.Range.Font.Name = "Calibri"
        $cell.Range.Font.Size = 9.5
        if ($r -eq 0) {
            $cell.Range.Font.Bold = 1
            $cell.Range.Font.Color = 0xFFFFFF
            $cell.Shading.BackgroundPatternColor = 0x8A3A1E
        }
    }
}
$doc.Paragraphs.Add().Range.InsertParagraphAfter()

# Section D
$pD = $doc.Paragraphs.Add()
$pD.Range.Text = "D. Kesimpulan Utama & Fakta Statistik Simulasi"
$pD.Range.Font.Name = "Calibri"
$pD.Range.Font.Size = 14
$pD.Range.Font.Bold = 1
$pD.Range.Font.Color = 0x8A3A1E
$pD.Range.InsertParagraphAfter()

$d1 = $doc.Paragraphs.Add()
$d1.Range.Text = "1. Prinsip 3 Anti Terbukti Efektif: Kalkulator berhasil mengeliminasi 0% kasus toko redup (< 4.0 W/m2) dan 0% kasus lampu mepet rak (< 0.3 m)."
$d1.Range.Font.Name = "Calibri"
$d1.Range.Font.Size = 11
$d1.Range.InsertParagraphAfter()

$d2 = $doc.Paragraphs.Add()
$d2.Range.Text = "2. Fakta 40.401 Sampel Ruangan: Sebanyak 84.03% ruangan secara alami sudah berada di rentang Jarak Baris ideal 1.6 m s/d 1.9 m. Hanya 14.93% yang berjarak < 1.6 m pada toko kecil untuk melindungi tingkat terang ruangan."
$d2.Range.Font.Name = "Calibri"
$d2.Range.Font.Size = 11
$d2.Range.InsertParagraphAfter()

$d3 = $doc.Paragraphs.Add()
$d3.Range.Text = "3. Wacana Batas Bawah (1.6 m): Jika di masa depan batas bawah 1.6 m diterapkan dengan hirarki deviasi (W/m2 > JS > JB), maka 84% hasil hitungan dan visual denah tidak akan berubah sama sekali."
$d3.Range.Font.Name = "Calibri"
$d3.Range.Font.Size = 11
$d3.Range.InsertParagraphAfter()

# Save via Word COM (Format: 16 = wdFormatXMLDocument / DOCX)
$doc.SaveAs2($outDocx, 16)
$doc.Close()
$word.Quit()

[System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null

Write-Host "SUKSES! Dokumen Word asli dibuat oleh Microsoft Word di: $outDocx"
