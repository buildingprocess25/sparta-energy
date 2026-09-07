Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$LAMP_WATT = 13.5
$LAMP_LEN = 1.22
$ci = [System.Globalization.CultureInfo]::InvariantCulture

function Calc-Simetris {
    param(
        [double]$lebar,
        [double]$panjang,
        [double]$areaSales
    )

    $limitMaxLamps = [Math]::Ceiling((5.0 * $areaSales) / $LAMP_WATT)
    $limitMinLamps = [Math]::Ceiling((4.0 * $areaSales) / $LAMP_WATT)

    $lpbMax = [Math]::Ceiling($lebar / $LAMP_LEN)
    $lpbMin = [Math]::Floor($lebar / $LAMP_LEN)
    $lpbM1 = [Math]::Max(1, $lpbMin - 1)

    $jsMax = ($lebar - $lpbMax * $LAMP_LEN) / 2.0
    $jsMin = ($lebar - $lpbMin * $LAMP_LEN) / 2.0
    $jsM1 = ($lebar - $lpbM1 * $LAMP_LEN) / 2.0

    $lpb = $lpbM1
    $jarakSamping = $jsM1

    if ($jsMin -ge 0.3 -and $jsMin -le 0.6) {
        $lpb = $lpbMin
        $jarakSamping = $jsMin
    } elseif ($jsMax -ge 0.3 -and $jsMax -le 0.6) {
        $lpb = $lpbMax
        $jarakSamping = $jsMax
    } elseif ($jsM1 -ge 0.3 -and $jsM1 -le 0.6) {
        $lpb = $lpbM1
        $jarakSamping = $jsM1
    }

    $floorMax = [Math]::Floor($limitMaxLamps / $lpb) * $lpb
    $ceilMin = [Math]::Ceiling($limitMinLamps / $lpb) * $lpb
    $jumlahLampuSampling = if ($floorMax -lt $limitMinLamps) { $ceilMin } else { $floorMax }

    $C33 = [Math]::Max(1, [Math]::Round($jumlahLampuSampling / $lpb))
    $C34 = $panjang / ($C33 + 1.0)
    $baris = if ($C34 -gt 1.9) { $C33 + 1 } else { $C33 }

    $total = $baris * $lpb
    $jarakPerbaris = $panjang / ($baris + 1.0)
    $rasio = [Math]::Round(($total * $LAMP_WATT) / $areaSales, 2)

    return [PSCustomObject]@{
        Baris = $baris
        LampuPerBaris = $lpb
        Total = $total
        JarakPerbaris = $jarakPerbaris
        JarakSamping = $jarakSamping
        Rasio = $rasio
        MinLamps = $limitMinLamps
        MaxLamps = $limitMaxLamps
    }
}

function Evaluate-DetailedStatus {
    param(
        [double]$rasio,
        [double]$jarakSamping,
        [double]$jarakBaris,
        [int]$totalLampu,
        [int]$minLamps,
        [int]$maxLamps
    )

    $issues = [System.Collections.Generic.List[string]]::new()
    $inv = [System.Globalization.CultureInfo]::InvariantCulture

    # 1. Aspek Rasio Daya
    $statusRasio = "Ideal"
    if ($rasio -gt 5.0) {
        $statusRasio = "Toleransi (High)"
        $lampOver = $totalLampu - $maxLamps
        $wattOver = ($rasio - 5.0).ToString("0.00", $inv)
        if ($lampOver -gt 0) {
            $issues.Add("Over +$lampOver Lampu (+$wattOver W/m²)")
        } else {
            $issues.Add("Over Watt (+$wattOver W/m²)")
        }
    } elseif ($rasio -lt 4.0) {
        $statusRasio = "Toleransi (Low)"
        $lampUnder = $minLamps - $totalLampu
        $wattUnder = (4.0 - $rasio).ToString("0.00", $inv)
        if ($lampUnder -gt 0) {
            $issues.Add("Kurang -$lampUnder Lampu (-$wattUnder W/m²)")
        } else {
            $issues.Add("Kurang Watt (-$wattUnder W/m²)")
        }
    }

    # 2. Aspek Jarak Samping
    $statusSamping = "Ideal"
    if ($jarakSamping -lt 0.3) {
        $statusSamping = "Toleransi (Mepet)"
        $issues.Add("Samping Mepet ($($jarakSamping.ToString('0.00', $inv))m < 0.3m)")
    } elseif ($jarakSamping -gt 0.6) {
        $statusSamping = "Toleransi (Renggang)"
        $issues.Add("Samping Renggang ($($jarakSamping.ToString('0.00', $inv))m > 0.6m)")
    }

    # 3. Aspek Jarak Antar Baris
    $statusBaris = "Ideal"
    if ($jarakBaris -gt 1.9) {
        $statusBaris = "Toleransi (Lebar)"
        $issues.Add("Baris Renggang ($($jarakBaris.ToString('0.00', $inv))m > 1.9m)")
    }

    # 4. Status Standar Kumulatif
    $isIdeal = ($statusRasio -eq "Ideal" -and $statusSamping -eq "Ideal" -and $statusBaris -eq "Ideal")
    $statusKumulatif = if ($isIdeal) { "Standar Ideal" } else { "Standar Toleransi" }

    $detail = if ($issues.Count -gt 0) { [string]::Join(" | ", $issues) } else { "Sesuai Standar Target" }

    return [PSCustomObject]@{
        StatusRasio = $statusRasio
        StatusSamping = $statusSamping
        StatusBaris = $statusBaris
        StatusKumulatif = $statusKumulatif
        Detail = $detail
    }
}

