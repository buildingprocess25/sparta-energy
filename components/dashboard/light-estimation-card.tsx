"use client"

import Link from "next/link"
import { IconBulb, IconArrowRight } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface LightEstimationCardProps {
  isAdmin?: boolean
}

function LightEstimationCard({ isAdmin }: LightEstimationCardProps) {
  return (
    <Card className="relative overflow-hidden border-amber-100 bg-linear-to-tr from-amber-50 to-orange-50/50 dark:border-amber-900/30 dark:from-amber-950/20 dark:to-orange-950/10">
      <div className="pointer-events-none absolute -top-6 -right-4 opacity-5 dark:opacity-10">
        <IconBulb className="size-32 text-amber-500 dark:text-amber-400" />
      </div>

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg leading-tight text-amber-900 dark:text-amber-100">
                Kalkulator Lampu
              </CardTitle>
            </div>
            <CardDescription className="max-w-50 text-xs text-amber-700/70 dark:text-amber-300/70">
              Simulasikan penempatan lampu TL/LED sesuai standar target W/m².
            </CardDescription>
          </div>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="shrink-0 rounded-full border-none bg-white/60 text-amber-700 shadow-sm backdrop-blur-sm hover:bg-white dark:bg-black/20 dark:text-amber-400 dark:hover:bg-black/40"
          >
            <Link href="/light-estimation">
              Mulai
              <IconArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

export { LightEstimationCard }
