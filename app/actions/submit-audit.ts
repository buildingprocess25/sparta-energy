"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { calculateAudit } from "@/lib/audit-kalkulator"
import { calculateGapPercent } from "@/lib/audit-recalculate"
import type { EquipmentState, PlnRowState } from "@/store/use-audit-store"
import type { AreaTarget, RecommendationType } from "@prisma/client"
import { generateRecommendationWithFallback } from "@/lib/ai-recommendation"
import { DEMO_EMAIL } from "@/lib/demo-config"
import { getServerErrorMessage } from "@/lib/error-handling"

// Map area name string → AreaTarget enum
function toAreaTarget(areaName: string): AreaTarget {
  const name = areaName.toLowerCase()
  if (name.includes("parkir")) return "PARKING"
  if (name.includes("teras")) return "TERRACE"
  if (name.includes("sales")) return "SALES"
  return "WAREHOUSE"
}

type SubmitAuditInput = {
  auditId?: string | null
  // Step 1
  storeCode: string
  storeType: string
  is24Hours: boolean
  openTime: string
  closeTime: string
  plnPowerVa: number
  areas: {
    sales: number
    parkir: number
    teras: number
    gudang: number
    toilet: number
    selasar: number
  }
  // Step 2
  equipments: (EquipmentState & { brandId?: string; brandName?: string })[]
  // Step 3
  plnHistory: PlnRowState[]
}

