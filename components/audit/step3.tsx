"use client"

import * as React from "react"
import { IconBolt, IconArrowRight, IconInfoCircle } from "@tabler/icons-react"
import Link from "next/link"

import { Header } from "@/components/header"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type UserRole = "user1" | "user2"

const getMockUserRole = (): UserRole => "user2"
const mockUserRole = getMockUserRole()
const mockStore = {
  code: "ID-99281",
  name: "Alfamart Cibubur Raya",
  year: 2025,
  isBeanspot: false,
}

const mockMonthlyRows = [
  { month: "Januari", kwh: "2400", std: "350", beanspot: "45" },
  { month: "Februari", kwh: "2350", std: "345", beanspot: "42" },
  { month: "Maret", kwh: "2500", std: "360", beanspot: "50" },
  { month: "April", kwh: "2420", std: "355", beanspot: "48" },
  { month: "Mei", kwh: "2480", std: "370", beanspot: "55" },
  { month: "Juni", kwh: "2550", std: "380", beanspot: "60" },
  { month: "Juli", kwh: "2600", std: "385", beanspot: "65" },
  { month: "Agustus", kwh: "2580", std: "375", beanspot: "62" },
  { month: "September", kwh: "2520", std: "365", beanspot: "58" },
  { month: "Oktober", kwh: "2490", std: "360", beanspot: "55" },
  { month: "November", kwh: "2610", std: "390", beanspot: "70" },
  { month: "Desember", kwh: "2600", std: "400", beanspot: "75" },
]

const visibleRows =
  mockUserRole === "user1"
    ? [mockMonthlyRows[mockMonthlyRows.length - 1]]
    : mockMonthlyRows

const monthColumnWidthClass = mockStore.isBeanspot ? "w-28" : "w-40"
const valueColumnWidthClass = mockStore.isBeanspot ? "w-20" : "w-20"
const stdColumnWidthClass = "w-20"
const beanspotColumnWidthClass = "w-20"

export function AuditStep3() {
  const [isSkipped, setIsSkipped] = React.useState(false)

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header
        variant="dashboard-back"
        title="Kembali"
        backHref="/audit/start?step=2"
        className="px-0"
      />

      <main className="flex flex-col">
        <section className="mb-6">
          <AuditStepIndicator
            currentStep={3}
            label="Step 3: Data Operasional"
          />
        </section>

        <div
          className={cn(
            "grid transition-all duration-500 ease-in-out",
            isSkipped
              ? "pointer-events-none translate-y-8 grid-rows-[0fr] opacity-0"
              : "translate-y-0 grid-rows-[1fr] opacity-100"
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-6 pb-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {mockStore.isBeanspot
                  ? "Masukkan riwayat konsumsi listrik, jumlah transaksi, dan penjualan Beanspot."
                  : "Masukkan riwayat konsumsi listrik dan jumlah transaksi per hari (STD)."}
              </p>

              <Alert className="border-blue-600/50 bg-blue-50 dark:border-blue-400/70 dark:bg-blue-950/40">
                <IconInfoCircle />
                <AlertDescription>
                  {mockStore.isBeanspot
                    ? "Data kWh dan STD dapat dilihat di laporan bulanan toko. Beanspot merujuk pada total unit cup/produk terjual."
                    : "Data kWh dan STD dapat dilihat di laporan bulanan toko."}
                </AlertDescription>
              </Alert>

              <section className="rounded-lg border bg-card">
                <Table className="min-w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className={cn(
                          "text-[10px] font-bold tracking-wider text-muted-foreground uppercase",
                          monthColumnWidthClass
                        )}
                      >
                        Bulan ({mockStore.year})
                      </TableHead>
                      <TableHead
                        className={cn(
                          "text-center text-[10px] font-bold tracking-wider whitespace-normal text-muted-foreground uppercase",
                          valueColumnWidthClass
                        )}
                      >
                        Konsumsi (kWh)
                      </TableHead>
                      <TableHead
                        className={cn(
                          "text-center text-[10px] font-bold tracking-wider whitespace-normal text-muted-foreground uppercase",
                          stdColumnWidthClass
                        )}
                      >
                        STD/Day
                      </TableHead>
                      {mockStore.isBeanspot ? (
                        <TableHead
                          className={cn(
                            "text-center text-[10px] font-bold tracking-wider whitespace-normal text-muted-foreground uppercase",
                            beanspotColumnWidthClass
                          )}
                        >
                          Beanspot (Pcs)
                        </TableHead>
                      ) : null}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {visibleRows.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="truncate text-xs font-medium text-foreground">
                          {row.month}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder={row.kwh}
                            className="h-8 w-full rounded-none border-0 border-b bg-transparent px-0 text-right text-xs ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder={row.std}
                            className="h-8 w-full rounded-none border-0 border-b bg-transparent px-0 text-right text-xs ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </TableCell>
                        {mockStore.isBeanspot ? (
                          <TableCell>
                            <Input
                              type="number"
                              placeholder={row.beanspot}
                              className="h-8 w-full rounded-none border-0 border-b bg-transparent px-0 text-right text-xs ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>

                  {mockUserRole === "user2" ? (
                    <TableFooter>
                      <TableRow>
                        <TableCell className="text-xs font-bold">
                          Rata-rata (Otomatis)
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          2.508
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          367
                        </TableCell>
                        {mockStore.isBeanspot ? (
                          <TableCell className="text-right text-xs">
                            58
                          </TableCell>
                        ) : null}
                      </TableRow>
                    </TableFooter>
                  ) : null}
                </Table>
              </section>
            </div>
          </div>
        </div>

        <section className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
          <div className="pr-3">
            <p className="text-sm font-semibold text-foreground">
              Lewati, gunakan estimasi equipment
            </p>
            <p className="text-xs text-muted-foreground">
              Gunakan perhitungan berdasarkan alat listrik.
            </p>
          </div>
          <Switch checked={isSkipped} onCheckedChange={setIsSkipped} />
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="w-full max-w-sm">
          <Button className="h-11 w-full rounded-full" asChild>
            <Link href="/audit/start?step=4">
              <IconBolt className="size-4" />
              Kalkulasi Sekarang
              <IconArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