function Escape-Xml([string]$str) {
    if ([string]::IsNullOrEmpty($str)) { return "" }
    return $str.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&apos;")
}

Write-Host "Mempersiapkan Excel Workbook Multi-Sheet..."

$totalCount = 0
$cRasioIdeal = 0
$cRasioLow = 0
$cRasioHigh = 0

$cSampingIdeal = 0
$cSampingMepet = 0
$cSampingRenggang = 0

$cBarisIdeal = 0
$cBarisLebar = 0

$cKumulatifIdeal = 0
$cKumulatifToleransi = 0

# Bangun Sheet 2 XML (Data Lengkap)
$sheet2Sb = [System.Text.StringBuilder]::new(50000000)
[void]$sheet2Sb.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
[void]$sheet2Sb.Append('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">')
[void]$sheet2Sb.Append('<sheetData>')

# Header Row
$headers = @(
    "Lebar (m)", "Panjang (m)", "Luas Area (m2)",
    "Batas Min Lampu", "Batas Max Lampu", "Batas Min Watt", "Batas Max Watt",
    "Lampu Per Baris", "Jumlah Baris", "Total Lampu Rekomendasi",
    "Total Watt Aktual", "Aktual (W/m2)", "Jarak Samping (m)", "Jarak Antar Baris (m)",
    "Status Rasio Watt", "Status Jarak Samping", "Status Jarak Baris",
    "Status Standar Komulatif", "Keterangan Diagnosa"
)

