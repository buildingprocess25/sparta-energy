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
    include: {
      store: true,
      items: true,
      plnHistory: {
        orderBy: { monthIdx: "asc" },
      },
      recommendations: true,
    },
  })

  if (!audit) notFound()

  return (
    <AuditResultDB
      audit={{
        ...audit,
        totalEstimatedKwhPerMonth: audit.totalEstimatedKwhPerMonth
          ? Number(audit.totalEstimatedKwhPerMonth)
          : null,
        avgActualPlnKwhPerMonth: audit.avgActualPlnKwhPerMonth
          ? Number(audit.avgActualPlnKwhPerMonth)
          : null,
        store: {
          ...audit.store,
          salesAreaM2: Number(audit.store.salesAreaM2),
          parkingAreaM2: Number(audit.store.parkingAreaM2),
          terraceAreaM2: Number(audit.store.terraceAreaM2),
          warehouseAreaM2: Number(audit.store.warehouseAreaM2),
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
    />
  )
}
