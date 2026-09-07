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
            $issues.Add("Over +$lampOver Lampu (+$wattOver W/m2)")
        } else {
            $issues.Add("Over Watt (+$wattOver W/m2)")
        }
    } elseif ($rasio -lt 4.0) {
        $statusRasio = "Toleransi (Low)"
        $lampUnder = $minLamps - $totalLampu
        $wattUnder = (4.0 - $rasio).ToString("0.00", $inv)
        if ($lampUnder -gt 0) {
            $issues.Add("Kurang -$lampUnder Lampu (-$wattUnder W/m2)")
        } else {
            $issues.Add("Kurang Watt (-$wattUnder W/m2)")
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

Write-Host "Menjalankan Simulasi Kalkulator Lampu v1.1.0..."

$headers = "Lebar (m),Panjang (m),Luas Area (m2),Batas Min Lampu,Batas Max Lampu,Batas Min Watt,Batas Max Watt,Lampu Per Baris,Jumlah Baris,Total Lampu Rekomendasi,Total Watt Aktual,Aktual (W/m2),Jarak Samping (m),Jarak Antar Baris (m),Status Rasio Watt,Status Jarak Samping,Status Jarak Baris,Status Standar Komulatif,Keterangan Diagnosa"

$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine($headers)

$totalCount = 0

# Counter Statistik
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

        # Aggregasi Rasio
        if ($eval.StatusRasio -eq "Ideal") { $cRasioIdeal++ }
        elseif ($eval.StatusRasio -eq "Toleransi (Low)") { $cRasioLow++ }
        else { $cRasioHigh++ }

        # Aggregasi Samping
        if ($eval.StatusSamping -eq "Ideal") { $cSampingIdeal++ }
        elseif ($eval.StatusSamping -eq "Toleransi (Mepet)") { $cSampingMepet++ }
        else { $cSampingRenggang++ }

        # Aggregasi Baris
        if ($eval.StatusBaris -eq "Ideal") { $cBarisIdeal++ }
        else { $cBarisLebar++ }

        # Aggregasi Kumulatif
        if ($eval.StatusKumulatif -eq "Standar Ideal") { $cKumulatifIdeal++ }
        else { $cKumulatifToleransi++ }

        $line = "$($lebar.ToString('0.0', $ci)),$($panjang.ToString('0.0', $ci)),$($area.ToString('0.00', $ci)),$($sim.MinLamps),$($sim.MaxLamps),$($minWatt.ToString('0.00', $ci)),$($maxWatt.ToString('0.00', $ci)),$($sim.LampuPerBaris),$($sim.Baris),$($sim.Total),$($totalWatt.ToString('0.00', $ci)),$($sim.Rasio.ToString('0.00', $ci)),$($sim.JarakSamping.ToString('0.00', $ci)),$($sim.JarakPerbaris.ToString('0.00', $ci)),`"$($eval.StatusRasio)`",`"$($eval.StatusSamping)`",`"$($eval.StatusBaris)`",`"$($eval.StatusKumulatif)`",`"$($eval.Detail)`""
        [void]$sb.AppendLine($line)
    }
}

$outCsvPath = Join-Path (Get-Location) "Simulasi_Kalkulator_Lampu_v1.1.0.csv"
[System.IO.File]::WriteAllText($outCsvPath, $sb.ToString(), [System.Text.Encoding]::UTF8)

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

# Buat File Ringkasan CSV
$summarySb = [System.Text.StringBuilder]::new()
[void]$summarySb.AppendLine("Kategori Analisis,Kriteria / Status Aspek,Jumlah Sampel,Persentase (%)")
[void]$summarySb.AppendLine("Parameter Ruang,Rentang Dimensi (5.0m - 25.0m step 0.1m),$totalCount,100.00%")
[void]$summarySb.AppendLine("Parameter Ruang,Rentang Luas Area (25.00 m2 - 625.00 m2),$totalCount,100.00%")
[void]$summarySb.AppendLine("Spesifikasi Lampu,LED Tube 13.5 Watt / 1.22 meter,$totalCount,100.00%")
[void]$summarySb.AppendLine("")
[void]$summarySb.AppendLine("1. Aspek Rasio Daya Listrik,Ideal (4.00 - 5.00 W/m2),$cRasioIdeal,$($pctRasioIdeal.ToString('0.00', $ci))%")
[void]$summarySb.AppendLine("1. Aspek Rasio Daya Listrik,Toleransi Low (< 4.00 W/m2),$cRasioLow,$($pctRasioLow.ToString('0.00', $ci))%")
[void]$summarySb.AppendLine("1. Aspek Rasio Daya Listrik,Toleransi High (> 5.00 W/m2),$cRasioHigh,$($pctRasioHigh.ToString('0.00', $ci))%")
[void]$summarySb.AppendLine("")
[void]$summarySb.AppendLine("2. Aspek Jarak Samping (JS),Ideal (0.30m - 0.60m),$cSampingIdeal,$($pctSampingIdeal.ToString('0.00', $ci))%")
[void]$summarySb.AppendLine("2. Aspek Jarak Samping (JS),Toleransi Mepet (< 0.30m),$cSampingMepet,$($pctSampingMepet.ToString('0.00', $ci))%")
[void]$summarySb.AppendLine("2. Aspek Jarak Samping (JS),Toleransi Renggang (> 0.60m),$cSampingRenggang,$($pctSampingRenggang.ToString('0.00', $ci))%")
[void]$summarySb.AppendLine("")
[void]$summarySb.AppendLine("3. Aspek Jarak Antar Baris (JB),Ideal (<= 1.90m),$cBarisIdeal,$($pctBarisIdeal.ToString('0.00', $ci))%")
[void]$summarySb.AppendLine("3. Aspek Jarak Antar Baris (JB),Toleransi Lebar (> 1.90m),$cBarisLebar,$($pctBarisLebar.ToString('0.00', $ci))%")
[void]$summarySb.AppendLine("")
[void]$summarySb.AppendLine("4. Status Standar Komulatif,Standar Ideal (Semua 3 Aspek Lolos),$cKumulatifIdeal,$($pctKumulatifIdeal.ToString('0.00', $ci))%")
[void]$summarySb.AppendLine("4. Status Standar Komulatif,Standar Toleransi (Ada Aspek di Luar Ideal),$cKumulatifToleransi,$($pctKumulatifToleransi.ToString('0.00', $ci))%")

$outSummaryPath = Join-Path (Get-Location) "Ringkasan_Analisis_Kalkulator_Lampu.csv"
[System.IO.File]::WriteAllText($outSummaryPath, $summarySb.ToString(), [System.Text.Encoding]::UTF8)

Write-Host "`n=== HASIL ANALISIS LENGKAP SIMULASI KALKULATOR LAMPU v1.1.0 ==="
Write-Host "Total Sampel: $totalCount kombinasi ruangan"
