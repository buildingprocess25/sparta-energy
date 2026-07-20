"use client"

import Link from "next/link"
import {
  IconAirConditioning,
  IconBulb,
} from "@tabler/icons-react"

interface CalculatorGridProps {
  isAdmin?: boolean
}

export function CalculatorGrid({ isAdmin }: CalculatorGridProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
        Kalkulator Mandiri
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {/* Kalkulator AC */}
        <Link
          href="/ac-estimation"
          className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] group active:scale-98 transition-all hover:bg-accent/40"
        >
          <div className="size-10 rounded-xl bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10 transition-transform group-hover:scale-105 shrink-0">
            <IconAirConditioning className="size-5" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[11px] font-bold text-foreground/90 leading-tight">
              Kalkulator AC
            </span>
            <span className="text-[9px] text-muted-foreground truncate">
              Estimasi unit AC
            </span>
          </div>
        </Link>

        {/* Kalkulator Lampu */}
        <Link
          href="/light-estimation"
          className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative group active:scale-98 transition-all hover:bg-accent/40"
        >
          <div className="size-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/10 transition-transform group-hover:scale-105 shrink-0">
            <IconBulb className="size-5" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[11px] font-bold text-foreground/90 leading-tight">
              Kalkulator Lampu
            </span>
            <span className="text-[9px] text-muted-foreground truncate">
              Simulasi lampu
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
