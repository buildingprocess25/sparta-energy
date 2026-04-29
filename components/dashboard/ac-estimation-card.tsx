import Link from "next/link"
import { IconAirConditioning, IconArrowRight } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function AcEstimationCard() {
  return (
    <Card className="relative overflow-hidden border-blue-100 bg-linear-to-tr from-blue-50 to-indigo-50/50 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/10">
      <div className="pointer-events-none absolute -top-6 -right-4 opacity-5 dark:opacity-10">
        <IconAirConditioning className="size-32 text-blue-600 dark:text-blue-400" />
      </div>

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-lg leading-tight text-blue-900 dark:text-blue-100">
              Kalkulator AC
            </CardTitle>
            <CardDescription className="max-w-50 text-xs text-blue-700/70 dark:text-blue-300/70">
              Hitung kebutuhan unit AC berdasarkan suhu luar di lokasi.
            </CardDescription>
          </div>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="shrink-0 rounded-full border-none bg-white/60 text-blue-600 shadow-sm backdrop-blur-sm hover:bg-white dark:bg-black/20 dark:text-blue-400 dark:hover:bg-black/40"
          >
            <Link href="/ac-estimation">
              Mulai
              <IconArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

export { AcEstimationCard }
