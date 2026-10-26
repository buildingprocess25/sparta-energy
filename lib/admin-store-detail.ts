import type { EnergyAuditCategory, EnergyAuditStatus } from "@prisma/client"

type AreaTarget = "PARKING" | "TERRACE" | "SALES" | "WAREHOUSE"
type RecommendationType = "TRAINING" | "REPAIR" | "MAINTENANCE"

export type AdminStoreDetailInput = {
  store: {
    id: string
    code: string
    name: string
    branch: string | null
    plnCustomerId: string | null
    type: string
    is24Hours: boolean
    openTime: string | null
    closeTime: string | null
    plnPowerVa: number | string | { toString(): string }
    salesAreaM2: number | string | { toString(): string }
    parkingAreaM2: number | string | { toString(): string }
    terraceAreaM2: number | string | { toString(): string }
    warehouseAreaM2: number | string | { toString(): string }
  }
  audits: Array<{
    id: string
    auditDate: Date | string
    isBoros: boolean | null
    validationStatus?: "PENDING" | "VALIDATED"
    energyAudits?: Array<{
      category: EnergyAuditCategory
      status: EnergyAuditStatus
    }>
    totalEstimatedKwhPerMonth: number | string | { toString(): string } | null
    avgActualPlnKwhPerMonth:
      | number
      | string
      | { toString(): string }
      | null
    auditor: {
      fullName: string | null
      email: string
    }
    recommendations: Array<{
      type: RecommendationType
      title: string
      description: string
    }>
    items: Array<{
      areaTarget: AreaTarget
      customName: string | null
      brandName: string
      qty: number
      operationalHours: number | string | { toString(): string }
      baseKw: number | string | { toString(): string }
      estimatedDailyKwh: number | string | { toString(): string }
      equipmentType: { name: string } | null
      equipmentBrand: { name: string } | null
    }>
    plnHistory: Array<{
      monthIdx: number
      billingMonth: string
      plnUsageKwh: number | string | { toString(): string }
      salesTransactionPerDay: number | string | { toString(): string }
    }>
  }>
}

const AREA_LABELS: Record<AreaTarget, string> = {
  SALES: "Sales Area",
  PARKING: "Parkir",
  TERRACE: "Teras",
  WAREHOUSE: "Gudang",
}

const requiredStoreFields: Array<{
  key: keyof AdminStoreDetailInput["store"]
  label: string
  isComplete: (value: AdminStoreDetailInput["store"][keyof AdminStoreDetailInput["store"]]) => boolean
}> = [
  { key: "code", label: "Kode toko", isComplete: Boolean },
  { key: "name", label: "Nama toko", isComplete: Boolean },
  { key: "branch", label: "Cabang", isComplete: Boolean },
  { key: "type", label: "Tipe toko", isComplete: Boolean },
  { key: "plnCustomerId", label: "ID pelanggan PLN", isComplete: Boolean },
  { key: "plnPowerVa", label: "Daya PLN", isComplete: isPositiveNumber },
  { key: "salesAreaM2", label: "Sales area", isComplete: isPositiveNumber },
  { key: "parkingAreaM2", label: "Area parkir", isComplete: isNonNegativeNumber },
  { key: "terraceAreaM2", label: "Area teras", isComplete: isNonNegativeNumber },
  {
    key: "warehouseAreaM2",
    label: "Gudang/selasar",
    isComplete: isNonNegativeNumber,
  },
]

