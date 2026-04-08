import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconDownload,
  IconFileDescription,
  IconFilter,
  IconLoader2,
  IconMapPin,
  IconSearch,
  IconTrendingDown,
  IconTrendingUp,
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

type UserRole = "user" | "admin"
type AuditStatus = "hemat" | "boros"
type FollowUpStatus = "open" | "in_progress" | "done"

type HistoryItem = {
  auditId: string
  storeCode: string
  storeName: string
  branch: string
  auditedAt: string
  auditor: string
  intensity: number
  status: AuditStatus
  deltaFromPrevious: number
  followUp: FollowUpStatus
}

const getMockUserRole = (): UserRole => "user"
const mockUserRole = getMockUserRole()

const singleStoreHistory: HistoryItem[] = [
  {
    auditId: "AUD-260401",
    storeCode: "ALF-0123",
    storeName: "Alfamart Cibubur Raya",
    branch: "Jakarta Timur",
    auditedAt: "01 Apr 2026",
    auditor: "B&M Area 3",
    intensity: 12.4,
    status: "hemat",
    deltaFromPrevious: -0.6,
    followUp: "done",
  },
  {
    auditId: "AUD-260301",
    storeCode: "ALF-0123",
    storeName: "Alfamart Cibubur Raya",
    branch: "Jakarta Timur",
    auditedAt: "03 Mar 2026",
    auditor: "B&M Area 3",
    intensity: 13.0,
    status: "hemat",
    deltaFromPrevious: -0.2,
    followUp: "in_progress",
  },
  {
    auditId: "AUD-260131",
    storeCode: "ALF-0123",
    storeName: "Alfamart Cibubur Raya",
    branch: "Jakarta Timur",
    auditedAt: "31 Jan 2026",
    auditor: "B&M Area 3",
    intensity: 13.2,
    status: "boros",
    deltaFromPrevious: 0.4,
    followUp: "open",
  },
]

const multiStoreHistory: HistoryItem[] = [
  {
    auditId: "AUD-260401",
    storeCode: "ALF-0123",
    storeName: "Alfamart Cibubur Raya",
    branch: "Jakarta Timur",
    auditedAt: "01 Apr 2026",
    auditor: "B&M Area 3",
    intensity: 12.4,
    status: "hemat",
    deltaFromPrevious: -0.6,
    followUp: "done",
  },
  {
    auditId: "AUD-260330",
    storeCode: "ALF-0882",
    storeName: "Alfamart Depok Barat",
    branch: "Depok",
    auditedAt: "30 Mar 2026",
    auditor: "B&M Area 2",
    intensity: 14.3,
    status: "boros",
    deltaFromPrevious: 0.8,
    followUp: "open",
  },
  {
    auditId: "AUD-260329",
    storeCode: "ALF-0459",
    storeName: "Alfamart Bekasi Timur",
    branch: "Bekasi",
    auditedAt: "29 Mar 2026",
    auditor: "B&M Area 5",
    intensity: 11.8,
    status: "hemat",
    deltaFromPrevious: -0.5,
    followUp: "done",
  },
  {
    auditId: "AUD-260328",
    storeCode: "ALF-0321",
    storeName: "Alfamart Bogor Utara",
    branch: "Bogor",
    auditedAt: "28 Mar 2026",
    auditor: "B&M Area 1",
    intensity: 13.9,
    status: "boros",
    deltaFromPrevious: 0.3,
    followUp: "in_progress",
  },
]

function getAuditBadge(status: AuditStatus) {
  if (status === "hemat") {
    return (
      <Badge variant="default" className="capitalize">
        <IconTrendingDown data-icon="inline-start" />
        Hemat
      </Badge>
    )
  }

  return (
    <Badge variant="destructive" className="capitalize">
      <IconTrendingUp data-icon="inline-start" />
      Boros
    </Badge>
  )
}