export async function submitAudit(input: SubmitAuditInput) {
  try {
    // ── 1. Get session ───────────────────────────────────────────────────────
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return {
        error: {
          type: "auth",
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
        },
      }
    }

    const userId = session.user.id

    // ── DEMO GUARD: jika user demo, hitung tapi TIDAK tulis ke DB ────────────
    if (session.user.email === DEMO_EMAIL) {
      const calc = calculateAudit(input.equipments, input.plnHistory, {
        is24Hours: input.is24Hours,
        openTime: input.openTime,
        closeTime: input.closeTime,
        areas: {
          sales: input.areas.sales,
          parkir: input.areas.parkir,
          teras: input.areas.teras,
          gudang: input.areas.gudang,
        },
        plnPowerVa: input.plnPowerVa,
      })

      const auditSummary = `
Toko: ${input.storeCode}
Jam Buka: ${input.openTime} - ${input.closeTime} (${input.is24Hours ? "24 Jam" : "Non-24 Jam"})
Daya PLN: ${input.plnPowerVa} VA
Status Efisiensi: ${calc.isBoros ? "BOROS" : "HEMAT"}
Estimasi Kebutuhan Alat: ${calc.equipmentEstimateKwhPerMonth.toFixed(0)} kWh/bulan
Aktual Rata-rata PLN: ${calc.avgActualPlnKwhPerMonth.toFixed(0)} kWh/bulan
Tipe Rekomendasi: ${calc.recommendationType}
Daftar Peralatan:
${calc.itemRows.map((row) => `- ${row.qty}x ${row.equipment.name} = ${row.estimatedDailyKwh.toFixed(1)} kWh/hari`).join("\n")}
`
      let rec = {
        type: calc.recommendationType as RecommendationType,
        title: "",
        description: "",
      }
      try {
        rec = await generateRecommendationWithFallback(auditSummary)
      } catch {
        const recMap: Record<string, { title: string; description: string }> = {
          TRAINING: {
            title: "Pelatihan SOP Operasional",
            description:
              "Ditemukan indikasi alat beroperasi melebihi jam buka toko. Rekomendasi: lakukan training SOP kepada karyawan.",
          },
          REPAIR: {
            title: "Perbaikan & Pengecekan Peralatan",
            description:
              "Konsumsi listrik aktual melebihi estimasi. Rekomendasi: lakukan pengecekan fisik peralatan.",
          },
          MAINTENANCE: {
            title: "Pertahankan Efisiensi",
            description:
              "Konsumsi listrik berada dalam ambang batas normal. Lanjutkan kebiasaan operasional yang baik.",
          },
        }
        const fallback =
          recMap[calc.recommendationType] ?? recMap["MAINTENANCE"]
        rec.title = fallback.title
        rec.description = fallback.description
      }

      const items = calc.itemRows.map((row) => ({
        areaTarget: toAreaTarget(row.equipment.areaName),
        customName: row.equipment.name,
        qty: row.qty,
        operationalHours: row.operationalHours,
        baseKw: row.baseKw,
        estimatedDailyKwh: row.estimatedDailyKwh,
      }))

      return {
        demoAuditResult: {
          id: "demo",
          isBoros: calc.isBoros,
          totalEstimatedKwhPerMonth: calc.equipmentEstimateKwhPerMonth,
          avgActualPlnKwhPerMonth: calc.avgActualPlnKwhPerMonth,
          auditDate: new Date().toISOString(),
          store: {
            code: input.storeCode,
            name: input.storeCode,
            salesAreaM2: input.areas.sales,
            parkingAreaM2: input.areas.parkir,
            terraceAreaM2: input.areas.teras,
            warehouseAreaM2: input.areas.gudang,
            toiletAreaM2: input.areas.toilet,
            corridorAreaM2: input.areas.selasar,
          },
          items,
          plnHistory: input.plnHistory.map((row, idx) => ({
            monthIdx: idx + 1,
            billingMonth: row.month,
            plnUsageKwh: row.kwh,
            salesTransactionPerDay: row.std,
          })),
          recommendations: [rec],
        },
      }
    }
    // ── END DEMO GUARD ───────────────────────────────────────────────────────

    // ── 2. Resolve storeId from storeCode in input ──────────────────────────
    const store = await prisma.store.findUnique({
      where: { code: input.storeCode },
      select: { id: true, name: true },
    })

    if (!store) {
      return {
        error: {
          type: "validation",
          message: "Toko tidak ditemukan.",
        },
      }
    }

    const storeId = store.id

    // Store technical data is admin-owned now: it is snapshotted on the audit
    // below and only copied back to the store when an admin validates.

    // ── 4. Run calculation ──────────────────────────────────────────────────────
    // calcMethod comes from the equipment master, for both the total and the stored rows.
    const eqTypes = await prisma.equipmentType.findMany({
      select: { id: true, name: true, calcMethod: true, calcDuration: true },
    })
    const eqTypeMap = new Map(eqTypes.map((t) => [t.name.toLowerCase().trim(), t]))

    const calc = calculateAudit(
      input.equipments,
      input.plnHistory,
      {
        is24Hours: input.is24Hours,
        openTime: input.openTime,
        closeTime: input.closeTime,
        areas: {
          sales: input.areas.sales,
          parkir: input.areas.parkir,
          teras: input.areas.teras,
          gudang: input.areas.gudang,
        },
        plnPowerVa: input.plnPowerVa,
      },
      (eq) => eqTypeMap.get(eq.name.toLowerCase().trim())
    )

    const gapPercent = calculateGapPercent(
      calc.avgActualPlnKwhPerMonth,
      calc.equipmentEstimateKwhPerMonth
    )
    const storeTechnical = {
      storeType: input.storeType || null,
      plnPowerVa: input.plnPowerVa,
      salesAreaM2: input.areas.sales,
      parkingAreaM2: input.areas.parkir,
      terraceAreaM2: input.areas.teras,
      warehouseAreaM2: input.areas.gudang,
      toiletAreaM2: input.areas.toilet,
      corridorAreaM2: input.areas.selasar,
      is24Hours: input.is24Hours,
      openTime: input.is24Hours ? null : input.openTime,
      closeTime: input.is24Hours ? null : input.closeTime,
    }

    // ── 5. Create or Update Audit record ─────────────────────────────────────────
    let audit
    if (input.auditId) {
      // Clear existing child items first to avoid duplications
      await prisma.auditItem.deleteMany({ where: { auditId: input.auditId } })
      await prisma.auditPlnStdHistory.deleteMany({ where: { auditId: input.auditId } })
      await prisma.auditRecommendation.deleteMany({ where: { auditId: input.auditId } })

      audit = await prisma.audit.update({
        where: { id: input.auditId },
        data: {
          storeId,
          auditorId: userId,
          status: "COMPLETED",
          isBoros: calc.isBoros,
          totalEstimatedKwhPerMonth: calc.equipmentEstimateKwhPerMonth,
          avgActualPlnKwhPerMonth: calc.avgActualPlnKwhPerMonth,
          gapPercent,
          ...storeTechnical,
          validationStatus: "PENDING",
          validatedAt: null,
          validatedById: null,
          auditDate: new Date(),
        },
      })
    } else {
      audit = await prisma.audit.create({
        data: {
          storeId,
          auditorId: userId,
          status: "COMPLETED",
          isBoros: calc.isBoros,
          totalEstimatedKwhPerMonth: calc.equipmentEstimateKwhPerMonth,
          avgActualPlnKwhPerMonth: calc.avgActualPlnKwhPerMonth,
          gapPercent,
          ...storeTechnical,
          auditDate: new Date(),
        },
      })
    }

    // ── 6. Create AuditItems (per equipment unit) ───────────────────────────────
    const selectedEquipments = input.equipments.filter((eq) => eq.selected)

    if (selectedEquipments.length > 0) {
      // Resolve brands
      for (const eq of selectedEquipments) {
        const bNamesToProcess = eq.brandNames?.length
          ? eq.brandNames
          : eq.brandName
            ? [eq.brandName]
            : []
        const bIdsToProcess = eq.brandIds?.length
          ? eq.brandIds
          : eq.brandId
            ? [eq.brandId]
            : []
        const bKwsToProcess = eq.kws?.length ? eq.kws : [eq.kw]

        const type = eqTypeMap.get(eq.name.toLowerCase().trim())
        if (type) {
          for (let i = 0; i < bNamesToProcess.length; i++) {
            const bName = bNamesToProcess[i]
            if (bName && bName.trim() !== "") {
              if (!bIdsToProcess[i]) {
                let brand = await prisma.equipmentBrand.findFirst({
                  where: {
                    equipmentTypeId: type.id,
                    name: { equals: bName.trim(), mode: "insensitive" },
                  },
                })
                if (!brand) {
                  brand = await prisma.equipmentBrand.create({
                    data: {
                      equipmentTypeId: type.id,
                      name: bName.trim(),
                      baseKw: bKwsToProcess[i] ?? eq.kw ?? 0,
                      createdById: userId,
                    },
                  })
                }
                bIdsToProcess[i] = brand.id
              }
            }
          }
        }
        eq.brandNames = bNamesToProcess
        eq.brandIds = bIdsToProcess
        eq.kws = bKwsToProcess
      }

      await prisma.auditItem.createMany({
        data: calc.itemRows.map((row) => {
          const eq = row.equipment
          return {
            auditId: audit.id,
            equipmentTypeId:
              eqTypeMap.get(eq.name.toLowerCase().trim())?.id ?? null,
            areaTarget: toAreaTarget(eq.areaName),
            customName: eq.name,
            notes: eq.notes?.trim() || null,
            brandName: eq.brandNames?.[row.unitIndex] ?? eq.brandName,
            equipmentBrandId: eq.brandIds?.[row.unitIndex] ?? eq.brandId,
            qty: row.qty,
            operationalHours: row.operationalHours,
            baseKw: row.baseKw,
            estimatedDailyKwh: row.estimatedDailyKwh,
            usageCount: row.usageCount,
          }
        }),
      })
    }

    // ── 7. Create PLN History records ───────────────────────────────────────────
    const validPln = input.plnHistory.filter((row) => row.kwh > 0)
    if (validPln.length > 0) {
      await prisma.auditPlnStdHistory.createMany({
        data: validPln.map((row, idx) => ({
          auditId: audit.id,
          monthIdx: idx + 1,
          billingMonth: row.month,
          plnUsageKwh: row.kwh,
          salesTransactionPerDay: row.std,
        })),
      })
    }

    // ── 8. Create Recommendation ────────────────────────────────────────────────
    const auditSummary = `
Toko: ${store?.name || input.storeCode}
Jam Buka: ${input.openTime} - ${input.closeTime} (${input.is24Hours ? "24 Jam" : "Non-24 Jam"})
Daya PLN: ${input.plnPowerVa} VA
Status Efisiensi: ${calc.isBoros ? "BOROS (Pemakaian aktual > estimasi wajar)" : "HEMAT (Pemakaian wajar)"}
Estimasi Kebutuhan Alat: ${calc.equipmentEstimateKwhPerMonth.toFixed(0)} kWh/bulan
Aktual Rata-rata PLN: ${calc.avgActualPlnKwhPerMonth.toFixed(0)} kWh/bulan
Tipe Rekomendasi (Hard-coded fallback calc): ${calc.recommendationType}
Daftar Peralatan (Format: Qty x Nama = Est Kwh/hari):
${calc.itemRows.map((row) => `- ${row.qty}x ${row.equipment.name} = ${row.estimatedDailyKwh.toFixed(1)} kWh/hari`).join("\n")}
`

    let finalRec = {
      type: calc.recommendationType as RecommendationType,
      title: "",
      description: "",
    }

    try {
      const aiResult = await generateRecommendationWithFallback(auditSummary)
      finalRec = aiResult
    } catch (error) {
      console.error(
        "[Submit Audit] AI Recommendation failed completely. Using static fallback.",
        error
      )

      // Static Fallback
      const recMap: Record<string, { title: string; description: string }> = {
        TRAINING: {
          title: "Pelatihan SOP Operasional",
          description:
            "Ditemukan indikasi alat beroperasi melebihi jam buka toko. Rekomendasi: lakukan training SOP kepada karyawan untuk memastikan alat dimatikan sesuai jadwal toko.",
        },
        REPAIR: {
          title: "Perbaikan & Pengecekan Peralatan",
          description:
            "Konsumsi listrik aktual melebihi estimasi peralatan meskipun jam operasional wajar. Rekomendasi: lakukan pengecekan fisik peralatan (kompresor, kabel) untuk indikasi bocor arus.",
        },
        MAINTENANCE: {
          title: "Pertahankan Efisiensi",
          description:
            "Konsumsi listrik toko berada dalam ambang batas normal. Lanjutkan kebiasaan operasional yang baik dan lakukan pengecekan rutin.",
        },
      }
      const fallbackData =
        recMap[calc.recommendationType] ?? recMap["MAINTENANCE"]
      finalRec.title = fallbackData.title
      finalRec.description = fallbackData.description
    }
    await prisma.auditRecommendation.create({
      data: {
        auditId: audit.id,
        type: finalRec.type,
        title: finalRec.title,
        description: finalRec.description,
      },
    })

    // ── 9. Return auditId for redirect ─────────────────────────────────────────
    return { auditId: audit.id }
  } catch (error) {
    return {
      error: {
        type: "server",
        message: getServerErrorMessage(error),
      },
    }
  }
}
