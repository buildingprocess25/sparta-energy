import Image from "next/image"
import Link from "next/link"
import {
  IconArrowRight,
  IconBolt,
  IconChartBar,
  IconSparkles,
} from "@tabler/icons-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import landingImage from "../assets/landing.png"

export default function Page() {
  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background px-4 py-8 md:p-8">
      {/* Background Ambient Glows & Grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-25"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] md:h-[650px] md:w-[650px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-10 z-0 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]"
        aria-hidden="true"
      />

      {/* Main Container: Mobile fullscreen card, Desktop elevated glassmorphic panel */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col justify-between rounded-3xl border-0 bg-transparent p-2 md:max-w-4xl md:border md:border-border/60 md:bg-card/80 md:p-10 md:shadow-2xl md:backdrop-blur-xl lg:p-12">
        <div className="grid w-full items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* Left Column (Desktop) / Top Section (Mobile): Image Illustration */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative flex w-full max-w-[280px] items-center justify-center md:max-w-[340px]">
              <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-2xl md:blur-3xl" />
              <Image
                src={landingImage}
                alt="SPARTA Energy Illustration"
                width={420}
                height={420}
                className="aspect-square w-full object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
                priority
              />
            </div>
          </div>

          {/* Right Column (Desktop) / Bottom Section (Mobile): Info & Action */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-4 flex items-center justify-center md:justify-start">
              <Logo className="scale-100 md:scale-105" />
            </div>

            <div className="mb-3">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary"
              >
                <IconSparkles className="size-3.5" />
                Sistem Audit &amp; Efisiensi Energi
              </Badge>
            </div>

            <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Kendalikan Energi Toko
            </h1>

            <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Platform audit cerdas untuk memantau beban peralatan listrik,
              mendeteksi pemborosan kWh, dan memberikan rekomendasi optimasi.
            </p>

            {/* Feature Highlights on Desktop */}
            <div className="mb-8 hidden w-full grid-cols-2 gap-3 text-left md:grid">
              <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconBolt className="size-4" />
                </span>
                <span className="text-xs font-medium text-foreground">
                  Audit Beban Alat
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconChartBar className="size-4" />
                </span>
                <span className="text-xs font-medium text-foreground">
                  Analitik Boros/Hemat
                </span>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="w-full">
              <Button
                asChild
                size="lg"
                className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30"
              >
                <Link href="/login">
                  Mulai Sekarang
                  <IconArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
