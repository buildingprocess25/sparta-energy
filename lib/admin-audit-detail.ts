import { isAdminSangatBoros } from "@/lib/admin-sangat-boros"
import { getIotStatusLookup, getStoreIot } from "@/lib/iot-status"
import { prisma } from "@/lib/prisma"

const areaLabels: Record<string, string> = {
  PARKING: "Parkir",
  TERRACE: "Teras",
  SALES: "Sales",
  WAREHOUSE: "Gudang, Toilet & Selasar",
}

function toNumber(value: unknown) {
  return Number(value ?? 0)
}

function calculateGapPercent(actual: number, baseline: number) {
  if (baseline <= 0) return null
  return Math.round(((actual - baseline) / baseline) * 1000) / 10
}

function getAreaLabel(value: string) {
  return areaLabels[value] ?? value
}

export async function getAdminAuditDetail(id: string) {
  const audit = await prisma.audit.findUnique({
    where: { id },
    select: {
      id: true,
      auditDate: true,
      status: true,
      isBoros: true,
      totalEstimatedKwhPerMonth: true,
      avgActualPlnKwhPerMonth: true,
      validationStatus: true,
      validatedAt: true,
      originalIsBoros: true,
      originalTotalEstimatedKwhPerMonth: true,
      originalAvgActualPlnKwhPerMonth: true,
      corrections: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          summary: true,
          createdAt: true,
          validator: { select: { fullName: true, email: true } },
        },
      },
      auditor: {
        select: {
          fullName: true,
          email: true,
        },
      },
      validatedBy: {
        select: {
          fullName: true,
          email: true,
        },
      },
      energyAudits: {
        select: {
          category: true,
          status: true,
          completedAt: true,
        },
      },
      store: {
        select: {
          id: true,
          code: true,
          name: true,
          branch: true,
          type: true,
          plnCustomerId: true,
          plnPowerVa: true,
          is24Hours: true,
          openTime: true,
          closeTime: true,
          salesAreaM2: true,
          parkingAreaM2: true,
          terraceAreaM2: true,
          warehouseAreaM2: true,
          toiletAreaM2: true,
          corridorAreaM2: true,
        },
      },
      plnHistory: {
        orderBy: { monthIdx: "asc" },
        select: {
          billingMonth: true,
          monthIdx: true,
          plnUsageKwh: true,
          salesTransactionPerDay: true,
        },
      },
      items: {
        orderBy: [{ areaTarget: "asc" }, { customName: "asc" }],
        select: {
          areaTarget: true,
          customName: true,
          brandName: true,
          qty: true,
          operationalHours: true,
          baseKw: true,
          estimatedDailyKwh: true,
          equipmentType: {
            select: {
              name: true,
            },
          },
          equipmentBrand: {
            select: {
              name: true,
            },
          },
        },
      },
      recommendations: {
        select: {
          type: true,
          title: true,
          description: true,
        },
      },
    },
  })

  if (!audit) return null

  const [isSangatBoros, iotLookup] = await Promise.all([
    isAdminSangatBoros(audit.id),
    getIotStatusLookup(),
  ])

  const actualPln = toNumber(audit.avgActualPlnKwhPerMonth)
  const baseline = toNumber(audit.totalEstimatedKwhPerMonth)
  const gapKwh = actualPln - baseline
  const gapPercent = calculateGapPercent(actualPln, baseline)
  const totalAreaM2 =
    toNumber(audit.store.salesAreaM2) +
    toNumber(audit.store.parkingAreaM2) +
    toNumber(audit.store.terraceAreaM2) +
    toNumber(audit.store.warehouseAreaM2) +
    toNumber(audit.store.toiletAreaM2) +
    toNumber(audit.store.corridorAreaM2)
  const totalDailyKwh = audit.items.reduce(
    (total, item) => total + toNumber(item.estimatedDailyKwh),
    0
  )
  const totalQty = audit.items.reduce((total, item) => total + item.qty, 0)
  const completenessItems = [
    {
      label: "Identitas toko",
      complete: Boolean(
        audit.store.code && audit.store.name && audit.store.branch
      ),
    },
    { label: "PLN history", complete: audit.plnHistory.length > 0 },
    { label: "Equipment", complete: audit.items.length > 0 },
    { label: "Rekomendasi", complete: audit.recommendations.length > 0 },
  ]
  const completedFields = completenessItems.filter(
    (item) => item.complete
  ).length

  return {
    id: audit.id,
    auditDate: audit.auditDate.toISOString(),
    status: audit.status,
    isBoros: audit.isBoros,
    isSangatBoros,
    iot: getStoreIot(iotLookup, audit.store.code),
    validation: {
      validated: audit.validationStatus === "VALIDATED",
      validatedAt: audit.validatedAt?.toISOString() ?? null,
      validatedBy: audit.validatedBy
        ? (audit.validatedBy.fullName ?? audit.validatedBy.email)
        : null,
    },
    original:
      audit.originalTotalEstimatedKwhPerMonth === null
        ? null
        : {
            isBoros: audit.originalIsBoros === true,
            baseline: toNumber(audit.originalTotalEstimatedKwhPerMonth),
            actualPln: toNumber(audit.originalAvgActualPlnKwhPerMonth),
          },
    corrections: audit.corrections.map((correction) => ({
      id: correction.id,
      summary: correction.summary,
      createdAt: correction.createdAt.toISOString(),
      validator:
        correction.validator?.fullName ?? correction.validator?.email ?? null,
    })),
    energyAudits: audit.energyAudits.map((item) => ({
      category: item.category,
      status: item.status,
      completedAt: item.completedAt?.toISOString() ?? null,
    })),
    actualPln,
    baseline,
    gapKwh,
    gapPercent,
    totalDailyKwh,
    totalMonthlyKwh: totalDailyKwh * 30,
    totalQty,
    auditor: {
      name: audit.auditor.fullName ?? audit.auditor.email,
      email: audit.auditor.email,
    },
    store: {
      id: audit.store.id,
      code: audit.store.code,
      name: audit.store.name,
      branch: audit.store.branch,
      type: audit.store.type,
      plnCustomerId: audit.store.plnCustomerId,
      plnPowerVa: audit.store.plnPowerVa,
      is24Hours: audit.store.is24Hours,
      openTime: audit.store.openTime,
      closeTime: audit.store.closeTime,
      salesAreaM2: toNumber(audit.store.salesAreaM2),
      parkingAreaM2: toNumber(audit.store.parkingAreaM2),
      terraceAreaM2: toNumber(audit.store.terraceAreaM2),
      warehouseAreaM2: toNumber(audit.store.warehouseAreaM2),
      toiletAreaM2: toNumber(audit.store.toiletAreaM2),
      corridorAreaM2: toNumber(audit.store.corridorAreaM2),
      totalAreaM2,
    },
    plnHistory: audit.plnHistory.map((row) => ({
      billingMonth: row.billingMonth,
      monthIdx: row.monthIdx,
      plnUsageKwh: toNumber(row.plnUsageKwh),
      salesTransactionPerDay: toNumber(row.salesTransactionPerDay),
    })),
    items: audit.items.map((item) => ({
      area: getAreaLabel(item.areaTarget),
      name: item.equipmentType?.name ?? item.customName ?? "Lainnya",
      brand: item.equipmentBrand?.name ?? item.brandName ?? "-",
      qty: item.qty,
      operationalHours: toNumber(item.operationalHours),
      baseKw: toNumber(item.baseKw),
      estimatedDailyKwh: toNumber(item.estimatedDailyKwh),
    })),
    recommendations: audit.recommendations,
    dataCompleteness: {
      total: completenessItems.length,
      completed: completedFields,
      percent: Math.round((completedFields / completenessItems.length) * 100),
      items: completenessItems,
    },
  }
}
