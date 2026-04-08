import {
  IconAlertTriangle,
  IconDownload,
  IconFileDownload,
  IconLeaf,
} from "@tabler/icons-react"

import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type UserRole = "user1" | "user2"
type AuditStatus = "hemat" | "boros"

type StoreTrend = {
  month: string
  actual: number
  standard: number
}

type AreaBreakdown = {
  area: string
  percentage: number
  monthlyKwh: number
}

type BranchPerformance = {
  branch: string
  auditedStores: number
  efficientStores: number
  averageIntensity: number
}

type StorePerformance = {
  storeCode: string
  storeName: string
  branch: string
  intensity: number
  lastAudit: string
  status: AuditStatus
}

const getMockUserRole = (): UserRole => "user2"
const mockUserRole = getMockUserRole()

const storeTrend: StoreTrend[] = [
  { month: "Nov", actual: 13.6, standard: 13.2 },
  { month: "Des", actual: 13.4, standard: 13.2 },
  { month: "Jan", actual: 13.2, standard: 13.1 },
  { month: "Feb", actual: 12.9, standard: 13.0 },
  { month: "Mar", actual: 12.7, standard: 13.0 },
  { month: "Apr", actual: 12.4, standard: 13.0 },
]

const storeAreaBreakdown: AreaBreakdown[] = [
  { area: "Sales Area", percentage: 68, monthlyKwh: 2991 },
  { area: "Teras", percentage: 9, monthlyKwh: 396 },
  { area: "Gudang", percentage: 8, monthlyKwh: 351 },
  { area: "Lainnya", percentage: 15, monthlyKwh: 660 },
]

const branchPerformance: BranchPerformance[] = [
  { branch: "Jakarta Timur", auditedStores: 7, efficientStores: 5, averageIntensity: 12.7 },
  { branch: "Depok", auditedStores: 5, efficientStores: 3, averageIntensity: 13.4 },
  { branch: "Bekasi", auditedStores: 6, efficientStores: 5, averageIntensity: 12.2 },
  { branch: "Bogor", auditedStores: 6, efficientStores: 4, averageIntensity: 13.1 },
]

const topWasteStores: StorePerformance[] = [
  {
    storeCode: "ALF-0882",
    storeName: "Alfamart Depok Barat",
    branch: "Depok",
    intensity: 14.3,
    lastAudit: "30 Mar 2026",
    status: "boros",
  },
  {
    storeCode: "ALF-0321",
    storeName: "Alfamart Bogor Utara",
    branch: "Bogor",
    intensity: 13.9,
    lastAudit: "28 Mar 2026",
    status: "boros",
  },
  {
    storeCode: "ALF-0610",
    storeName: "Alfamart Bekasi Kota",
    branch: "Bekasi",
    intensity: 13.7,
    lastAudit: "27 Mar 2026",
    status: "boros",
  },
]

const numberFormat = new Intl.NumberFormat("id-ID")

function getStatusBadge(status: AuditStatus) {
  if (status === "hemat") {
    return (
      <Badge variant="default">
        <IconLeaf data-icon="inline-start" />
        Hemat
      </Badge>
    )
  }

  return (
    <Badge variant="destructive">
      <IconAlertTriangle data-icon="inline-start" />
      Boros
    </Badge>
  )
}

