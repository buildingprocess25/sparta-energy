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

function Evaluate-Status {
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

    if ($rasio -gt 5.0) {
        $lampOver = $totalLampu - $maxLamps
        $wattOver = ($rasio - 5.0).ToString("0.00", $inv)
        if ($lampOver -gt 0) {
            $issues.Add("Over +$lampOver Lampu (+$wattOver W/m2)")
        } else {
            $issues.Add("Over Watt (+$wattOver W/m2)")
        }
    } elseif ($rasio -lt 4.0) {
        $lampUnder = $minLamps - $totalLampu
        $wattUnder = (4.0 - $rasio).ToString("0.00", $inv)
        if ($lampUnder -gt 0) {
            $issues.Add("Kurang -$lampUnder Lampu (-$wattUnder W/m2)")
        } else {
            $issues.Add("Kurang Watt (-$wattUnder W/m2)")
        }
    }

    if ($jarakSamping -lt 0.3) {
        $issues.Add("Samping Mepet ($($jarakSamping.ToString('0.00', $inv))m < 0.3m)")
    } elseif ($jarakSamping -gt 0.6) {
        $issues.Add("Samping Renggang ($($jarakSamping.ToString('0.00', $inv))m > 0.6m)")
    }

    if ($jarakBaris -gt 1.9) {
        $issues.Add("Baris Renggang ($($jarakBaris.ToString('0.00', $inv))m > 1.9m)")
    }

    $isIdeal = ($rasio -ge 4.0 -and $rasio -le 5.0 -and $jarakSamping -ge 0.3 -and $jarakSamping -le 0.6 -and $jarakBaris -le 1.9)
    $inTolerance = ($rasio -ge 3.5 -and $rasio -le 5.5 -and $jarakSamping -ge 0.2 -and $jarakSamping -le 0.8 -and $jarakBaris -le 2.2)

    $status = "Di Luar Standar"
    if ($isIdeal) {
        $status = "Standar Ideal"
    } elseif ($inTolerance) {
        $status = "Standar Toleransi"
    }

    $detail = if ($issues.Count -gt 0) { [string]::Join(" | ", $issues) } else { "Sesuai Standar Target" }

    return [PSCustomObject]@{
        Status = $status
        Detail = $detail
    }
}

Write-Host "Generating Lamp Simulation CSV via PowerShell..."

$headers = "Lebar (m),Panjang (m),Luas Area (m2),Batas Min Lampu,Batas Max Lampu,Batas Min Watt,Batas Max Watt,Lampu Per Baris,Jumlah Baris,Total Lampu Rekomendasi,Total Watt Aktual,Aktual (W/m2),Jarak Samping (m),Jarak Antar Baris (m),Status Standar,Keterangan Diagnosa"

$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine($headers)

$count = 0

for ($l = 50; $l -le 250; $l++) {
    $lebar = $l / 10.0
    for ($p = 50; $p -le 250; $p++) {
        $panjang = $p / 10.0
        $area = [Math]::Round($lebar * $panjang, 2)

        $sim = Calc-Simetris -lebar $lebar -panjang $panjang -areaSales $area

        $totalWatt = [Math]::Round($sim.Total * $LAMP_WATT, 2)
        $minWatt = [Math]::Round($sim.MinLamps * $LAMP_WATT, 2)
        $maxWatt = [Math]::Round($sim.MaxLamps * $LAMP_WATT, 2)

        $diag = Evaluate-Status -rasio $sim.Rasio -jarakSamping $sim.JarakSamping -jarakBaris $sim.JarakPerbaris -totalLampu $sim.Total -minLamps $sim.MinLamps -maxLamps $sim.MaxLamps

        $line = "$($lebar.ToString('0.0', $ci)),$($panjang.ToString('0.0', $ci)),$($area.ToString('0.00', $ci)),$($sim.MinLamps),$($sim.MaxLamps),$($minWatt.ToString('0.00', $ci)),$($maxWatt.ToString('0.00', $ci)),$($sim.LampuPerBaris),$($sim.Baris),$($sim.Total),$($totalWatt.ToString('0.00', $ci)),$($sim.Rasio.ToString('0.00', $ci)),$($sim.JarakSamping.ToString('0.00', $ci)),$($sim.JarakPerbaris.ToString('0.00', $ci)),$($diag.Status),`"$($diag.Detail)`""
        [void]$sb.AppendLine($line)
        $count++
    }
}

$outPath = Join-Path (Get-Location) "Simulasi_Kalkulator_Lampu.csv"
[System.IO.File]::WriteAllText($outPath, $sb.ToString(), [System.Text.Encoding]::UTF8)

Write-Host "Success! Generated $count rows at $outPath"
