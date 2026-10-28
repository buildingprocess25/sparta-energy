import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  LUX_AREAS,
  averageLux,
  getLuxStatus,
  type LightingLuxRow,
  type LightingZoneDefinition,
  type LuxStatus,
  type LuxSubZone,
} from "@/lib/lighting-audit"
import { cn } from "@/lib/utils"

const numberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
})

const cellTone: Record<LuxStatus, string> = {
  MEMENUHI:
    "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200",
  KURANG:
    "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200",
  TERLALU_TERANG:
    "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200",
  BELUM_DIUKUR: "border-dashed text-muted-foreground",
}

export function LuxSubZoneGuide({
  rows,
  definition,
}: {
  rows: LightingLuxRow[]
  definition: LightingZoneDefinition
}) {
  function cellAverage(subZone: LuxSubZone) {
    return averageLux(
      rows
        .filter((row) => row.subZone === subZone && row.lux !== null)
        .map((row) => row.lux as number)
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Panduan sub zona</CardTitle>
        <CardDescription>
          Denah titik ukur {definition.label}. Kotak berwarna sudah diukur.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <figure className="flex flex-col gap-1.5">
          <figcaption className="text-center text-xs font-medium text-muted-foreground">
            Pintu masuk
          </figcaption>
          {LUX_AREAS.map((area) => (
            <div
              key={area.key}
              className="grid grid-cols-[4.5rem_repeat(3,minmax(0,1fr))] items-center gap-1.5"
            >
              <span className="text-xs text-muted-foreground">
                {area.key} · {area.label}
              </span>
              {[1, 2, 3].map((position) => {
                const subZone = `${area.key}${position}` as LuxSubZone
                const avg = cellAverage(subZone)
                const status = getLuxStatus(avg, definition)
                return (
                  <div
                    key={subZone}
                    className={cn(
                      "flex min-h-12 flex-col items-center justify-center rounded-lg border text-xs tabular-nums",
                      cellTone[status]
                    )}
                  >
                    <span className="font-semibold">{subZone}</span>
                    <span>{avg === null ? "-" : numberFormat.format(avg)}</span>
                  </div>
                )
              })}
            </div>
          ))}
          <p className="text-center text-xs font-medium text-muted-foreground">
            Bagian belakang
          </p>
        </figure>

        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs text-muted-foreground">
          <li>A = depan, sisi paling dekat pintu masuk atau jalan.</li>
          <li>B = tengah.</li>
          <li>C = belakang, sisi paling jauh dari pintu masuk.</li>
          <li>
            Angka 1 sampai 3 hanya penanda posisi, misalnya kiri, tengah, kanan,
            supaya titik yang sama mudah diukur lagi. Angka ini tidak dipakai
            dalam hitungan.
          </li>
          <li>
            Rata-rata zona diambil dari rata-rata Depan, Tengah, dan Belakang.
            Kalau satu area statusnya berbeda dari rata-rata zona, isi catatan
            alasannya di baris area itu.
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
