"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { calculateAudit, getHoursBetween } from "@/lib/audit-kalkulator"
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
${input.equipments.map((eq) => `- ${eq.quantity}x ${eq.name} = ${(eq.kw * eq.quantity * getHoursBetween(eq.startTimes[0] || "08:00", eq.endTimes[0] || "22:00")).toFixed(1)} kWh/hari`).join("\n")}
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

      const selectedEquipments = input.equipments.filter((eq) => eq.selected)
      const items = selectedEquipments.flatMap((eq) => {
        const isAC =
          eq.name.toLowerCase().includes("ac") ||
          eq.name.toLowerCase().includes("air conditioner")
        if (isAC && eq.quantity > 1) {
          return Array.from({ length: eq.quantity }, (_, i) => {
            const start = eq.startTimes[i] || "08:00"
            const end = eq.endTimes[i] || "22:00"
            const hours = getHoursBetween(start, end)
            return {
              areaTarget: toAreaTarget(eq.areaName),
              customName: eq.name,
              qty: 1,
              operationalHours: hours,
              baseKw: eq.kw,
              estimatedDailyKwh: eq.kw * hours,
            }
          })
        }
        const start = eq.startTimes[0] || "08:00"
        const end = eq.endTimes[0] || "22:00"
        const hours = getHoursBetween(start, end)
        return [
          {
            areaTarget: toAreaTarget(eq.areaName),
            customName: eq.name,
            qty: eq.quantity,
            operationalHours: hours,
            baseKw: eq.kw,
            estimatedDailyKwh: eq.kw * eq.quantity * hours,
          },
        ]
      })

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

    // ── 3. Update Store data from Step 1 input ──────────────────────────────────
    await prisma.store.update({
      where: { id: storeId },
      data: {
        type: input.storeType,
        is24Hours: input.is24Hours,
        openTime: input.is24Hours ? null : input.openTime,
        closeTime: input.is24Hours ? null : input.closeTime,
        plnPowerVa: input.plnPowerVa,
        salesAreaM2: input.areas.sales,
        parkingAreaM2: input.areas.parkir,
        terraceAreaM2: input.areas.teras,
        warehouseAreaM2: input.areas.gudang,
      },
    })

    // ── 4. Run calculation ──────────────────────────────────────────────────────
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

    // ── 5. Create Audit record ──────────────────────────────────────────────────
    const audit = await prisma.audit.create({
      data: {
        storeId,
        auditorId: userId,
        status: "COMPLETED",
        isBoros: calc.isBoros,
        totalEstimatedKwhPerMonth: calc.equipmentEstimateKwhPerMonth,
        avgActualPlnKwhPerMonth: calc.avgActualPlnKwhPerMonth,
      },
    })

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

        const type = await prisma.equipmentType.findFirst({
          where: { name: eq.name },
        })
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
        data: selectedEquipments.flatMap((eq) => {
          // For AC: create one row per unit with its own hours
          // For others: one row with qty and average hours
          const isAC =
            eq.name.toLowerCase().includes("ac") ||
            eq.name.toLowerCase().includes("air conditioner")

          if (isAC && eq.quantity > 1) {
            return Array.from({ length: eq.quantity }, (_, i) => {
              const start = eq.startTimes[i] || "08:00"
              const end = eq.endTimes[i] || "22:00"
              const hours = getHoursBetween(start, end)
              const bKw = eq.kws?.[i] ?? eq.kw ?? 0
              return {
                auditId: audit.id,
                areaTarget: toAreaTarget(eq.areaName),
                customName: eq.name,
                brandName: eq.brandNames?.[i] ?? eq.brandName,
                equipmentBrandId: eq.brandIds?.[i] ?? eq.brandId,
                qty: 1,
                operationalHours: hours,
                baseKw: bKw,
                estimatedDailyKwh: bKw * hours,
              }
            })
          }

          const start = eq.startTimes[0] || "08:00"
          const end = eq.endTimes[0] || "22:00"
          const hours = getHoursBetween(start, end)
          const bKw = eq.kws?.[0] ?? eq.kw ?? 0
          return [
            {
              auditId: audit.id,
              areaTarget: toAreaTarget(eq.areaName),
              customName: eq.name,
              brandName: eq.brandNames?.[0] ?? eq.brandName,
              equipmentBrandId: eq.brandIds?.[0] ?? eq.brandId,
              qty: eq.quantity,
              operationalHours: hours,
              baseKw: bKw,
              estimatedDailyKwh: bKw * eq.quantity * hours,
            },
          ]
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
${input.equipments.map((eq) => `- ${eq.quantity}x ${eq.name} = ${(eq.kw * eq.quantity * getHoursBetween(eq.startTimes[0] || "08:00", eq.endTimes[0] || "22:00")).toFixed(1)} kWh/hari`).join("\n")}
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