[void]$sheet2Sb.Append('<row r="1">')
for ($h = 0; $h -lt $headers.Count; $h++) {
    $val = Escape-Xml $headers[$h]
    [void]$sheet2Sb.Append("<c t=`"inlineStr`" s=`"1`"><is><t>$val</t></is></c>")
}
[void]$sheet2Sb.Append('</row>')

$rowIdx = 2
for ($l = 50; $l -le 250; $l++) {
    $lebar = $l / 10.0
    for ($p = 50; $p -le 250; $p++) {
        $panjang = $p / 10.0
        $area = [Math]::Round($lebar * $panjang, 2)

        $sim = Calc-Simetris -lebar $lebar -panjang $panjang -areaSales $area
        $totalWatt = [Math]::Round($sim.Total * $LAMP_WATT, 2)
        $minWatt = [Math]::Round($sim.MinLamps * $LAMP_WATT, 2)
        $maxWatt = [Math]::Round($sim.MaxLamps * $LAMP_WATT, 2)

        $eval = Evaluate-DetailedStatus -rasio $sim.Rasio -jarakSamping $sim.JarakSamping -jarakBaris $sim.JarakPerbaris -totalLampu $sim.Total -minLamps $sim.MinLamps -maxLamps $sim.MaxLamps

        $totalCount++

        if ($eval.StatusRasio -eq "Ideal") { $cRasioIdeal++ }
        elseif ($eval.StatusRasio -eq "Toleransi (Low)") { $cRasioLow++ }
        else { $cRasioHigh++ }

        if ($eval.StatusSamping -eq "Ideal") { $cSampingIdeal++ }
        elseif ($eval.StatusSamping -eq "Toleransi (Mepet)") { $cSampingMepet++ }
        else { $cSampingRenggang++ }

        if ($eval.StatusBaris -eq "Ideal") { $cBarisIdeal++ }
        else { $cBarisLebar++ }

        if ($eval.StatusKumulatif -eq "Standar Ideal") { $cKumulatifIdeal++ }
        else { $cKumulatifToleransi++ }

        [void]$sheet2Sb.Append("<row r=`"$rowIdx`">")
        [void]$sheet2Sb.Append("<c><v>$($lebar.ToString('0.0', $ci))</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($panjang.ToString('0.0', $ci))</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($area.ToString('0.00', $ci))</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($sim.MinLamps)</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($sim.MaxLamps)</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($minWatt.ToString('0.00', $ci))</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($maxWatt.ToString('0.00', $ci))</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($sim.LampuPerBaris)</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($sim.Baris)</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($sim.Total)</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($totalWatt.ToString('0.00', $ci))</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($sim.Rasio.ToString('0.00', $ci))</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($sim.JarakSamping.ToString('0.00', $ci))</v></c>")
        [void]$sheet2Sb.Append("<c><v>$($sim.JarakPerbaris.ToString('0.00', $ci))</v></c>")
        [void]$sheet2Sb.Append("<c t=`"inlineStr`"><is><t>$(Escape-Xml $eval.StatusRasio)</t></is></c>")
        [void]$sheet2Sb.Append("<c t=`"inlineStr`"><is><t>$(Escape-Xml $eval.StatusSamping)</t></is></c>")
        [void]$sheet2Sb.Append("<c t=`"inlineStr`"><is><t>$(Escape-Xml $eval.StatusBaris)</t></is></c>")
        [void]$sheet2Sb.Append("<c t=`"inlineStr`"><is><t>$(Escape-Xml $eval.StatusKumulatif)</t></is></c>")
        [void]$sheet2Sb.Append("<c t=`"inlineStr`"><is><t>$(Escape-Xml $eval.Detail)</t></is></c>")
        [void]$sheet2Sb.Append('</row>')

        $rowIdx++
    }
}

[void]$sheet2Sb.Append('</sheetData></worksheet>')

# Hitung Persentase
$pctRasioIdeal = ($cRasioIdeal / $totalCount) * 100.0
$pctRasioLow = ($cRasioLow / $totalCount) * 100.0
$pctRasioHigh = ($cRasioHigh / $totalCount) * 100.0

$pctSampingIdeal = ($cSampingIdeal / $totalCount) * 100.0
$pctSampingMepet = ($cSampingMepet / $totalCount) * 100.0
$pctSampingRenggang = ($cSampingRenggang / $totalCount) * 100.0

$pctBarisIdeal = ($cBarisIdeal / $totalCount) * 100.0
$pctBarisLebar = ($cBarisLebar / $totalCount) * 100.0

$pctKumulatifIdeal = ($cKumulatifIdeal / $totalCount) * 100.0
$pctKumulatifToleransi = ($cKumulatifToleransi / $totalCount) * 100.0

# Bangun Sheet 1 XML (Ringkasan Analisis)
$sheet1Rows = @(
    @("Kategori Analisis", "Kriteria / Status Aspek", "Jumlah Sampel", "Persentase (%)"),
    @("Parameter Ruang", "Rentang Dimensi (5.0m - 25.0m step 0.1m)", "$totalCount", "100.00%"),
    @("Parameter Ruang", "Rentang Luas Area (25.00 m² - 625.00 m²)", "$totalCount", "100.00%"),
    @("Spesifikasi Lampu", "LED Tube 13.5 Watt / 1.22 meter", "$totalCount", "100.00%"),
    @("", "", "", ""),
    @("1. Aspek Rasio Daya Listrik", "Ideal (4.00 - 5.00 W/m²)", "$cRasioIdeal", "$($pctRasioIdeal.ToString('0.00', $ci))%"),
    @("1. Aspek Rasio Daya Listrik", "Toleransi Low (< 4.00 W/m²)", "$cRasioLow", "$($pctRasioLow.ToString('0.00', $ci))%"),
    @("1. Aspek Rasio Daya Listrik", "Toleransi High (> 5.00 W/m²)", "$cRasioHigh", "$($pctRasioHigh.ToString('0.00', $ci))%"),
    @("", "", "", ""),
    @("2. Aspek Jarak Samping (JS)", "Ideal (0.30m - 0.60m)", "$cSampingIdeal", "$($pctSampingIdeal.ToString('0.00', $ci))%"),
    @("2. Aspek Jarak Samping (JS)", "Toleransi Mepet (< 0.30m)", "$cSampingMepet", "$($pctSampingMepet.ToString('0.00', $ci))%"),
    @("2. Aspek Jarak Samping (JS)", "Toleransi Renggang (> 0.60m)", "$cSampingRenggang", "$($pctSampingRenggang.ToString('0.00', $ci))%"),
    @("", "", "", ""),
    @("3. Aspek Jarak Antar Baris (JB)", "Ideal (<= 1.90m)", "$cBarisIdeal", "$($pctBarisIdeal.ToString('0.00', $ci))%"),
    @("3. Aspek Jarak Antar Baris (JB)", "Toleransi Lebar (> 1.90m)", "$cBarisLebar", "$($pctBarisLebar.ToString('0.00', $ci))%"),
    @("", "", "", ""),
    @("4. Status Standar Komulatif", "Standar Ideal (Semua 3 Aspek Lolos)", "$cKumulatifIdeal", "$($pctKumulatifIdeal.ToString('0.00', $ci))%"),
    @("4. Status Standar Komulatif", "Standar Toleransi (Ada Aspek di Luar Ideal)", "$cKumulatifToleransi", "$($pctKumulatifToleransi.ToString('0.00', $ci))%")
)

$sheet1Sb = [System.Text.StringBuilder]::new(10000)
[void]$sheet1Sb.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
[void]$sheet1Sb.Append('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">')
[void]$sheet1Sb.Append('<sheetData>')

for ($r = 0; $r -lt $sheet1Rows.Count; $r++) {
    $rowNum = $r + 1
    [void]$sheet1Sb.Append("<row r=`"$rowNum`">")
    $cols = $sheet1Rows[$r]
    for ($c = 0; $c -lt $cols.Count; $c++) {
        $val = Escape-Xml $cols[$c]
        $isHeader = ($r -eq 0)
        if ($isHeader) {
            [void]$sheet1Sb.Append("<c t=`"inlineStr`" s=`"1`"><is><t>$val</t></is></c>")
        } else {
            [void]$sheet1Sb.Append("<c t=`"inlineStr`"><is><t>$val</t></is></c>")
        }
    }
    [void]$sheet1Sb.Append('</row>')
}
[void]$sheet1Sb.Append('</sheetData></worksheet>')

# Standard OpenXML Files
$contentTypesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>'

$rootRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>'

$workbookXmlRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'

$workbookXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Ringkasan Analisis" sheetId="1" r:id="rId1"/>
    <sheet name="Data Simulasi Lengkap" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>'

$stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>'

# Simpan ke ZIP (XLSX)
$outXlsxPath = Join-Path (Get-Location) "Simulasi_Kalkulator_Lampu_v1.1.0.xlsx"
if (Test-Path $outXlsxPath) { Remove-Item $outXlsxPath -Force }

$zip = [System.IO.Compression.ZipFile]::Open($outXlsxPath, [System.IO.Compression.ZipArchiveMode]::Create)

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
Add-ZipEntry $zip "xl/_rels/workbook.xml.rels" $workbookXmlRels
Add-ZipEntry $zip "xl/workbook.xml" $workbookXml
Add-ZipEntry $zip "xl/styles.xml" $stylesXml
Add-ZipEntry $zip "xl/worksheets/sheet1.xml" $sheet1Sb.ToString()
Add-ZipEntry $zip "xl/worksheets/sheet2.xml" $sheet2Sb.ToString()

$zip.Dispose()

Write-Host "Berhasil membuat file Excel 2 Sheets di: $outXlsxPath"
