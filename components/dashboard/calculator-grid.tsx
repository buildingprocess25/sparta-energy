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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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

        {/* Mapping AC (DEV untuk Admin, SOON untuk User Biasa) */}
        {isAdmin ? (
          <Link
            href="/ac-mapping"
            className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative group active:scale-98 transition-all hover:bg-emerald-500/10"
          >
            <div className="size-10 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/10 transition-transform group-hover:scale-105 shrink-0">
              <IconLayoutGrid className="size-5" />
            </div>
            <div className="flex flex-col text-left min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-foreground/90 leading-tight">
                  Mapping AC
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-extrabold bg-emerald-500 text-white tracking-wide">
                  DEV
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground truncate">
                Pemetaan layout & sebaran
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-border/40 shadow-xs relative opacity-60 cursor-not-allowed select-none">
            <div className="size-10 rounded-xl bg-muted-foreground/15 flex items-center justify-center text-muted-foreground shrink-0">
              <IconLayoutGrid className="size-5" />
            </div>
            <div className="flex flex-col text-left min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-muted-foreground leading-tight">
                  Mapping AC
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-muted-foreground/20 text-muted-foreground tracking-wide">
                  SOON
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground/80 truncate">
                Segera hadir
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
