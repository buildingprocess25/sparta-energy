import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  IconArrowRight,
  IconBolt,
  IconBuildingWarehouse,
  IconBulb,
  IconCoffee,
  IconFridge,
  IconPlug,
  IconWind,
} from "@tabler/icons-react"
import type { EnergyAuditCategory } from "@prisma/client"

import { AuditStatusBadge } from "@/components/energy-audit/audit-status-badge"
import { formatGap } from "@/components/audit-validation/format"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { getAuditValidator } from "@/lib/audit-validation-access"
import { ENERGY_AUDIT_CATEGORIES } from "@/lib/energy-audit-categories"
import { getEnergyAuditStore } from "@/lib/energy-audit-queries"

type Props = {
  params: Promise<{ id: string }>
}

// Icons chosen for what each category physically covers.
const categoryIcons: Record<EnergyAuditCategory, typeof IconBulb> = {
  TATA_CAHAYA: IconBulb,
  TATA_UDARA_VENTILASI: IconWind,
  REFRIGERASI: IconFridge,
  SELUBUNG_BANGUNAN: IconBuildingWarehouse,
  KELISTRIKAN: IconBolt,
  BEBAN_PASIF_STOPKONTAK: IconPlug,
  BEANSPOT: IconCoffee,
}

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" })

export default async function EnergyAuditStorePage({ params }: Props) {
  const validator = await getAuditValidator()
  if (!validator) redirect("/forbidden")

  const { id } = await params
  const store = await getEnergyAuditStore(id)
  if (!store) notFound()

  const doneCount = ENERGY_AUDIT_CATEGORIES.filter(
    (category) => store.statusByCategory[category.key]?.status === "COMPLETED"
  ).length

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-4xl flex-col bg-background px-4 md:px-6 pb-16">
      <Header
        variant="dashboard-back"
        title="Pemeriksaan Energi per Kategori"
        subtitle={`${store.store.name} · ${store.store.code}`}
        backHref="/audit/kategori"
        backLabel="Kembali ke daftar toko"
      />

      <main className="flex flex-col gap-5">
        <section className="flex flex-col gap-1 rounded-xl border bg-card p-4">
          <p className="text-sm font-semibold">{store.store.name}</p>
          <p className="text-xs text-muted-foreground">
            {store.store.code}
            {store.store.branch ? ` · ${store.store.branch}` : ""} · kalkulasi{" "}
            {dateFormat.format(new Date(store.auditDate))}
            {store.gapPercent !== null && (
              <>
                {" · "}
                <span className="font-semibold text-[#b23f39] dark:text-[#e07a74]">
                  {formatGap(store.gapPercent)} dari standar
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {store.store.address || "Alamat belum diisi. Bisa diisi di form pemeriksaan."}
          </p>
          <p className="pt-1 text-xs font-medium tabular-nums">
            {doneCount} dari {ENERGY_AUDIT_CATEGORIES.length} kategori selesai
          </p>
        </section>

        <section aria-label="Kategori pemeriksaan" className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {ENERGY_AUDIT_CATEGORIES.map((category) => {
            const Icon = categoryIcons[category.key]
            const status = store.statusByCategory[category.key]?.status ?? null

            const body = (
              <>
                <span
                  className={
                    category.available
                      ? "flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                      : "flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                  }
                >
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-semibold">{category.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {category.description}
                  </span>
                  <span className="pt-1">
                    {category.available ? (
                      <AuditStatusBadge status={status} />
                    ) : (
                      <Badge variant="secondary">Segera hadir</Badge>
                    )}
                  </span>
                </span>
              </>
            )

            if (!category.available) {
              return (
                <div
                  key={category.key}
                  aria-disabled="true"
                  className="flex items-start gap-3 rounded-xl border border-dashed bg-card/50 p-4 opacity-80"
                >
                  {body}
                </div>
              )
            }

            return (
              <Link
                key={category.key}
                href={`/audit/kategori/${store.sourceAuditId}/${category.slug}`}
                className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {body}
                <IconArrowRight
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-primary"
                />
              </Link>
            )
          })}
        </section>
      </main>
    </div>
  )
}