export default function ReportsPage() {
  const roleLabel =
    mockUserRole === "user1"
      ? "User 1 - Fokus Satu Toko"
      : "User 2 - Monitoring Semua Toko"
  const maxActual = Math.max(...storeTrend.map((item) => item.actual))
  const maxStandard = Math.max(...storeTrend.map((item) => item.standard))
  const maxTrendValue = Math.max(maxActual, maxStandard)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="title-only" title="Reports" />

      <section className="space-y-4">
        <Card className="bg-muted/45">
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Role Aktif
              </p>
              <p className="text-sm font-semibold">{roleLabel}</p>
            </div>
            <Badge variant="outline">{mockUserRole.toUpperCase()}</Badge>
          </CardContent>
        </Card>

        {mockUserRole === "user1" ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">KPI Toko: ALF-0123</CardTitle>
                <CardDescription>
                  Ringkasan performa energi toko yang dapat diaudit oleh user
                  utama.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Avg Intensitas
                  </p>
                  <p className="text-lg font-bold text-primary">12.4 kWh/m2</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Status
                  </p>
                  <div className="pt-1">{getStatusBadge("hemat")}</div>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Potensi Hemat
                  </p>
                  <p className="text-lg font-bold text-emerald-700">8.6%</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Audit Tahun Ini
                  </p>
                  <p className="text-lg font-bold">6 sesi</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Tren Aktual vs Standar</CardTitle>
                <CardDescription>6 bulan terakhir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {storeTrend.map((item) => (
                  <div key={item.month} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">{item.month}</span>
                      <span className="text-muted-foreground">
                        Aktual {item.actual.toFixed(1)} | Standar{" "}
                        {item.standard.toFixed(1)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${(item.actual / maxTrendValue) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="h-1 rounded-full bg-muted/70">
                        <div
                          className="h-full rounded-full bg-muted-foreground"
                          style={{
                            width: `${(item.standard / maxTrendValue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Breakdown Konsumsi Area</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {storeAreaBreakdown.map((area) => (
                  <div key={area.area} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{area.area}</span>
                      <span className="text-muted-foreground">
                        {numberFormat.format(area.monthlyKwh)} kWh / bln
                      </span>
                    </div>
                    <Progress value={area.percentage} className="h-2" />
                    <p className="text-[11px] text-muted-foreground">
                      Porsi {area.percentage}%
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Rekomendasi Prioritas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="rounded-lg bg-muted/35 px-3 py-2">
                  1. Optimalkan durasi AC area sales pada jam non-peak.
                </p>
                <p className="rounded-lg bg-muted/35 px-3 py-2">
                  2. Standardisasi jadwal lampu teras menggunakan timer.
                </p>
                <p className="rounded-lg bg-muted/35 px-3 py-2">
                  3. Audit beban gudang mingguan untuk cegah drift konsumsi.
                </p>
                <Button className="mt-1 w-full">
                  <IconDownload data-icon="inline-start" />
                  Export Report Toko
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">KPI Jaringan Audit Energi</CardTitle>
                <CardDescription>
                  Ringkasan performa lintas cabang untuk keputusan prioritas.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Total Toko Diaudit
                  </p>
                  <p className="text-lg font-bold">24</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Toko Hemat
                  </p>
                  <p className="text-lg font-bold text-emerald-700">18 (75%)</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Toko Boros
                  </p>
                  <p className="text-lg font-bold text-rose-700">6 (25%)</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Potensi Saving
                  </p>
                  <p className="text-lg font-bold text-primary">9.8%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Performa per Cabang</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {branchPerformance.map((branch) => {
                  const efficiencyRate = Math.round(
                    (branch.efficientStores / branch.auditedStores) * 100
                  )

                  return (
                    <div
                      key={branch.branch}
                      className="space-y-1.5 rounded-xl bg-muted/30 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{branch.branch}</span>
                        <span className="text-muted-foreground">
                          Avg {branch.averageIntensity.toFixed(1)} kWh/m2
                        </span>
                      </div>
                      <Progress value={efficiencyRate} className="h-2" />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{branch.efficientStores} toko hemat</span>
                        <span>{branch.auditedStores} toko diaudit</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Top Toko Boros</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Toko</TableHead>
                      <TableHead className="text-right">kWh/m2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topWasteStores.map((store) => (
                      <TableRow key={store.storeCode}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">
                              {store.storeName}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {store.storeCode} - {store.branch}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-rose-700">
                              {store.intensity.toFixed(1)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {store.lastAudit}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Prioritas Tindak Lanjut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="rounded-lg bg-amber-100/70 px-3 py-2 text-amber-900 dark:bg-amber-950/35 dark:text-amber-200">
                  1. Fokus intervensi cabang Depok dan Bogor untuk beban AC
                  serta pendingin.
                </p>
                <p className="rounded-lg bg-muted/35 px-3 py-2">
                  2. Jalankan audit ulang 2 mingguan pada 3 toko paling boros.
                </p>
                <p className="rounded-lg bg-muted/35 px-3 py-2">
                  3. Terapkan SOP lampu dan signage lintas cabang.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button>
                    <IconFileDownload data-icon="inline-start" />
                    PDF
                  </Button>
                  <Button variant="secondary">
                    <IconDownload data-icon="inline-start" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </section>

      <BottomNavigation />
    </main>
  )
}
