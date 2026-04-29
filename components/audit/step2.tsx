"use client"

import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingWarehouse,
  IconCircleCheck,
  IconCircle,
} from "@tabler/icons-react"
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { AuditStep2Detail } from "./step2-detail"
import { Header } from "@/components/header"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useAuditStore } from "@/store/use-audit-store"

type AreaItem = {
  id: string
  name: string
  href: string
}

type AuditStep2Props = {
  selectedArea?: string | null
  basePath?: string
  masterItems?: Array<{
    id: string
    name: string
    category: string
    defaultKw: number
    brands: Array<{ id: string; name: string; baseKw: number }>
  }>
}

const areaItems = [
  { id: "SALES", name: "Sales" },
  { id: "PARKING", name: "Parkiran" },
  { id: "TERRACE", name: "Teras" },
  { id: "WAREHOUSE", name: "Gudang, Toilet & Selasar" },
]

const totalAreas = areaItems.length

function Step2AreaCard({ item, isDone }: { item: AreaItem; isDone: boolean }) {
  return (
    <Link href={item.href} className="block">
      <Card
        className={cn(
          "gap-4 py-4 transition-transform active:translate-y-px",
          isDone ? "bg-card" : "bg-muted"
        )}
      >
        <CardContent className="h-30 space-y-3">
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl text-xs font-bold",
                isDone
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <IconBuildingWarehouse className="size-8 text-primary" />
            </div>

            {isDone ? (
              <IconCircleCheck className="size-5 text-emerald-600" />
            ) : (
              <IconCircle className="size-5 text-muted-foreground/60" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              {item.name}
            </h3>

            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {isDone ? "Selesai" : "Belum diisi"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function AuditStep2({
  selectedArea,
  basePath = "/audit/start",
  masterItems = [],
}: AuditStep2Props) {
  const router = useRouter()
  const { savedAreas } = useAuditStore()
  const [isPending, startTransition] = React.useTransition()

  const areaItemsWithLinks: AreaItem[] = areaItems.map((item) => ({
    ...item,
    href: `${basePath}?step=2&area=${item.id}`,
  }))

  const completedAreas = areaItemsWithLinks.filter((item) =>
    savedAreas.includes(item.name)
  ).length
  const progressValue =
    totalAreas > 0 ? Math.round((completedAreas / totalAreas) * 100) : 0

  if (selectedArea) {
    const areaName =
      areaItemsWithLinks.find((item) => item.id === selectedArea)?.name ??
      "Area"

    return (
      <AuditStep2Detail
        areaName={areaName}
        areaId={selectedArea}
        basePath={basePath}
        masterItems={masterItems}
      />
    )
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header
        variant="dashboard-back"
        title="Kembali"
        backHref={`${basePath}?step=1`}
        className="px-0"
      />

      <main className="flex flex-col gap-6">
        <section className="space-y-4">
          <AuditStepIndicator currentStep={2} label="Step 2: Input Equipment" />

          <Card className="bg-muted/40 py-5">
            <CardHeader className="pb-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Progress Pengisian
                  </p>
                  <CardTitle className="text-lg text-primary">
                    {completedAreas} / {totalAreas} area selesai
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="h-6 rounded-full px-2.5">
                  {progressValue}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progressValue} className="h-3 bg-muted" />
            </CardContent>
          </Card>

          {completedAreas < totalAreas && (
            <Alert className="border-amber-300/70 bg-amber-100/70 text-amber-900 dark:border-amber-600/60 dark:bg-amber-950/40 dark:text-amber-200">
              <IconAlertTriangle className="size-4" />
              <AlertDescription className="font-medium text-inherit">
                Semua area harus diisi sebelum kalkulasi
              </AlertDescription>
            </Alert>
          )}
        </section>

        <section className="grid grid-cols-2 gap-3">
          {areaItemsWithLinks.map((item) => {
            const isDone = savedAreas.includes(item.name)
            return <Step2AreaCard key={item.id} item={item} isDone={isDone} />
          })}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="w-full max-w-sm">
          <Button
            className="h-11 w-full"
            disabled={completedAreas < totalAreas || isPending}
            onClick={() => {
              startTransition(() => {
                router.push(`${basePath}?step=3`)
              })
            }}
          >
            {isPending ? "Memproses..." : "Lanjut ke History kWh"}
            {!isPending && <IconArrowRight data-icon="inline-end" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
