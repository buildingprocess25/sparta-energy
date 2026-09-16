"use client"

import Link from "next/link"
import {
  IconAirConditioning,
  IconBulb,
  IconMapPin,
  IconLayoutGrid,
} from "@tabler/icons-react"

interface CalculatorGridProps {
  isAdmin?: boolean
}

export function CalculatorGrid({ isAdmin }: CalculatorGridProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Kalkulator & Mapping Mandiri
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* Kalkulator AC */}
        <Link
          href="/ac-estimation"
          className="group relative flex flex-col items-center justify-center p-2.5 sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:p-3 rounded-2xl bg-card border border-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-primary/30 transition-all duration-200 active:scale-95 text-center sm:text-left"
        >
          <div className="size-10 rounded-xl bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <IconAirConditioning className="size-5" />
          </div>
          <div className="mt-1.5 sm:mt-0 flex flex-col items-center sm:items-start min-w-0 flex-1 w-full sm:w-auto">
            <span className="text-[11.5px] sm:text-xs font-bold text-foreground/90 leading-tight tracking-tight">
              Kalkulator AC
            </span>
            <span className="text-[9px] sm:text-[10.5px] text-muted-foreground truncate w-full mt-0.5">
              Estimasi unit AC
            </span>
          </div>
        </Link>

        {/* Kalkulator Lampu */}
        <Link
          href="/light-estimation"
          className="group relative flex flex-col items-center justify-center p-2.5 sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:p-3 rounded-2xl bg-card border border-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-primary/30 transition-all duration-200 active:scale-95 text-center sm:text-left"
        >
          <div className="size-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/15 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <IconBulb className="size-5" />
          </div>
          <div className="mt-1.5 sm:mt-0 flex flex-col items-center sm:items-start min-w-0 flex-1 w-full sm:w-auto">
            <span className="text-[11.5px] sm:text-xs font-bold text-foreground/90 leading-tight tracking-tight">
              Kalkulator Lampu
            </span>
            <span className="text-[9px] sm:text-[10.5px] text-muted-foreground truncate w-full mt-0.5">
              Simulasi lampu
            </span>
          </div>
        </Link>

        {/* Mapping AC (DEV untuk Admin, SOON untuk User Biasa) */}
        {isAdmin ? (
          <Link
            href="/ac-mapping"
            className="group relative flex flex-col items-center justify-center p-2.5 sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:p-3 rounded-2xl bg-card border border-emerald-500/30 bg-emerald-500/5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-200 active:scale-95 text-center sm:text-left"
          >
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 py-0.2 rounded-full text-[7.5px] sm:text-[8px] font-extrabold bg-emerald-500 text-white tracking-wider shadow-xs">
              DEV
            </span>
            <div className="size-10 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/15 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <IconLayoutGrid className="size-5" />
            </div>
            <div className="mt-1.5 sm:mt-0 flex flex-col items-center sm:items-start min-w-0 flex-1 w-full sm:w-auto">
              <span className="text-[11.5px] sm:text-xs font-bold text-foreground/90 leading-tight tracking-tight">
                Mapping AC
              </span>
              <span className="text-[9px] sm:text-[10.5px] text-muted-foreground truncate w-full mt-0.5">
                Layout denah
              </span>
            </div>
          </Link>
        ) : (
          <div className="relative flex flex-col items-center justify-center p-2.5 sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:p-3 rounded-2xl bg-muted/20 border border-border/40 shadow-xs opacity-60 cursor-not-allowed select-none text-center sm:text-left">
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 py-0.2 rounded-full text-[7.5px] sm:text-[8px] font-bold bg-muted-foreground/20 text-muted-foreground tracking-wider">
              SOON
            </span>
            <div className="size-10 rounded-xl bg-muted-foreground/15 flex items-center justify-center text-muted-foreground shrink-0">
              <IconLayoutGrid className="size-5" />
            </div>
            <div className="mt-1.5 sm:mt-0 flex flex-col items-center sm:items-start min-w-0 flex-1 w-full sm:w-auto">
              <span className="text-[11.5px] sm:text-xs font-bold text-muted-foreground leading-tight tracking-tight">
                Mapping AC
              </span>
              <span className="text-[9px] sm:text-[10.5px] text-muted-foreground/80 truncate w-full mt-0.5">
                Segera hadir
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
