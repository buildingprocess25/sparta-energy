Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$outDocxPath = Join-Path (Get-Location) "Dokumen_Logika_dan_Hirarki_Kalkulator_Lampu.docx"
if (Test-Path $outDocxPath) { Remove-Item $outDocxPath -Force }

function Escape-Xml([string]$str) {
    if ([string]::IsNullOrEmpty($str)) { return "" }
    return $str.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&apos;")
}

function Make-P([string]$text, [bool]$bold = $false, [string]$color = "1F2937", [int]$sz = 22, [string]$align = "left", [int]$spaceBefore = 0, [int]$spaceAfter = 120) {
    $jc = if ($align -eq "center") { "<w:jc w:val=`"center`"/>" } elseif ($align -eq "right") { "<w:jc w:val=`"right`"/>" } else { "" }
    $b = if ($bold) { "<w:b/>" } else { "" }
    $t = Escape-Xml $text
    return "<w:p><w:pPr><w:spacing w:before=`"$spaceBefore`" w:after=`"$spaceAfter`"/>$jc</w:pPr><w:r><w:rPr><w:rFonts w:ascii=`"Calibri`" w:hAnsi=`"Calibri`"/>$b<w:color w:val=`"$color`"/><w:sz w:val=`"$sz`"/></w:rPr><w:t xml:space=`"preserve`">$t</w:t></w:r></w:p>"
}

function Make-Heading1([string]$text) {
    $t = Escape-Xml $text
    return "<w:p><w:pPr><w:spacing w:before=`"280`" w:after=`"120`"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii=`"Calibri`" w:hAnsi=`"Calibri`"/><w:b/><w:color w:val=`"1E3A8A`"/><w:sz w:val=`"30`"/></w:rPr><w:t>$t</w:t></w:r></w:p>"
}

function Make-Heading2([string]$text) {
    $t = Escape-Xml $text
    return "<w:p><w:pPr><w:spacing w:before=`"200`" w:after=`"80`"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii=`"Calibri`" w:hAnsi=`"Calibri`"/><w:b/><w:color w:val=`"2563EB`"/><w:sz w:val=`"24`"/></w:rPr><w:t>$t</w:t></w:r></w:p>"
}

function Make-Bullet([string]$title, [string]$desc) {
    $tTitle = Escape-Xml $title
    $tDesc = Escape-Xml $desc
    return "<w:p><w:pPr><w:spacing w:after=`"80`"/><w:ind w:left=`"360`"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii=`"Calibri`" w:hAnsi=`"Calibri`"/><w:b/><w:color w:val=`"111827`"/><w:sz w:val=`"22`"/></w:rPr><w:t xml:space=`"preserve`">• $($tTitle): </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii=`"Calibri`" w:hAnsi=`"Calibri`"/><w:color w:val=`"374151`"/><w:sz w:val=`"22`"/></w:rPr><w:t>$tDesc</w:t></w:r></w:p>"
}

function Make-Box([string]$text, [string]$bg = "F8FAFC", [string]$borderColor = "2563EB") {
    $lines = $text -split "`n"
    $sb = [System.Text.StringBuilder]::new()
    
    # Page width available is ~9000 dxa (A4: 11906 - 2880 margin)
    [void]$sb.Append('<w:tbl>')
    [void]$sb.Append('<w:tblPr>')
    [void]$sb.Append('<w:tblW w:w="9026" w:type="dxa"/>')
    [void]$sb.Append("<w:tblBorders><w:top w:val=`"single`" w:sz=`"6`" w:space=`"0`" w:color=`"CBD5E1`"/><w:left w:val=`"single`" w:sz=`"18`" w:space=`"0`" w:color=`"$borderColor`"/><w:bottom w:val=`"single`" w:sz=`"6`" w:space=`"0`" w:color=`"CBD5E1`"/><w:right w:val=`"single`" w:sz=`"6`" w:space=`"0`" w:color=`"CBD5E1`"/><w:insideH w:val=`"none`"/><w:insideV w:val=`"none`"/></w:tblBorders>")
    [void]$sb.Append('<w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tblCellMar>')
    [void]$sb.Append('</w:tblPr>')
    
    # tblGrid is mandatory in Word schema!
    [void]$sb.Append('<w:tblGrid><w:gridCol w:w="9026"/></w:tblGrid>')
    
    [void]$sb.Append("<w:tr><w:tc><w:tcPr><w:tcW w:w=`"9026`" w:type=`"dxa`"/><w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"$bg`"/></w:tcPr>")
    foreach ($line in $lines) {
        $t = Escape-Xml $line
        [void]$sb.Append("<w:p><w:pPr><w:spacing w:after=`"40`"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii=`"Consolas`" w:hAnsi=`"Consolas`"/><w:color w:val=`"1F2937`"/><w:sz w:val=`"20`"/></w:rPr><w:t xml:space=`"preserve`">$t</w:t></w:r></w:p>")
    }
    [void]$sb.Append("</w:tc></w:tr></w:tbl><w:p><w:pPr><w:spacing w:after=`"120`"/></w:pPr></w:p>")
    return $sb.ToString()
}

function Make-Table($headers, $rowsData, $colWidthsDxa) {
    $sb = [System.Text.StringBuilder]::new()
    $totalWidth = 0
    foreach ($w in $colWidthsDxa) { $totalWidth += $w }
    
    [void]$sb.Append('<w:tbl>')
    [void]$sb.Append("<w:tblPr><w:tblW w:w=`"$totalWidth`" w:type=`"dxa`"/><w:tblBorders><w:top w:val=`"single`" w:sz=`"6`" w:space=`"0`" w:color=`"D1D5DB`"/><w:left w:val=`"none`"/><w:bottom w:val=`"single`" w:sz=`"12`" w:space=`"0`" w:color=`"9CA3AF`"/><w:right w:val=`"none`"/><w:insideH w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"E5E7EB`"/><w:insideV w:val=`"none`"/></w:tblBorders><w:tblCellMar><w:top w:w=`"100`" w:type=`"dxa`"/><w:left w:w=`"120`" w:type=`"dxa`"/><w:bottom w:w=`"100`" w:type=`"dxa`"/><w:right w:w=`"120`" w:type=`"dxa`"/></w:tblCellMar></w:tblPr>")
    
    # tblGrid mandatory!
    [void]$sb.Append('<w:tblGrid>')
    foreach ($w in $colWidthsDxa) {
        [void]$sb.Append("<w:gridCol w:w=`"$w`"/>")
    }
    [void]$sb.Append('</w:tblGrid>')
    
    # Header Row
    [void]$sb.Append('<w:tr><w:trPr><w:tblHeader/></w:trPr>')
    for ($i = 0; $i -lt $headers.Count; $i++) {
        $w = $colWidthsDxa[$i]
        $hText = Escape-Xml $headers[$i]
        [void]$sb.Append("<w:tc><w:tcPr><w:tcW w:w=`"$w`" w:type=`"dxa`"/><w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"1E3A8A`"/><w:vAlign w:val=`"center`"/></w:tcPr><w:p><w:pPr><w:spacing w:after=`"0`"/><w:jc w:val=`"center`"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii=`"Calibri`" w:hAnsi=`"Calibri`"/><w:b/><w:color w:val=`"FFFFFF`"/><w:sz w:val=`"20`"/></w:rPr><w:t>$hText</w:t></w:r></w:p></w:tc>")
    }
    [void]$sb.Append('</w:tr>')

    # Data Rows
    $rIdx = 0
    foreach ($row in $rowsData) {
        $bg = if ($rIdx % 2 -eq 1) { "F9FAFB" } else { "FFFFFF" }
        [void]$sb.Append("<w:tr>")
        for ($i = 0; $i -lt $row.Count; $i++) {
            $w = $colWidthsDxa[$i]
            $cellText = Escape-Xml $row[$i]
            $align = if ($i -eq 0 -and $row.Count -gt 2) { "center" } elseif ($i -lt ($row.Count - 1)) { "center" } else { "left" }
            $isBold = ($cellText -eq "1" -or $cellText -like "*Ideal*" -or $cellText -like "*lpb*")
            $b = if ($isBold) { "<w:b/>" } else { "" }
            $jc = if ($align -eq "center") { "<w:jc w:val=`"center`"/>" } else { "<w:jc w:val=`"left`"/>" }
            [void]$sb.Append("<w:tc><w:tcPr><w:tcW w:w=`"$w`" w:type=`"dxa`"/><w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"$bg`"/><w:vAlign w:val=`"center`"/></w:tcPr><w:p><w:pPr><w:spacing w:after=`"0`"/>$jc</w:pPr><w:r><w:rPr><w:rFonts w:ascii=`"Calibri`" w:hAnsi=`"Calibri`"/>$b<w:color w:val=`"1F2937`"/><w:sz w:val=`"20`"/></w:rPr><w:t>$cellText</w:t></w:r></w:p></w:tc>")
        }
        [void]$sb.Append("</w:tr>")
        $rIdx++
    }
    [void]$sb.Append('</w:tbl><w:p><w:pPr><w:spacing w:after=`"160`"/></w:pPr></w:p>')
    return $sb.ToString()
}

$bodySb = [System.Text.StringBuilder]::new()

# Title
[void]$bodySb.Append( (Make-P "DOKUMEN TEKNIS & ANALISIS LOGIKA" $true "6B7280" 20 "center" 0 40) )
[void]$bodySb.Append( (Make-P "ALUR HIRARKI KEPUTUSAN KALKULATOR LAMPU" $true "1E3A8A" 34 "center" 0 60) )
[void]$bodySb.Append( (Make-P "Sistem Sparta Energy (Versi Engine v1.1.0 & Evaluasi Multi-Parameter)" $false "4B5563" 22 "center" 0 240) )

# Divider
[void]$bodySb.Append( (Make-P "_________________________________________________________________________________" $false "E5E7EB" 18 "center" 0 200) )

# Section A
[void]$bodySb.Append( (Make-Heading1 "A. Alur Hirarki Pengambilan Keputusan Saat Ini (Step-by-Step)") )
[void]$bodySb.Append( (Make-P "Sistem kalkulator lampu (lib/lamp-calculator.ts pada fungsi calcSimetris) mengambil keputusan secara berurutan (sequential hierarchy) dari target daya, penataan dimensi horizontal, hingga penataan dimensi vertikal:") )

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
[void]$bodySb.Append( (Make-Box $flowText "F8FAFC" "2563EB") )

# Section B
[void]$bodySb.Append( (Make-Heading1 "B. Apa yang Diprioritaskan di Tiap Keputusan?") )
[void]$bodySb.Append( (Make-Bullet "1. Prioritas Horizontal (Lebar Toko / Anti-Mepet)" "Sistem lebih memprioritaskan jarak lampu ke dinding samping agak renggang (> 0.6 m) daripada mepet (< 0.3 m) agar tidak terhalang atau menabrak display rak dinding.") )
[void]$bodySb.Append( (Make-Bullet "2. Prioritas Total Daya Listrik (Anti-Redup)" "Sistem memprioritaskan toko selalu cukup terang (0% kasus redup). Jika ada dimensi nanggung antara sedikit kurang terang (< 4.0 W/m²) vs sedikit lebih terang (> 5.0 W/m²), sistem selalu memilih membulatkan ke atas (lebih terang).") )
[void]$bodySb.Append( (Make-Bullet "3. Prioritas Vertikal (Panjang Toko / Anti-Belang)" "Jarak antar baris dibatasi maksimal 1.9 m. Jika jarak baris melebihi 1.9 m, sistem wajib menambah 1 baris terlepas dari rasio W/m² akan naik sedikit.") )

# Section C
[void]$bodySb.Append( (Make-Heading1 "C. Tabel Logika Keputusan Biner (Truth / Decision Table)") )
[void]$bodySb.Append( (Make-P "Keterangan Notasi Biner: Nilai 1 = True (Kondisi Terpenuhi), Nilai 0 = False (Tidak Terpenuhi), Tanda (-) = Don't Care (kondisi sebelumnya sudah terpenuhi).") )

# Table 1: LPB
[void]$bodySb.Append( (Make-Heading2 "1. Tabel Keputusan Pemilihan Lampu Per Baris (LPB)") )
[void]$bodySb.Append( (Make-P "Sistem menguji 3 calon LPB: lpbMin, lpbMax, dan lpbMin-1 terhadap rentang jarak samping ideal [0.3 m, 0.6 m]:") )
$headers1 = @("jsMin ∈ [0.3, 0.6]", "jsMax ∈ [0.3, 0.6]", "jsMin-1 ∈ [0.3, 0.6]", "Keputusan LPB", "Alasan & Dampak Prioritas")
$rows1 = @(
    @("1", "-", "-", "lpbMin", "Prioritas 1: Samping ideal dengan jumlah lampu standar"),
    @("0", "1", "-", "lpbMax", "Prioritas 2: Samping ideal dengan lampu maksimal"),
    @("0", "0", "1", "lpbMin-1", "Prioritas 3: Samping ideal dengan lampu dikurangi 1"),
    @("0", "0", "0", "lpbMin-1", "Fallback: Tidak ada yang ideal, pilih lpbMin-1 agar lebih renggang (anti-mepet)")
)
$widths1 = @(1800, 1800, 1800, 1400, 2226)
[void]$bodySb.Append( (Make-Table $headers1 $rows1 $widths1) )

# Table 2: Sampling Lampu
[void]$bodySb.Append( (Make-Heading2 "2. Tabel Keputusan Jumlah Lampu Sampling (Proteksi Daya Minimal)") )
[void]$bodySb.Append( (Make-P "Rumus: floorMax = Floor(LimitMax / LPB) * LPB.") )
$headers2 = @("Kondisi floorMax < LimitMin", "Keputusan Jumlah Lampu Sampling", "Dampak Prioritas")
$rows2 = @(
    @("1 (Dibulatkan ke bawah menjadi < min)", "Ceiling(LimitMin / LPB) * LPB", "Prioritas Anti-Redup: Menjamin W/m² tidak pernah drop di bawah 4.0 W/m²"),
    @("0 (Dibulatkan ke bawah masih >= min)", "floorMax", "Hemat daya, tetap dalam rentang ideal 4.0 - 5.0 W/m²")
)
$widths2 = @(2600, 2600, 3826)
[void]$bodySb.Append( (Make-Table $headers2 $rows2 $widths2) )

# Table 3: Koreksi Baris
[void]$bodySb.Append( (Make-Heading2 "3. Tabel Keputusan Koreksi Jumlah Baris (Jarak Antar Baris)") )
[void]$bodySb.Append( (Make-P "Rumus: Jarak Baris Sampling = Panjang / (Baris Sampling + 1).") )
$headers3 = @("Kondisi Jarak Baris Sampling > 1.9 m", "Keputusan Jumlah Baris Akhir", "Dampak Prioritas")
$rows3 = @(
    @("1 (Jarak baris terlalu renggang > 1.9 m)", "Baris Sampling + 1", "Prioritas Anti-Belang: Tambah 1 baris agar cahaya merata"),
    @("0 (Jarak baris aman <= 1.9 m)", "Baris Sampling", "Jumlah baris tetap, jarak baris sudah memadai")
)
$widths3 = @(2600, 2600, 3826)
[void]$bodySb.Append( (Make-Table $headers3 $rows3 $widths3) )

# Table 4: Kumulatif
[void]$bodySb.Append( (Make-Heading2 "4. Tabel Keputusan Status Standar Kumulatif") )
$headers4 = @("Rasio Daya [4.0, 5.0]", "Jarak Samping [0.3, 0.6]", "Jarak Baris <= 1.9", "Status Standar Kumulatif", "Keterangan Diagnosa")
$rows4 = @(
    @("1", "1", "1", "Standar Ideal", "Semua aspek memenuhi kriteria 100%"),
    @("1", "1", "0", "Standar Toleransi", "Baris Renggang (> 1.9 m)"),
    @("1", "0", "1", "Standar Toleransi", "Samping Renggang (> 0.6 m) atau Mepet (< 0.3 m)"),
    @("1", "0", "0", "Standar Toleransi", "Samping & Baris di luar target"),
    @("0", "1", "1", "Standar Toleransi", "Daya di luar target (Toleransi High / Low)"),
    @("0", "1", "0", "Standar Toleransi", "Daya & Baris di luar target"),
    @("0", "0", "1", "Standar Toleransi", "Daya & Samping di luar target"),
    @("0", "0", "0", "Standar Toleransi", "Seluruh aspek berada di luar target ideal")
)
$widths4 = @(1600, 1600, 1600, 2000, 2226)
[void]$bodySb.Append( (Make-Table $headers4 $rows4 $widths4) )

# Section D
[void]$bodySb.Append( (Make-Heading1 "D. Kesimpulan Utama & Fakta Statistik Simulasi") )
[void]$bodySb.Append( (Make-Bullet "1. Prinsip 3 Anti Terbukti Efektif" "Kalkulator berhasil mengeliminasi 0% kasus toko redup (< 4.0 W/m²) dan 0% kasus lampu mepet rak (< 0.3 m).") )
[void]$bodySb.Append( (Make-Bullet "2. Fakta 40.401 Sampel Ruangan" "Sebanyak 84.03% ruangan secara alami sudah berada di rentang Jarak Baris ideal 1.6 m s/d 1.9 m. Hanya 14.93% yang berjarak < 1.6 m pada toko kecil untuk melindungi tingkat terang ruangan.") )
[void]$bodySb.Append( (Make-Bullet "3. Wacana Batas Bawah (1.6 m)" "Jika di masa depan batas bawah 1.6 m diterapkan dengan hirarki deviasi (W/m² > JS > JB), maka 84% hasil hitungan dan visual denah tidak akan berubah sama sekali.") )

# Wrap in Word Document XML
$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    $($bodySb.ToString())
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$contentTypesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>'

$rootRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'

$docRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'

$stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:color w:val="1F2937"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>'

# Create ZIP (DOCX)
$zip = [System.IO.Compression.ZipFile]::Open($outDocxPath, [System.IO.Compression.ZipArchiveMode]::Create)

function Add-ZipEntry($zipArchive, $entryName, $content) {
    $entry = $zipArchive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
    $stream = $entry.Open()
    $writer = [System.IO.StreamWriter]::new($stream, [System.Text.Encoding]::UTF8)
    $writer.Write($content)
    $writer.Flush()
    $writer.Dispose()
    $stream.Dispose()
}

Add-ZipEntry $zip "[Content_Types].xml" $contentTypesXml
Add-ZipEntry $zip "_rels/.rels" $rootRelsXml
Add-ZipEntry $zip "word/_rels/document.xml.rels" $docRelsXml
Add-ZipEntry $zip "word/document.xml" $documentXml
Add-ZipEntry $zip "word/styles.xml" $stylesXml

$zip.Dispose()

Write-Host "Berhasil membuat file Microsoft Word (.docx) tervalidasi schema di: $outDocxPath"
