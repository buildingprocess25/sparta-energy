import type { ComponentType, ReactNode } from "react"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  IconArrowRight,
  IconCheck,
  IconClipboardCheck,
  IconExternalLink,
  IconGauge,
  IconLayoutDashboard,
} from "@tabler/icons-react"

import { AdminEntryLogoutButton } from "@/components/admin/admin-entry-logout-button"
import { Logo } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/lib/auth"
import {
  getPendingValidationCount,
  getValidationAudits,
  parseValidationFilters,
} from "@/lib/audit-validation-queries"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

const ENERGY_METER_URL = "https://energy-meter-un89.onrender.com/"
const numberFormat = new Intl.NumberFormat("id-ID")

type DestinationCardProps = {
  href: string
  external?: boolean
  icon: ComponentType<{ className?: string }>
  iconClassName: string
  title: string
  badge: string
  description: string
  items: string[]
  cta: string
  className?: string
  layout?: "stacked" | "wide"
}

function DestinationCard({
  href,
  external = false,
  icon: Icon,
  iconClassName,
  title,
  badge,
  description,
  items,
  cta,
  className,
  layout = "stacked",
}: DestinationCardProps) {
  const isWide = layout === "wide"
  const content = (
    <>
      <div className={cn("flex gap-4", isWide ? "items-center" : "flex-col")}>
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            iconClassName
          )}
        >
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold leading-tight">{title}</h2>
            <Badge variant="secondary">{badge}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <ul
        className={cn(
          "flex flex-col gap-2 text-sm",
          isWide && "sm:flex-row sm:flex-wrap sm:gap-x-6"
        )}
      >
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <IconCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        {cta}
        {external ? (
          <IconExternalLink aria-hidden="true" className="size-4" />
        ) : (
          <IconArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        )}
      </span>
    </>
  )

  const cardClassName = cn(
    "group flex h-full flex-col gap-5 rounded-xl border bg-card p-5 text-card-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none md:p-6",
    className
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cardClassName}>
        {content}
        <span className="sr-only">(terbuka di tab baru)</span>
      </a>
    )
  }

  return (
    <Link href={href} className={cardClassName}>
      {content}
    </Link>
  )
}

function StatLink({
  href,
  value,
  label,
  valueClassName,
}: {
  href: string
  value: number | null
  label: ReactNode
  valueClassName?: string
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-24 flex-col justify-between gap-2 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span
        className={cn(
          "text-3xl font-black tracking-tight tabular-nums",
          value === null && "text-base font-semibold text-muted-foreground",
          valueClassName
        )}
      >
        {value === null ? "Gagal dimuat" : numberFormat.format(value)}
      </span>
      <span className="flex items-end justify-between gap-2 text-sm text-muted-foreground">
        <span>{label}</span>
        <IconArrowRight aria-hidden="true" className="size-4 shrink-0" />
      </span>
    </Link>
  )
}

export default async function AdminEntryPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login?reason=session-expired")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true, role: true },
  })

  if (!user) redirect("/forbidden")
  if (user.role !== "ADMIN") redirect("/dashboard")

  const [pendingResult, borosResult] = await Promise.allSettled([
    getPendingValidationCount(),
    getValidationAudits(
      parseValidationFilters({ result: "boros", status: "pending" })
    ),
  ])
  const pendingCount =
    pendingResult.status === "fulfilled" ? pendingResult.value : null
  const borosPendingCount =
    borosResult.status === "fulfilled" ? borosResult.value.total : null

  const name = user.fullName ?? "Admin"

  return (
    <main className="flex min-h-dvh w-full flex-col bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Logo className="origin-left scale-90" />
          <div className="flex items-center gap-3">
            <span className="hidden max-w-56 truncate text-sm font-medium text-muted-foreground md:block">
              {name}
            </span>
            <AdminEntryLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 content-center gap-8 px-4 py-8 md:px-8 md:py-12 lg:grid-cols-12 lg:gap-10">
        <section className="flex flex-col gap-6 lg:col-span-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-primary">Halo, {name}</p>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Mau kerja di mana hari ini?
            </h1>
            <p className="text-sm text-muted-foreground">
              Pilih Mode Auditor untuk kerja di toko, Dashboard Admin untuk
              memantau semua cabang, atau Smart Energy Meter untuk melihat
              data perangkat meter.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatLink
              href="/audit/validation?status=pending"
              value={pendingCount}
              label="toko menunggu validasi"
            />
            <StatLink
              href="/audit/validation?result=boros&status=pending"
              value={borosPendingCount}
              label="toko boros belum dicek"
              valueClassName="text-[#b23f39] dark:text-[#e07a74]"
            />
          </div>
        </section>

        <section
          aria-label="Pilih tujuan"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-8"
        >
          <DestinationCard
            href="/dashboard"
            icon={IconClipboardCheck}
            iconClassName="bg-primary text-primary-foreground"
            title="Mode Auditor"
            badge="Mobile"
            description="Hitung konsumsi energi langsung di toko lewat HP."
            items={[
              "Kalkulator konsumsi energi toko",
              "Kalkulator AC, lampu, dan Store MEP Simulator",
              "Validasi kalkulator konsumsi energi toko",
            ]}
            cta="Buka Mode Auditor"
          />
          <DestinationCard
            href="/admin/dashboard"
            icon={IconLayoutDashboard}
            iconClassName="bg-secondary text-secondary-foreground"
            title="Dashboard Admin"
            badge="Desktop"
            description="Pantau hasil audit semua cabang."
            items={[
              "Ringkasan hemat dan boros per cabang",
              "Data audit, toko, dan master alat",
              "Laporan Excel dan kelola user",
            ]}
            cta="Buka Dashboard Admin"
          />
          <DestinationCard
            href={ENERGY_METER_URL}
            external
            layout="wide"
            className="md:col-span-2"
            icon={IconGauge}
            iconClassName="bg-secondary text-secondary-foreground"
            title="Smart Energy Meter"
            badge="Aplikasi terpisah"
            description="Pantau listrik toko dari perangkat meter yang terpasang."
            items={[
              "Tegangan, arus, dan daya per fase secara langsung",
              "Riwayat rekaman perangkat",
              "Atur perangkat per toko",
            ]}
            cta="Buka di tab baru"
          />
        </section>
      </div>
    </main>
  )
}