function toNumber(value: number | string | { toString(): string } | null) {
  if (value === null) return 0
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function round(value: number, digits = 1) {
  const multiplier = 10 ** digits
  return Math.round(value * multiplier) / multiplier
}

function isPositiveNumber(value: unknown) {
  return toNumber(value as number | string | { toString(): string } | null) > 0
}

function isNonNegativeNumber(value: unknown) {
  return toNumber(value as number | string | { toString(): string } | null) >= 0
}

function getEquipmentName(
  item: AdminStoreDetailInput["audits"][number]["items"][number]
) {
  return item.equipmentType?.name ?? item.customName ?? "Equipment"
}

function getBrandName(
  item: AdminStoreDetailInput["audits"][number]["items"][number]
) {
  return item.equipmentBrand?.name ?? item.brandName ?? ""
}

export function buildStoreDetailViewModel(input: AdminStoreDetailInput) {
  const store = input.store
  const salesAreaM2 = toNumber(store.salesAreaM2)
  const parkingAreaM2 = toNumber(store.parkingAreaM2)
  const terraceAreaM2 = toNumber(store.terraceAreaM2)
  const warehouseAreaM2 = toNumber(store.warehouseAreaM2)
  const totalAreaM2 =
    salesAreaM2 + parkingAreaM2 + terraceAreaM2 + warehouseAreaM2

  const latestAudit = input.audits[0] ?? null
  const baseline = latestAudit
    ? toNumber(latestAudit.totalEstimatedKwhPerMonth)
    : 0
  const actual = latestAudit
    ? toNumber(latestAudit.avgActualPlnKwhPerMonth)
    : 0
  const gapKwh = actual - baseline
  const areaDivisor = totalAreaM2 || 1

  const completedFields = requiredStoreFields.filter((field) =>
    field.isComplete(store[field.key])
  )
  const missingFields = requiredStoreFields
    .filter((field) => !field.isComplete(store[field.key]))
    .map((field) => field.label)

  const items = latestAudit?.items ?? []
  const totalDailyKwh = round(
    items.reduce((total, item) => total + toNumber(item.estimatedDailyKwh), 0),
    1
  )

  const areaMap = new Map<AreaTarget, number>()
  const equipmentMap = new Map<string, { name: string; qty: number; dailyKwh: number }>()
  const brandMap = new Map<string, { name: string; qty: number; dailyKwh: number }>()

  for (const item of items) {
    const dailyKwh = toNumber(item.estimatedDailyKwh)
    areaMap.set(item.areaTarget, (areaMap.get(item.areaTarget) ?? 0) + dailyKwh)

    const equipmentName = getEquipmentName(item)
    const currentEquipment = equipmentMap.get(equipmentName) ?? {
      name: equipmentName,
      qty: 0,
      dailyKwh: 0,
    }
    currentEquipment.qty += item.qty
    currentEquipment.dailyKwh += dailyKwh
    equipmentMap.set(equipmentName, currentEquipment)

    const brandName = getBrandName(item)
    if (brandName) {
      const currentBrand = brandMap.get(brandName) ?? {
        name: brandName,
        qty: 0,
        dailyKwh: 0,
      }
      currentBrand.qty += item.qty
      currentBrand.dailyKwh += dailyKwh
      brandMap.set(brandName, currentBrand)
    }
  }

  const toRankedConsumption = <T extends { dailyKwh: number }>(
    rows: Array<T>
  ) =>
    rows
      .map((row) => ({
        ...row,
        dailyKwh: round(row.dailyKwh, 1),
        monthlyKwh: round(row.dailyKwh * 30, 0),
      }))
      .sort((a, b) => b.dailyKwh - a.dailyKwh)

  const areaBreakdown = toRankedConsumption(
    Array.from(areaMap.entries()).map(([area, dailyKwh]) => ({
      area: AREA_LABELS[area],
      dailyKwh,
    }))
  ).map((row) => ({
    ...row,
    percent: totalDailyKwh > 0 ? Math.round((row.dailyKwh / totalDailyKwh) * 100) : 0,
  }))

  const auditTimeline = input.audits.map((audit) => {
    const auditBaseline = toNumber(audit.totalEstimatedKwhPerMonth)
    const auditActual = toNumber(audit.avgActualPlnKwhPerMonth)

    return {
      id: audit.id,
      auditDate: new Date(audit.auditDate).toISOString(),
      status: audit.isBoros ? ("boros" as const) : ("hemat" as const),
      auditorName: audit.auditor.fullName ?? audit.auditor.email,
      actualPln: round(auditActual, 0),
      baseline: round(auditBaseline, 0),
      gapKwh: round(auditActual - auditBaseline, 0),
      gapPercent:
        auditBaseline > 0
          ? round(((auditActual - auditBaseline) / auditBaseline) * 100, 1)
          : null,
    }
  })

  return {
    identity: {
      ...store,
      plnPowerVa: toNumber(store.plnPowerVa),
      salesAreaM2,
      parkingAreaM2,
      terraceAreaM2,
      warehouseAreaM2,
      totalAreaM2: round(totalAreaM2, 1),
    },
    dataCompleteness: {
      percent: Math.round((completedFields.length / requiredStoreFields.length) * 100),
      completed: completedFields.length,
      total: requiredStoreFields.length,
      missingFields,
    },
    latestAudit: latestAudit
      ? {
          id: latestAudit.id,
          auditDate: new Date(latestAudit.auditDate).toISOString(),
          status: latestAudit.isBoros
            ? ("boros" as const)
            : ("hemat" as const),
          isBoros: Boolean(latestAudit.isBoros),
          actualPln: round(actual, 0),
          baseline: round(baseline, 0),
          gapKwh: round(gapKwh, 0),
          gapPercent: baseline > 0 ? round((gapKwh / baseline) * 100, 1) : null,
          actualKwhPerM2: round(actual / areaDivisor, 1),
          baselineKwhPerM2: round(baseline / areaDivisor, 1),
          recommendation: latestAudit.recommendations[0] ?? null,
          auditorName: latestAudit.auditor.fullName ?? latestAudit.auditor.email,
          validated: latestAudit.validationStatus === "VALIDATED",
          energyAudits: latestAudit.energyAudits ?? [],
        }
      : null,
    monthlyTrend:
      latestAudit?.plnHistory.map((row) => ({
        month: row.billingMonth,
        plnKwh: round(toNumber(row.plnUsageKwh), 0),
        std: round(toNumber(row.salesTransactionPerDay), 0),
        baseline: round(baseline, 0),
      })) ?? [],
    equipmentSummary: {
      totalItems: items.length,
      totalQty: items.reduce((total, item) => total + item.qty, 0),
      totalDailyKwh,
      totalMonthlyKwh: round(totalDailyKwh * 30, 0),
      areaBreakdown,
      topEquipment: toRankedConsumption(Array.from(equipmentMap.values())),
      topBrands: toRankedConsumption(Array.from(brandMap.values())),
      rows: items.map((item) => ({
        area: AREA_LABELS[item.areaTarget],
        name: getEquipmentName(item),
        brand: getBrandName(item) || "-",
        qty: item.qty,
        operationalHours: round(toNumber(item.operationalHours), 1),
        baseKw: round(toNumber(item.baseKw), 3),
        dailyKwh: round(toNumber(item.estimatedDailyKwh), 1),
        monthlyKwh: round(toNumber(item.estimatedDailyKwh) * 30, 0),
      })),
    },
    auditTimeline,
  }
}

export async function getAdminStoreDetail(storeId: string) {
  const { prisma } = await import("@/lib/prisma")

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      code: true,
      name: true,
      branch: true,
      plnCustomerId: true,
      type: true,
      is24Hours: true,
      openTime: true,
      closeTime: true,
      plnPowerVa: true,
      salesAreaM2: true,
      parkingAreaM2: true,
      terraceAreaM2: true,
      warehouseAreaM2: true,
      audits: {
        where: { status: "COMPLETED" },
        orderBy: [{ auditDate: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          auditDate: true,
          isBoros: true,
          validationStatus: true,
          energyAudits: {
            select: { category: true, status: true },
          },
          totalEstimatedKwhPerMonth: true,
          avgActualPlnKwhPerMonth: true,
          auditor: {
            select: {
              fullName: true,
              email: true,
            },
          },
          recommendations: {
            select: {
              type: true,
              title: true,
              description: true,
            },
          },
          items: {
            select: {
              areaTarget: true,
              customName: true,
              brandName: true,
              qty: true,
              operationalHours: true,
              baseKw: true,
              estimatedDailyKwh: true,
              equipmentType: {
                select: { name: true },
              },
              equipmentBrand: {
                select: { name: true },
              },
            },
          },
          plnHistory: {
            orderBy: { monthIdx: "asc" },
            select: {
              monthIdx: true,
              billingMonth: true,
              plnUsageKwh: true,
              salesTransactionPerDay: true,
            },
          },
        },
      },
    },
  })

  if (!store) return null

  const { audits, ...storeIdentity } = store
  const { isAdminSangatBoros } = await import("@/lib/admin-sangat-boros")
  const { getIotStatusLookup, getStoreIot } = await import("@/lib/iot-status")
  const [isSangatBoros, iotLookup] = await Promise.all([
    audits[0] ? isAdminSangatBoros(audits[0].id) : false,
    getIotStatusLookup(),
  ])

  return {
    ...buildStoreDetailViewModel({
      store: storeIdentity,
      audits,
    }),
    isSangatBoros,
    iot: getStoreIot(iotLookup, storeIdentity.code),
  }
}