function getFollowUpBadge(status: FollowUpStatus) {
  if (status === "done") {
    return (
      <Badge variant="secondary">
        <IconCircleCheck data-icon="inline-start" />
        Done
      </Badge>
    )
  }

  if (status === "in_progress") {
    return (
      <Badge variant="outline">
        <IconLoader2 data-icon="inline-start" />
        In Progress
      </Badge>
    )
  }

  return (
    <Badge variant="destructive">
      <IconAlertTriangle data-icon="inline-start" />
      Open
    </Badge>
  )
}

export default function HistoryPage() {
  const roleLabel =
    mockUserRole === "user"
      ? "user - Audit Satu Toko"
      : "admin - Audit Semua Toko"
  const visibleHistory =
    mockUserRole === "user" ? singleStoreHistory : multiStoreHistory

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="title-only" title="History" />

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

        {mockUserRole === "user" ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Riwayat Audit Toko: {singleStoreHistory[0].storeName}
              </CardTitle>
              <CardDescription>
                Menampilkan histori audit, tren hasil, dan status tindak lanjut
                untuk toko milik user utama.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleHistory.map((item) => (
                <div
                  key={item.auditId}
                  className="space-y-2 rounded-xl border border-border/70 bg-muted/25 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{item.auditId}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.storeCode} - {item.branch}
                      </p>
                    </div>
                    {getAuditBadge(item.status)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconClock className="size-3.5" />
                      {item.auditedAt}
                    </span>
                    <span>Auditor: {item.auditor}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-background px-2.5 py-2 text-xs">
                    <span className="text-muted-foreground">Intensitas</span>
                    <span className="font-semibold">
                      {item.intensity.toFixed(1)} kWh/m2
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Delta vs audit sebelumnya
                    </span>
                    <span
                      className={
                        item.deltaFromPrevious <= 0
                          ? "font-semibold text-emerald-700"
                          : "font-semibold text-rose-700"
                      }
                    >
                      {item.deltaFromPrevious > 0 ? "+" : ""}
                      {item.deltaFromPrevious.toFixed(1)} kWh/m2
                    </span>
                  </div>
                  <div className="pt-1">{getFollowUpBadge(item.followUp)}</div>
                </div>
              ))}

              <Button className="w-full">
                <IconDownload data-icon="inline-start" />
                Download History Toko
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Riwayat Audit Semua Toko
              </CardTitle>
              <CardDescription>
                Menampilkan histori lintas toko dengan konteks status audit dan
                progress tindak lanjut.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  <IconSearch data-icon="inline-start" />
                  Search toko
                </Badge>
                <Badge variant="outline">
                  <IconFilter data-icon="inline-start" />
                  30 hari terakhir
                </Badge>
                <Badge variant="outline">
                  <IconMapPin data-icon="inline-start" />
                  Semua cabang
                </Badge>
              </div>

              {visibleHistory.map((item) => (
                <div
                  key={item.auditId}
                  className="space-y-2 rounded-xl border border-border/70 bg-muted/25 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.storeName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.storeCode} - {item.branch}
                      </p>
                    </div>
                    {getAuditBadge(item.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-background px-2.5 py-2">
                      <p className="text-muted-foreground">Tanggal Audit</p>
                      <p className="font-semibold">{item.auditedAt}</p>
                    </div>
                    <div className="rounded-lg bg-background px-2.5 py-2">
                      <p className="text-muted-foreground">Intensitas</p>
                      <p className="font-semibold">
                        {item.intensity.toFixed(1)} kWh/m2
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Delta vs audit sebelumnya
                    </span>
                    <span
                      className={
                        item.deltaFromPrevious <= 0
                          ? "font-semibold text-emerald-700"
                          : "font-semibold text-rose-700"
                      }
                    >
                      {item.deltaFromPrevious > 0 ? "+" : ""}
                      {item.deltaFromPrevious.toFixed(1)} kWh/m2
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {getFollowUpBadge(item.followUp)}
                    <Button variant="ghost" size="sm">
                      <IconFileDescription data-icon="inline-start" />
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))}

              <Button className="w-full">
                <IconDownload data-icon="inline-start" />
                Export History Multi Toko
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <BottomNavigation />
    </main>
  )
}
