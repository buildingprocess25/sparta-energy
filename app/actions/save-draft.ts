"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getServerErrorMessage } from "@/lib/error-handling"
import type { EquipmentState, PlnRowState, StoreType } from "@/store/use-audit-store"
import type { AreaTarget } from "@prisma/client"

// Helper to map area target names
function toAreaTarget(areaName: string): AreaTarget {
  const name = areaName.toLowerCase()
  if (name.includes("parkir")) return "PARKING"
  if (name.includes("teras")) return "TERRACE"
  if (name.includes("sales")) return "SALES"
  return "WAREHOUSE"
}

function getSingleDuration(start: string, end: string) {
  const [sh, sm] = (start || "08:00").split(":").map(Number)
  const [eh, em] = (end || "22:00").split(":").map(Number)
  let diffMinutes = eh * 60 + em - (sh * 60 + sm)
  if (diffMinutes < 0) diffMinutes += 24 * 60
  return diffMinutes / 60
}

type SaveDraftInput = {
  auditId?: string | null
  storeCode: string
  storeType?: string
  is24Hours?: boolean
  openTime?: string
  closeTime?: string
  plnPowerVa?: number
  areas?: {
    sales: number
    parkir: number
    teras: number
    gudang: number
  }
  equipments?: EquipmentState[]
  plnHistory?: PlnRowState[]
  savedAreas?: string[]
}

