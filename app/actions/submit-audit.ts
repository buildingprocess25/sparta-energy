"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { calculateAudit } from "@/lib/audit-kalkulator"
import { calculateGapPercent } from "@/lib/audit-recalculate"
import { toAuditTechnical } from "@/lib/audit-technical"
import { getFallbackRecommendation } from "@/lib/recommendation-fallback"
import { matchMasterBrand } from "@/lib/brand-match"
import { syncCustomEquipmentSubmissions } from "@/lib/custom-equipment"
import type { EquipmentState, PlnRowState } from "@/store/use-audit-store"
import type { AreaTarget, RecommendationType } from "@prisma/client"
import { generateRecommendationWithFallback } from "@/lib/ai-recommendation"
import { DEMO_EMAIL } from "@/lib/demo-config"
import { getServerErrorMessage } from "@/lib/error-handling"

// Thrown inside the transaction so nothing is written when the draft check fails.
class DraftNotSubmittableError extends Error {
  constructor() {
    super("Draf ini sudah dikirim atau bukan milik Anda. Mulai kalkulasi baru dari dashboard.")
  }
}

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
      let rec: { type: RecommendationType; title: string; description: string }
      try {
        rec = await generateRecommendationWithFallback(auditSummary)
      } catch {
        rec = getFallbackRecommendation(calc.recommendationType)
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
    const storeTechnical = toAuditTechnical(input)

    // The AI waterfall can take several seconds, so it runs before the transaction opens.
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

    let finalRec: { type: RecommendationType; title: string; description: string }
    try {
      finalRec = await generateRecommendationWithFallback(auditSummary)
    } catch (error) {
      console.error(
        "[Submit Audit] AI Recommendation failed completely. Using static fallback.",
        error
      )
      finalRec = getFallbackRecommendation(calc.recommendationType)
    }

    const selectedEquipments = input.equipments.filter((eq) => eq.selected)
    const validPln = input.plnHistory.filter((row) => row.kwh > 0)

    // Every write lands together or not at all, so a failed submit leaves the draft intact.
    const audit = await prisma.$transaction(
      async (tx) => {
        let audit
        if (input.auditId) {
          // Only the auditor's own unsent draft may be submitted over; anything else
          // would wipe another audit's items or undo a validation.
          const draft = await tx.audit.findFirst({
            where: { id: input.auditId, auditorId: userId, status: "DRAFT" },
            select: { id: true },
          })
          if (!draft) throw new DraftNotSubmittableError()

          await tx.auditItem.deleteMany({ where: { auditId: draft.id } })
          await tx.auditPlnStdHistory.deleteMany({ where: { auditId: draft.id } })
          await tx.auditRecommendation.deleteMany({ where: { auditId: draft.id } })

          audit = await tx.audit.update({
            where: { id: draft.id },
            data: {
              storeId,
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
          audit = await tx.audit.create({
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

        const customEquipmentIds = await syncCustomEquipmentSubmissions(tx, {
          auditId: audit.id,
          storeId,
          userId,
          equipments: selectedEquipments,
          masterNames: new Set(eqTypeMap.keys()),
          toAreaTarget,
        })

        if (selectedEquipments.length > 0) {
          const usedTypeIds = selectedEquipments
            .map((eq) => eqTypeMap.get(eq.name.toLowerCase().trim())?.id)
            .filter((id): id is string => Boolean(id))
          const masterBrands = await tx.equipmentBrand.findMany({
            where: { equipmentTypeId: { in: usedTypeIds } },
            select: { id: true, equipmentTypeId: true, name: true },
          })

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
              // A brand typed in the field is never added to the master here: unknown
              // names stay on this audit's rows and wait in "Merek dari lapangan".
              for (let i = 0; i < bNamesToProcess.length; i++) {
                if (bIdsToProcess[i]) continue
                const brand = matchMasterBrand(masterBrands, type.id, bNamesToProcess[i])
                if (brand) bIdsToProcess[i] = brand.id
              }
            }
            eq.brandNames = bNamesToProcess
            eq.brandIds = bIdsToProcess
            eq.kws = bKwsToProcess
          }

          await tx.auditItem.createMany({
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
                customEquipmentId: customEquipmentIds.get(eq.id) ?? null,
              }
            }),
          })
        }

        if (validPln.length > 0) {
          await tx.auditPlnStdHistory.createMany({
            data: validPln.map((row, idx) => ({
              auditId: audit.id,
              monthIdx: idx + 1,
              billingMonth: row.month,
              plnUsageKwh: row.kwh,
              salesTransactionPerDay: row.std,
            })),
          })
        }

        await tx.auditRecommendation.create({
          data: {
            auditId: audit.id,
            type: finalRec.type,
            title: finalRec.title,
            description: finalRec.description,
          },
        })

        return audit
      },
      // A large store's custom equipment and item writes can pass Prisma's 5 s default.
      { timeout: 15_000 }
    )

    // ── 9. Return auditId for redirect ─────────────────────────────────────────
    return { auditId: audit.id }
  } catch (error) {
    if (error instanceof DraftNotSubmittableError) {
      return { error: { type: "validation", message: error.message } }
    }
    return {
      error: {
        type: "server",
        message: getServerErrorMessage(error),
      },
    }
  }
}
