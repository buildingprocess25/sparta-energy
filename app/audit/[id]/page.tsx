import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuditResultDB } from "@/components/audit/result-db"

type Props = {
  params: Promise<{ id: string }>
}

export default async function AuditResultPage({ params }: Props) {
  const { id } = await params

  const audit = await prisma.audit.findUnique({
    where: { id },
    omit: { gapPercent: true },
    include: {
      store: true,
      items: true,
      plnHistory: {
        orderBy: { monthIdx: "asc" },
      },
      recommendations: true,
      validatedBy: { select: { fullName: true, email: true } },
    },
  })

  if (!audit) notFound()

  // Decimal columns cannot cross to the client component, so they are pulled
  // out here; areas recorded on the audit win over the current store row.
  const {
    salesAreaM2,
    parkingAreaM2,
    terraceAreaM2,
    warehouseAreaM2,
    toiletAreaM2,
    corridorAreaM2,
    ...auditFields
  } = audit

  return (
    <AuditResultDB
      audit={{
        ...auditFields,
        totalEstimatedKwhPerMonth: audit.totalEstimatedKwhPerMonth
          ? Number(audit.totalEstimatedKwhPerMonth)
          : null,
        avgActualPlnKwhPerMonth: audit.avgActualPlnKwhPerMonth
          ? Number(audit.avgActualPlnKwhPerMonth)
          : null,
        store: {
          ...audit.store,
          salesAreaM2: Number(salesAreaM2 ?? audit.store.salesAreaM2),
          parkingAreaM2: Number(parkingAreaM2 ?? audit.store.parkingAreaM2),
          terraceAreaM2: Number(terraceAreaM2 ?? audit.store.terraceAreaM2),
          warehouseAreaM2: Number(warehouseAreaM2 ?? audit.store.warehouseAreaM2),
          toiletAreaM2: Number(toiletAreaM2 ?? audit.store.toiletAreaM2),
          corridorAreaM2: Number(corridorAreaM2 ?? audit.store.corridorAreaM2),
        },
        items: audit.items.map((item) => ({
          ...item,
          operationalHours: Number(item.operationalHours),
          baseKw: Number(item.baseKw),
          estimatedDailyKwh: Number(item.estimatedDailyKwh),
        })),
        plnHistory: audit.plnHistory.map((row) => ({
          ...row,
          plnUsageKwh: Number(row.plnUsageKwh),
          salesTransactionPerDay: Number(row.salesTransactionPerDay),
        })),
      }}
      validation={
        audit.validationStatus === "VALIDATED" && audit.validatedAt
          ? {
              validatedBy:
                audit.validatedBy?.fullName ?? audit.validatedBy?.email ?? "Admin",
              validatedAt: audit.validatedAt.toISOString(),
            }
          : null
      }
      dashboardHref="/dashboard"
      dashboardLabel="Kembali ke Dashboard"
    />
  )
}