export async function saveAuditDraft(input: SaveDraftInput) {
  try {
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

    // 1. Resolve store ID
    const store = await prisma.store.findUnique({
      where: { code: input.storeCode },
      select: { id: true },
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

    // 2. Update store data if parameters are provided (from Step 1)
    if (input.storeType !== undefined) {
      await prisma.store.update({
        where: { id: storeId },
        data: {
          type: input.storeType,
          is24Hours: input.is24Hours,
          openTime: input.is24Hours ? null : input.openTime,
          closeTime: input.is24Hours ? null : input.closeTime,
          plnPowerVa: input.plnPowerVa,
          salesAreaM2: input.areas?.sales,
          parkingAreaM2: input.areas?.parkir,
          terraceAreaM2: input.areas?.teras,
          warehouseAreaM2: input.areas?.gudang,
        },
      })
    }

    // 3. Create or update Audit record
    let audit
    if (input.auditId) {
      audit = await prisma.audit.update({
        where: { id: input.auditId },
        data: {
          storeId,
          auditorId: userId,
          status: "DRAFT",
          auditDate: new Date(),
        },
      })
    } else {
      audit = await prisma.audit.create({
        data: {
          storeId,
          auditorId: userId,
          status: "DRAFT",
          auditDate: new Date(),
        },
      })
    }

    const auditId = audit.id

    // 4. Update AuditItems (if provided)
    if (input.equipments) {
      // Delete existing items
      await prisma.auditItem.deleteMany({
        where: { auditId },
      })

      // We only insert items that are configured/selected or present in equipments
      const selectedEquipments = input.equipments.filter((eq) => eq.selected)
      if (selectedEquipments.length > 0) {
        const itemsToCreate = []
        for (const eq of selectedEquipments) {
          const isAC =
            eq.name.toLowerCase().includes("ac") ||
            eq.name.toLowerCase().includes("air conditioner")

          if (isAC && eq.quantity > 1) {
            for (let i = 0; i < eq.quantity; i++) {
              const start = eq.startTimes?.[i] || "08:00"
              const end = eq.endTimes?.[i] || "22:00"
              const hours = getSingleDuration(start, end)
              const bKw = eq.kws?.[i] ?? eq.kw ?? 0

              itemsToCreate.push({
                auditId,
                areaTarget: toAreaTarget(eq.areaName),
                customName: eq.name,
                brandName: eq.brandNames?.[i] ?? eq.brandName ?? "",
                equipmentBrandId: eq.brandIds?.[i] ?? eq.brandId ?? null,
                qty: 1,
                operationalHours: hours,
                baseKw: bKw,
                estimatedDailyKwh: bKw * hours,
              })
            }
          } else {
            const start = eq.startTimes?.[0] || "08:00"
            const end = eq.endTimes?.[0] || "22:00"
            const hours = getSingleDuration(start, end)
            const bKw = eq.kws?.[0] ?? eq.kw ?? 0

            itemsToCreate.push({
              auditId,
              areaTarget: toAreaTarget(eq.areaName),
              customName: eq.name,
              brandName: eq.brandNames?.[0] ?? eq.brandName ?? "",
              equipmentBrandId: eq.brandIds?.[0] ?? eq.brandId ?? null,
              qty: eq.quantity,
              operationalHours: hours,
              baseKw: bKw,
              estimatedDailyKwh: bKw * eq.quantity * hours,
            })
          }
        }

        if (itemsToCreate.length > 0) {
          await prisma.auditItem.createMany({
            data: itemsToCreate,
          })
        }
      }
    }

    // 5. Update PLN History (if provided)
    if (input.plnHistory) {
      await prisma.auditPlnStdHistory.deleteMany({
        where: { auditId },
      })

      if (input.plnHistory.length > 0) {
        await prisma.auditPlnStdHistory.createMany({
          data: input.plnHistory.map((row, idx) => ({
            auditId,
            monthIdx: idx + 1,
            billingMonth: row.month,
            plnUsageKwh: row.kwh,
            salesTransactionPerDay: row.std,
          })),
        })
      }
    }

    return { success: true, auditId }
  } catch (error) {
    return {
      error: {
        type: "server",
        message: getServerErrorMessage(error),
      },
    }
  }
}

export async function getAuditDraft(auditId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return {
        error: {
          type: "auth",
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
        },
      }
    }

    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        auditorId: session.user.id,
        status: "DRAFT",
      },
      include: {
        store: true,
        items: true,
        plnHistory: {
          orderBy: { monthIdx: "asc" },
        },
      },
    })

    if (!audit) {
      return {
        error: {
          type: "validation",
          message: "Draf audit tidak ditemukan.",
        },
      }
    }

    const equipments: EquipmentState[] = []
    const groupedItems: Record<string, typeof audit.items> = {}

    audit.items.forEach((item) => {
      const key = `${item.areaTarget}-${item.customName}`
      if (!groupedItems[key]) {
        groupedItems[key] = []
      }
      groupedItems[key].push(item)
    })

    const fromAreaTarget = (target: AreaTarget) => {
      if (target === "PARKING") return "Parkiran"
      if (target === "TERRACE") return "Teras"
      if (target === "SALES") return "Sales"
      return "Gudang, Toilet & Selasar"
    }

    const savedAreasSet = new Set<string>()

    Object.entries(groupedItems).forEach(([key, items]) => {
      const first = items[0]
      const areaName = fromAreaTarget(first.areaTarget)
      savedAreasSet.add(areaName)

      const isAC =
        (first.customName || "").toLowerCase().includes("ac") ||
        (first.customName || "").toLowerCase().includes("air conditioner")

      let quantity = 0
      let startTimes: string[] = []
      let endTimes: string[] = []
      let brandIds: (string | undefined)[] = []
      let brandNames: string[] = []
      let kws: number[] = []

      const formatTime = (hours: number) => {
        const startHour = 8
        let endHour = startHour + Math.round(hours)
        if (endHour >= 24) endHour = 23
        const pad = (n: number) => String(n).padStart(2, "0")
        return {
          start: `${pad(startHour)}:00`,
          end: `${pad(endHour)}:00`,
        }
      }

      if (isAC) {
        quantity = items.length
        items.forEach((item) => {
          const t = formatTime(Number(item.operationalHours))
          startTimes.push(t.start)
          endTimes.push(t.end)
          brandIds.push(item.equipmentBrandId || undefined)
          brandNames.push(item.brandName || "")
          kws.push(Number(item.baseKw))
        })
      } else {
        quantity = items.reduce((sum, item) => sum + item.qty, 0)
        const t = formatTime(Number(first.operationalHours))
        startTimes = Array(quantity).fill(t.start)
        endTimes = Array(quantity).fill(t.end)
        brandIds = Array(quantity).fill(first.equipmentBrandId || undefined)
        brandNames = Array(quantity).fill(first.brandName || "")
        kws = Array(quantity).fill(Number(first.baseKw))
      }

      equipments.push({
        id: first.id,
        areaName,
        name: first.customName || "",
        brandId: first.equipmentBrandId || undefined,
        brandName: first.brandName || undefined,
        brandIds,
        brandNames,
        kw: Number(first.baseKw),
        kws,
        quantity,
        startTimes,
        endTimes,
        selected: true,
        isConfigured: true,
      })
    })

    const plnHistory: PlnRowState[] = audit.plnHistory.map((h) => ({
      month: h.billingMonth,
      kwh: Number(h.plnUsageKwh),
      std: Number(h.salesTransactionPerDay),
    }))

    const draftData = {
      auditId: audit.id,
      storeCode: audit.store.code,
      storeName: audit.store.name,
      storeType: audit.store.type as StoreType,
      is24Hours: audit.store.is24Hours,
      openTime: audit.store.openTime || "07:00",
      closeTime: audit.store.closeTime || "22:00",
      plnPowerVa: audit.store.plnPowerVa,
      areas: {
        sales: Number(audit.store.salesAreaM2),
        parkir: Number(audit.store.parkingAreaM2),
        teras: Number(audit.store.terraceAreaM2),
        gudang: Number(audit.store.warehouseAreaM2),
      },
      equipments,
      savedAreas: Array.from(savedAreasSet),
      plnHistory,
    }

    return { success: true, draftData }
  } catch (error) {
    return {
      error: {
        type: "server",
        message: getServerErrorMessage(error),
      },
    }
  }
}

export async function deleteAuditDraft(auditId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return {
        error: {
          type: "auth",
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
        },
      }
    }

    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        auditorId: session.user.id,
        status: "DRAFT",
      },
    })

    if (!audit) {
      return {
        error: {
          type: "validation",
          message: "Draf audit tidak ditemukan.",
        },
      }
    }

    await prisma.auditItem.deleteMany({ where: { auditId } })
    await prisma.auditPlnStdHistory.deleteMany({ where: { auditId } })
    await prisma.audit.delete({ where: { id: auditId } })

    return { success: true }
  } catch (error) {
    return {
      error: {
        type: "server",
        message: getServerErrorMessage(error),
      },
    }
  }
}
