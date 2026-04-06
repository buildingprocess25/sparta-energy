"use client"

import {
  IconAlertTriangle,
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconCircle,
} from "@tabler/icons-react"
import * as React from "react"
import Link from "next/link"

import { AuditStep2Detail } from "./step2-detail"
import { Header } from "@/components/header"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type AreaStatus = "done" | "pending"

type AreaItem = {
  id: string
  name: string
  status: AreaStatus
}

type AuditStep2Props = {
  selectedArea?: string | null
}

const areaItems: AreaItem[] = [
  { id: "AS", name: "Area Sales", status: "done" },
  { id: "TR", name: "Teras", status: "done" },
  { id: "PK", name: "Parkiran", status: "done" },
  { id: "GD", name: "Gudang", status: "pending" },
  { id: "SL", name: "Selasar", status: "pending" },
  { id: "TL", name: "Toilet", status: "pending" },
  { id: "LL", name: "Lain-lain", status: "pending" },
  { id: "BS", name: "Beanspot", status: "pending" },
]

const totalAreas = areaItems.length
const completedAreas = areaItems.filter((item) => item.status === "done").length
const progressValue = Math.round((completedAreas / totalAreas) * 100)

function Step2AreaCard({ item }: { item: AreaItem }) {
  const isDone = item.status === "done"

  return (
    <Link href={`/audit/start?step=2&area=${item.id}`} className="block">
      <Card
        className={cn(
          "gap-4 py-4 transition-transform active:translate-y-px",
          isDone ? "bg-card" : "bg-muted/35"
        )}
      >
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl text-xs font-bold",
                isDone
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item.id}
            </div>

            {isDone ? (
              <IconCheck className="size-5 text-emerald-600" />
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

export function AuditStep2({ selectedArea }: AuditStep2Props) {
  const canContinue = completedAreas === totalAreas

  if (selectedArea) {
    const areaName =
      areaItems.find((item) => item.id === selectedArea)?.name ?? "Area"

    return <AuditStep2Detail areaName={areaName} />
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header
        variant="dashboard-back"
        title="Kembali"
        backHref="/audit/start?step=1"
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
                    Kemajuan Pengisian
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

          <Alert className="border-amber-300/70 bg-amber-100/70 text-amber-900 dark:border-amber-600/60 dark:bg-amber-950/40 dark:text-amber-200">
            <IconAlertTriangle className="size-4" />
            <AlertDescription className="font-medium text-inherit">
              Semua area harus diisi sebelum kalkulasi
            </AlertDescription>
          </Alert>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {areaItems.map((item) => (
            <Step2AreaCard key={item.name} item={item} />
          ))}
        </section>

        <Card className="overflow-hidden border-dashed bg-linear-to-r from-muted/55 to-muted/25 py-0">
          <CardContent className="flex h-28 items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Insight
              </p>
              <p className="text-sm font-semibold text-primary">
                Lengkapi semua area untuk lanjut ke History kWh
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <IconBolt className="size-5" />
            </span>
          </CardContent>
        </Card>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="w-full max-w-sm">
          <Button className="h-11 w-full" disabled={!canContinue}>
            Lanjut ke History kWh
            <IconArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  )
}
