$LAMP_WATT = 13.5
$LAMP_LEN = 1.22

function Calc-Old($l, $p, $area) {
    $limitMax = [Math]::Ceiling((5.0 * $area) / $LAMP_WATT)
    $limitMin = [Math]::Ceiling((4.0 * $area) / $LAMP_WATT)
    $lpbMax = [Math]::Ceiling($l / $LAMP_LEN)
    $lpbMin = [Math]::Floor($l / $LAMP_LEN)
    $lpbM1 = [Math]::Max(1, $lpbMin - 1)
    $jsMax = ($l - $lpbMax * $LAMP_LEN)/2.0
    $jsMin = ($l - $lpbMin * $LAMP_LEN)/2.0
    $jsM1 = ($l - $lpbM1 * $LAMP_LEN)/2.0
    $lpb = $lpbM1
    if ($jsMin -ge 0.3 -and $jsMin -le 0.6) { $lpb = $lpbMin }
    elseif ($jsMax -ge 0.3 -and $jsMax -le 0.6) { $lpb = $lpbMax }
    elseif ($jsM1 -ge 0.3 -and $jsM1 -le 0.6) { $lpb = $lpbM1 }
    $fMax = [Math]::Floor($limitMax / $lpb) * $lpb
    $cMin = [Math]::Ceiling($limitMin / $lpb) * $lpb
    $sampling = if ($fMax -lt $limitMin) { $cMin } else { $fMax }
    $C33 = [Math]::Max(1, [Math]::Round($sampling / $lpb))
    $C34 = $p / ($C33 + 1.0)
    $baris = if ($C34 -gt 1.9) { $C33 + 1 } else { $C33 }
    return @{ lpb = $lpb; baris = $baris; total = $baris * $lpb; jb = $p / ($baris + 1.0); w = ($baris * $lpb * $LAMP_WATT)/$area }
}

$total = 0
$jbBelow16 = 0
$jb16To19 = 0
$jbAbove19 = 0

for ($l = 50; $l -le 250; $l++) {
    for ($p = 50; $p -le 250; $p++) {
        $total++
        $res = Calc-Old ($l/10.0) ($p/10.0) ([Math]::Round(($l/10.0)*($p/10.0), 2))
        if ($res.jb -lt 1.6) { $jbBelow16++ }
        elseif ($res.jb -le 1.9) { $jb16To19++ }
        else { $jbAbove19++ }
    }
}

$pct1 = [Math]::Round(($jbBelow16 * 100.0) / $total, 2)
$pct2 = [Math]::Round(($jb16To19 * 100.0) / $total, 2)
$pct3 = [Math]::Round(($jbAbove19 * 100.0) / $total, 2)

Write-Host "Total Sampel: $total"
Write-Host "Jarak Baris < 1.6m     : $jbBelow16 ($pct1 %)"
Write-Host "Jarak Baris 1.6m - 1.9m: $jb16To19 ($pct2 %)"
Write-Host "Jarak Baris > 1.9m     : $jbAbove19 ($pct3 %)"
